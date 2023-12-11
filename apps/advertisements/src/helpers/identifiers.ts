export type UidOrId = number | string;

export function isUid(uidOrId: UidOrId): uidOrId is String {
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
