export type Prefix<TKey, TPrefix extends string> = TKey extends string
  ? `${TPrefix}${Capitalize<TKey>}`
  : TKey extends Record<string, any>
    ? {
        [K in keyof TKey as K extends symbol
          ? K
          : `${TPrefix}${Capitalize<`${K extends symbol
              ? never
              : K}`>}`]: TKey[K];
      }
    : never;
