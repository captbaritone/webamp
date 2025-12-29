"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchGraphql, gql } from "../../legacy-client/src/utils";

interface BulkDownloadSkin {
  md5: string;
  filename: string;
  download_url: string;
  __typename: string;
}

interface DownloadProgress {
  totalSkins: number;
  completedSkins: number;
  failedSkins: number;
  estimatedSizeBytes: string;
  activeDownloads: Array<{
    filename: string;
    md5: string;
    status: "downloading" | "failed";
    error?: string;
  }>;
}

interface DirectoryHandle {
  name: string;
  getDirectoryHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<DirectoryHandle>;
  getFileHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<FileSystemFileHandle>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<DirectoryHandle>;
  }
}

const BULK_DOWNLOAD_QUERY = gql`
  query BulkDownload($offset: Int!, $first: Int!) {
    bulkDownload(offset: $offset, first: $first) {
      totalCount
      estimatedSizeBytes
      nodes {
        __typename
        md5
        filename(normalize_extension: true, include_museum_id: true)
        download_url
      }
    }
  }
`;

const MAX_CONCURRENT_DOWNLOADS = 6;
const CHUNK_SIZE = 1000;

export default function BulkDownloadPage() {
  const [directoryHandle, setDirectoryHandle] =
    useState<DirectoryHandle | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>({
    totalSkins: 0,
    completedSkins: 0,
    failedSkins: 0,
    estimatedSizeBytes: "0",
    activeDownloads: [],
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(
    typeof window !== "undefined" && "showDirectoryPicker" in window
  );
  const abortController = useRef<AbortController | null>(null);

  const downloadSkin = useCallback(
    async (
      skin: BulkDownloadSkin,
      directoryHandle: DirectoryHandle,
      signal: AbortSignal
    ): Promise<void> => {
      const { filename, download_url, md5 } = skin;

      // Get the target directory and file path
      const targetDirectory = await getDirectoryForSkin(
        filename,
        directoryHandle
      );
      // Check if file already exists
      try {
        await targetDirectory.getFileHandle(filename);
        // File exists, skip download
        console.log(`Skipping ${filename} - already exists`);
        setProgress((prev) => ({
          ...prev,
          completedSkins: prev.completedSkins + 1,
        }));
        return;
      } catch (error) {
        // File doesn't exist, continue with download
      }

      // Add to active downloads
      setProgress((prev) => ({
        ...prev,
        activeDownloads: [
          ...prev.activeDownloads,
          {
            filename,
            md5,
            status: "downloading" as const,
          },
        ],
      }));

      try {
        const response = await fetch(download_url, { signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // We don't need individual progress tracking anymore
        // const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error("No response body");
        }

        // Use the targetDirectory and finalFilename we calculated earlier
        const fileHandle = await targetDirectory.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();

        // Track total bytes for this file (not needed for individual progress)

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            await writable.write(value);
          }

          await writable.close();

          // Mark as completed and immediately remove from active downloads
          setProgress((prev) => ({
            ...prev,
            completedSkins: prev.completedSkins + 1,
            activeDownloads: prev.activeDownloads.filter((d) => d.md5 !== md5),
          }));
        } catch (writeError) {
          await writable.abort("Failed to write file");
          throw writeError;
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log(`Download aborted: ${filename}`);
          throw error; // Re-throw abort errors
        }

        // Mark as failed and schedule removal
        setProgress((prev) => ({
          ...prev,
          failedSkins: prev.failedSkins + 1,
          activeDownloads: prev.activeDownloads.map((d) =>
            d.md5 === md5
              ? {
                  ...d,
                  status: "failed" as const,
                  error: error.message,
                }
              : d
          ),
        }));

        // Remove failed download after 3 seconds
        setTimeout(() => {
          setProgress((prev) => ({
            ...prev,
            activeDownloads: prev.activeDownloads.filter((d) => d.md5 !== md5),
          }));
        }, 3000);

        console.error(`Failed to download ${filename}:`, error);
      }
    },
    [getDirectoryForSkin]
  );

  // Load initial metadata when component mounts
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { totalCount, estimatedSizeBytes } = await fetchSkins(0, 1);
        setProgress((prev) => ({
          ...prev,
          totalSkins: totalCount,
          estimatedSizeBytes,
        }));
      } catch (error: any) {
        console.error("Failed to load initial data:", error);
        setError("Failed to load skin count information");
      }
    }

    loadInitialData();
  }, [fetchSkins]);

  const selectDirectoryAndStart = useCallback(async () => {
    // First, select directory if not already selected
    if (!directoryHandle) {
      if (!window.showDirectoryPicker) {
        setError(
          "File System Access API is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }

      try {
        const handle = await window.showDirectoryPicker();
        setDirectoryHandle(handle);
        setError(null);

        // Now start the download with the new directory
        await startDownloadWithDirectory(handle as FileSystemDirectoryHandle);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(`Failed to select directory: ${err.message}`);
        }
      }
    } else {
      // Directory already selected, just start download
      await startDownloadWithDirectory(
        directoryHandle as FileSystemDirectoryHandle
      );
    }
  }, [directoryHandle]);

  const startDownloadWithDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      setIsDownloading(true);
      setError(null);
      // setStartTime(Date.now());
      abortController.current = new AbortController();

      try {
        // Get initial metadata
        const { totalCount, estimatedSizeBytes } = await fetchSkins(0, 1);

        setProgress({
          totalSkins: totalCount,
          completedSkins: 0,
          failedSkins: 0,
          estimatedSizeBytes,
          activeDownloads: [],
        });

        let offset = 0;
        const activePromises = new Set<Promise<void>>();

        while (offset < totalCount && !abortController.current.signal.aborted) {
          console.log(`Fetching batch: offset=${offset}, chunk=${CHUNK_SIZE}`);

          try {
            const { skins } = await fetchSkins(offset, CHUNK_SIZE);
            console.log(`Retrieved ${skins.length} skins in this batch`);

            if (skins.length === 0) {
              console.log("No more skins to fetch, breaking");
              break;
            }

            for (const skin of skins) {
              if (abortController.current.signal.aborted) break;

              await waitForAvailableSlot(
                activePromises,
                abortController.current.signal
              );

              if (abortController.current.signal.aborted) break;

              const downloadPromise = downloadSkin(
                skin,
                handle,
                abortController.current.signal
              ).finally(() => {
                activePromises.delete(downloadPromise);
              });

              activePromises.add(downloadPromise);
            }

            offset += skins.length;
            console.log(`Completed batch, new offset: ${offset}/${totalCount}`);
          } catch (error: any) {
            console.error(`Failed to fetch batch at offset ${offset}:`, error);
            setError(`Failed to fetch skins: ${error.message}`);
            break;
          }
        }

        // Wait for all remaining downloads to complete
        await Promise.allSettled(activePromises);
        console.log("All downloads completed!");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          setError(`Download failed: ${error.message}`);
        }
      } finally {
        setIsDownloading(false);
      }
    },
    [fetchSkins, downloadSkin]
  );

  const stopDownload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort("User Canceled");
    }
    setIsDownloading(false);
    // setStartTime(null);
  }, []);

  const progressPercent =
    progress.totalSkins > 0
      ? ((progress.completedSkins + progress.failedSkins) /
          progress.totalSkins) *
        100
      : 0;

  if (!isSupported) {
    return <h1>Your browser does not support filesystem access.</h1>;
  }

  const gb = Math.round(
    parseInt(progress.estimatedSizeBytes || "0", 10) / (1024 * 1024 * 1024)
  );

  return (
    <div>
      <div>
        <div>
          <div>
            <h1>Bulk Download All Skins</h1>
            <p>Download the entire Winamp Skin Museum collection.</p>
            <ul>
              <li>
                Will download {progress.totalSkins.toLocaleString()} files (~
                {gb}
                GB) into the selected directory
              </li>
              <li>
                Files will be organized into directories (aa-zz, 0-9) based on
                filename prefix
              </li>
              <li>
                Supports resuming from previously interrupted bulk download
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <div>
            <div>{error}</div>
          </div>
        )}

        {/* Download Controls */}
        <div>
          {isDownloading ? (
            <button onClick={stopDownload}>Stop Download</button>
          ) : (
            <button onClick={selectDirectoryAndStart}>
              {directoryHandle
                ? "Start Download"
                : "Select Directory & Start Download"}
            </button>
          )}
        </div>

        {/* Progress Section */}
        {(isDownloading || progress.completedSkins > 0) && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                Downloaded{" "}
                {(
                  progress.completedSkins + progress.failedSkins
                ).toLocaleString()}{" "}
                of {progress.totalSkins.toLocaleString()} skins
              </span>
              <span>{Math.round(progressPercent)}% complete</span>
            </div>

            <div
              style={{
                border: "1px solid black",
              }}
            >
              <div
                style={{
                  background: "black",
                  transition: "all 300ms",
                  height: "18px",
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function getDirectoryForSkin(
  filename: string,
  rootHandle: DirectoryHandle
) {
  // Create directory based on first two characters of filename (case insensitive)
  const firstChar = filename.charAt(0).toLowerCase();
  const secondChar =
    filename.length > 1 ? filename.charAt(1).toLowerCase() : "";

  let dirName: string;
  if (/[a-z]/.test(firstChar)) {
    // For letters, use two-character prefix if second char is alphanumeric
    if (/[a-z0-9]/.test(secondChar)) {
      dirName = firstChar + secondChar;
    } else {
      // Fallback to single letter + 'x' for special characters
      dirName = firstChar + "x";
    }
  } else {
    // For numbers/symbols, use "0-9"
    dirName = "0-9";
  }

  try {
    return await rootHandle.getDirectoryHandle(dirName, { create: true });
  } catch (err) {
    console.warn(`Failed to create directory ${dirName}, using root:`, err);
    return rootHandle;
  }
}

async function fetchSkins(
  offset: number,
  first: number
): Promise<{
  skins: BulkDownloadSkin[];
  totalCount: number;
  estimatedSizeBytes: string;
}> {
  const { bulkDownload } = await fetchGraphql(BULK_DOWNLOAD_QUERY, {
    offset,
    first,
  });
  return {
    skins: bulkDownload.nodes,
    totalCount: bulkDownload.totalCount,
    estimatedSizeBytes: bulkDownload.estimatedSizeBytes,
  };
}
// Helper function to wait for an available download slot
async function waitForAvailableSlot(
  activePromises: Set<Promise<void>>,
  signal: AbortSignal
) {
  while (activePromises.size >= MAX_CONCURRENT_DOWNLOADS && !signal.aborted) {
    await Promise.race(activePromises);
  }
}
