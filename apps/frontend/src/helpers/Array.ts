const ArrayUtils = {
  toSpliced<TArray extends any[]>(
    arr: TArray,
    predicate: (
      item: TArray[number],
      idx: number,
      arr: TArray[number][],
    ) => boolean,
  ): TArray {
    const newArr = [...arr] as TArray;
    const foundIdx = newArr.findIndex(predicate);

    if (foundIdx === -1) return newArr;
    newArr.splice(foundIdx, 1);

    return newArr;
  },
};

export default ArrayUtils
