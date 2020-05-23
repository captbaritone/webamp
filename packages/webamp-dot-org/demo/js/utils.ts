// Trailing edge only throttle
export function throttle(func: Function, delay: number): Function {
  let timeout: number | null = null;
  let callbackArgs: any[] = [];

  return function (context: Object, ...args: any[]): void {
    callbackArgs = args;

    if (!timeout) {
      timeout = window.setTimeout(() => {
        func.apply(context, callbackArgs);
        timeout = null;
      }, delay);
    }
  };
}

export function getWindowSize(): { width: number; height: number } {
  // Aparently this is crazy across browsers.
  return {
    width: Math.max(
      document.body.scrollWidth,
      document.documentElement!.scrollWidth,
      document.body.offsetWidth,
      document.documentElement!.offsetWidth,
      document.body.clientWidth,
      document.documentElement!.clientWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.documentElement!.scrollHeight,
      document.body.offsetHeight,
      document.documentElement!.offsetHeight,
      document.body.clientHeight,
      document.documentElement!.clientHeight
    ),
  };
}
