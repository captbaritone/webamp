// Public URLs for the museum's pages. The new UI's routes live under /scroll,
// and middleware.ts maps these onto them.

// A skin, in the same form as the sitemap: /skin/:md5/:fileName.
export function skinPath(md5: string, fileName: string): string {
  return `/skin/${md5}/${encodeURIComponent(fileName)}`;
}
