
export function catchType<TType extends { prototype: object }, TMapResult>(
  type: TType,
  map: (e: TType['prototype']) => TMapResult,
) {
  return (e: any) => {
    if (!(e instanceof (type as any))) throw e;
    return map(e as TType['prototype']);
  };
}
