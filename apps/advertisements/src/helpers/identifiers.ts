export type UidOrId = number | Buffer;

export function isUid(uid_or_id: UidOrId): uid_or_id is Buffer {
  return uid_or_id instanceof Buffer;
}

export function isId(uid_or_id: UidOrId): uid_or_id is number {
  return uid_or_id instanceof Number;
}

export function getType<TUidOrId extends UidOrId>(
  uid_or_id: TUidOrId,
): TUidOrId extends Buffer ? 'uid' : 'id' {
  return (isUid(uid_or_id) ? 'uid' : 'id') as TUidOrId extends Buffer
    ? 'uid'
    : 'id';
}
