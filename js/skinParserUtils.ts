function fallbackGetImgFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Schedule cleanup of object url?
      // Maybe on next tick, or with requestidlecallback
      resolve(img);
    };
    img.onerror = () => reject("Failed to decode image");
    img.src = URL.createObjectURL(blob);
  });
}

export function getImgFromBlob(
  blob: Blob
): Promise<ImageBitmap | HTMLImageElement> {
  if (window.createImageBitmap) {
    try {
      // Use this faster native browser API if available.
      return window.createImageBitmap(blob);
    } catch (e) {
      console.warn(
        "Encountered an error with createImageBitmap. Falling back to Image approach."
      );
      // There are some bugs in the new API. In case something goes wrong, we call fall back.
      return fallbackGetImgFromBlob(blob);
    }
  }
  return fallbackGetImgFromBlob(blob);
}
