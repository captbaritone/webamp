// Currently only used as a WeakMap key
export default class UserContext {}

export function ctxWeakMapMemoize<T>(factory: () => T) {
  const cache: WeakMap<UserContext, T> = new WeakMap();
  return function get(ctx: UserContext): T {
    if (!cache.has(ctx)) {
      cache.set(ctx, factory());
    }
    // @ts-ignore We just put the value in there
    return cache.get(ctx);
  };
}
