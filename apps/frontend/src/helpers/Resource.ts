type ValueState<TResult> = {
  kind: 'value';
  result: TResult;
};

type LoadingState<TResult> = {
  kind: 'loading';
  result: TResult;
  controller: AbortController;
};

type IdleState<TResult> = {
  kind: 'idle';
  result: TResult;
};

type ErrorState<TResult> = {
  kind: 'error';
  result: TResult;
};

type ResourceState<TValue, TError, TLoading, TIdle> =
  | ValueState<TValue>
  | ErrorState<TError>
  | LoadingState<TLoading>
  | IdleState<TIdle>;

export default class Resource<
  TValue = any,
  TError = Error,
  TLoading = undefined,
  TIdle = undefined,
> {
  constructor(private state: ResourceState<TValue, TError, TLoading, TIdle>) {}

  /**
   *
   * Initializes a `Resource` in the value or error state depending on the promise resolution.
   *
   * This method automatically catches any thrown errors and assumes its shape to be of type `TError`
   */
  static async wrapPromise<
    TValue = any,
    TError = Error,
    TLoading = undefined,
    TIdle = undefined,
  >(
    promise: Promise<TValue>,
  ): Promise<Resource<TValue, TError, TLoading, TIdle>> {
    return promise
      .then((val) => Resource.wrapValue<TValue, TError, TLoading, TIdle>(val))
      .catch((err: TError) =>
        Resource.wrapError<TValue, TError, TLoading, TIdle>(err),
      );
  }

  /**
   *
   * Initializes a `Resource` in the value state with a given value
   */
  static wrapValue<
    TValue = any,
    TError = Error,
    TLoading = undefined,
    TIdle = undefined,
  >(value: TValue) {
    return new Resource<TValue, TError, TLoading, TIdle>({
      kind: 'value',
      result: value,
    });
  }

  /**
   *
   * Initializes a `Resource` in the error state with a given error
   */
  static wrapError<
    TValue = any,
    TError = Error,
    TLoading = undefined,
    TIdle = undefined,
  >(error: TError) {
    return new Resource<TValue, TError, TLoading, TIdle>({
      kind: 'error',
      result: error,
    });
  }

  /**
   *
   * Initializes a `Resource` in the loading state with a given loading value
   */
  static wrapLoading<
    TValue = any,
    TError = Error,
    TLoading = undefined,
    TIdle = undefined,
  >(loading: TLoading, controller = new AbortController()) {
    return new Resource<TValue, TError, TLoading, TIdle>({
      kind: 'loading',
      result: loading,
      controller,
    });
  }

  /**
   *
   * Initializes a `Resource` in the idle state with a given idle value
   */
  static wrapIdle<
    TValue = any,
    TError = Error,
    TLoading = undefined,
    TIdle = undefined,
  >(idle: TIdle) {
    return new Resource<TValue, TError, TLoading, TIdle>({
      kind: 'idle',
      result: idle,
    });
  }

  /**
   *
   * Initializes a `Resource` in the loading state with a loading value of `undefined`
   */
  static loading<TValue = any, TError = Error, TIdle = undefined>(
    controller = new AbortController(),
  ) {
    return this.wrapLoading<TValue, TError, undefined, TIdle>(
      undefined,
      controller,
    );
  }

  static idle<TValue = any, TError = Error, TLoading = undefined>() {
    return Resource.wrapIdle<TValue, TError, TLoading>(undefined);
  }

  /**
   *
   * Resets the `Resource` into a loading state with a value of undefined
   */
  reload<TNValue = TValue, TNError = TError>(
    controller = new AbortController(),
  ) {
    return Resource.loading<TNValue, TNError>(controller);
  }

  /**
   *
   *
   */
  isLoading(): boolean {
    return this.state.kind === 'loading';
  }

  /**
   *
   * Maps the value state to a new value
   */
  map<TResult>(map: (value: TValue) => TResult) {
    if (this.state.kind !== 'value') return this;
    return Resource.wrapValue<TResult, TError, TLoading>(
      map(this.state.result),
    );
  }

  /**
   *
   * Maps the error state to a new value
   */
  catch<TResult>(map: (error: TError) => TResult) {
    if (this.state.kind !== 'error') return this;
    return Resource.wrapError<TValue, TResult, TLoading, TIdle>(
      map(this.state.result),
    );
  }

  /**
   *
   * Maps the loading state to a new value
   */
  loading<TResult>(map: (loading: TLoading) => TResult) {
    if (this.state.kind !== 'loading') return this;
    return Resource.wrapLoading<TValue, TError, TResult>(
      map(this.state.result),
      this.state.controller,
    );
  }

  /**
   *
   * Maps the loading and idle state to a new value
   */
  pending<TResult>(map: (pending: TLoading | TIdle) => TResult) {
    if (this.state.kind !== 'loading' && this.state.kind !== 'idle')
      return this;
    return new Resource<TValue, TError, TResult, TResult>({
      kind: this.state.kind,
      result: map(this.state.result),
    } as LoadingState<TResult> | IdleState<TResult>);
  }

  /**
   * If the `Resource` is in a loading state it will use the `AbortController` to cancel the request
   */
  abort() {
    if (this.state.kind !== 'loading') return this;
    this.state.controller.abort();
    return this;
  }

  /**
   * Gets the `AbortSignal` from the resource. If the application is not in a loading state it will be `null`
   */
  signal() {
    if (this.state.kind !== 'loading') return undefined;
    return this.state.controller.signal;
  }

  /**
   * Gets the resulting value from the `Resource`. The resulting value depends on the state and applied map
   */
  unwrap() {
    return this.state.result;
  }

  unwrapValue() {
    if (this.state.kind !== 'value') return undefined;
    return this.state.result;
  }
}
