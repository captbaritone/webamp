export function log({
  category,
  action,
  label,
  value,
}: {
  category: string;
  action: string;
  label?: string;
  value?: number;
}) {
  // @ts-ignore
  if (window.ga != null) {
    // @ts-ignore
    window.ga("send", "event", category, action, label, value);
  } else {
    // console.log({ category, action, label, value });
  }
}
