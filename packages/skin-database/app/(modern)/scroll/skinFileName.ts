// Skins are shown with a .wsz extension whatever their archive was uploaded
// as (.zip and .wsz are the same thing). Matches SkinModel.getFileName(true),
// for names that don't come through it (museum pages, Algolia results).
export function normalizeSkinFileName(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, "") + ".wsz";
}
