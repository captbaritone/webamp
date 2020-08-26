export function log({
  category,
  action,
  label,
}: {
  category: string;
  action: string;
  label?: string;
}) {
  // @ts-ignore
  if (window.ga != null) {
    window.ga("send", "event", category, action, label);
  } else {
    // console.log({ category, action, label });
  }
}
