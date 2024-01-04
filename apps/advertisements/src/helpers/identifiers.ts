export type UidOrId = number | string;

export function isUid(uidOrId: UidOrId): uidOrId is string {
  return typeof uidOrId === 'string';
}

export function isId(uidOrId: UidOrId): uidOrId is number {
  return typeof uidOrId === 'number';
}

export function castUidOrId(
  uidOrId: UidOrId,
  cast: (uid: string) => Buffer,
): Buffer | number {
  return isUid(uidOrId) ? cast(uidOrId) : uidOrId;
}

export function getType<TUidOrId extends UidOrId>(
  uid_or_id: TUidOrId,
): TUidOrId extends Buffer ? 'uid' : 'id' {
  return (isUid(uid_or_id) ? 'uid' : 'id') as TUidOrId extends Buffer
    ? 'uid'
    : 'id';
}

export type UidsToBuffers<T extends object> = {
  [TKey in keyof T]: TKey extends string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    ? TKey extends `${infer _}uid`
      ? T[TKey] extends string
        ? Buffer
        : T[TKey]
      : T[TKey]
    : T[TKey] extends object
      ? UidsToBuffers<T[TKey]>
      : T[TKey];
};
