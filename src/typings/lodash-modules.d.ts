declare module 'lodash' {
  const zipObject: <K extends string, V>(
    keys: K[],
    values: V[],
  ) => Record<K, V>;
  export { zipObject };

  function pick<K extends string, T extends Record<K, any>>(
    obj: T,
    ...args: K[]
  ): Pick<T, K>;
  function pick<K extends string, T extends Record<K, any>>(
    obj: T,
    keys: K[],
  ): Pick<T, K>;
  export { pick };

  const pickBy: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    iteratee: (v: T, k: K) => boolean,
  ) => Pick<T, K>;
  export { pickBy };

  const mapValues: <K extends string, V, M>(
    obj: Record<K, V>,
    mapper: (v: V, k: K) => M,
  ) => Record<K, M>;
  export { mapValues };

  const countBy: <T>(array: T[], el: T) => Record<'true' | 'false', number>;
  export { countBy };
}
