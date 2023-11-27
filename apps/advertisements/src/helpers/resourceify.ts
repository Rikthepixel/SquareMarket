
class ResourceChain<TModel extends object> {

  constructor(
    private omitted: string[] = []
  ) {}

  omit() {
  }

  map(model: TModel, clone: boolean = true) {
    if (clone) model = structuredClone(model);
    for (const omittedKey of this.omitted) {
      // Make some way to handle nested omits
      delete model[omittedKey];
    }
  }

  mapArray(models: TModel[], clone: boolean = true) {
    return models.map((v) => this.map(v, clone))
  }
}

function resourceify<TModel extends object>() {
  return new ResourceChain<TModel>()
}
