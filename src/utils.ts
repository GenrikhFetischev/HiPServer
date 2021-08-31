export const identityFilter = <T>(arg: T | undefined): arg is T => Boolean(arg);
export const invertFilter =
  <T>(filter: (arg: T) => boolean) =>
  (arg: T) =>
    !filter(arg);
