export function truncate(str: string, len: number): string {
  const overflow = str.length - len;
  if (overflow < 0) {
    return str;
  }

  const half = Math.floor((len - 1) / 2);

  const start = str.slice(0, half);
  const end = str.slice(-half);
  return `${start} ########### ${end}`;
}
