export type Result<T, E = Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(readonly value: T) {}

  map<U>(fn: (val: T) => U): Result<U, E> {
    return new Success<U, E>(fn(this.value));
  }

  flatMap<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  getOrThrow(): T {
    return this.value;
  }

  getOrElse(_defaultVal: T): T {
    return this.value;
  }
}

export class Failure<T, E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(readonly error: E) {}

  map<U>(_fn: (val: T) => U): Result<U, E> {
    return new Failure<U, E>(this.error);
  }

  flatMap<U>(_fn: (val: T) => Result<U, E>): Result<U, E> {
    return new Failure<U, E>(this.error);
  }

  getOrThrow(): T {
    if (this.error instanceof Error) {
      throw this.error;
    }
    throw new Error(String(this.error));
  }

  getOrElse(defaultVal: T): T {
    return defaultVal;
  }
}

export const ok = <T, E = Error>(value: T): Result<T, E> => new Success<T, E>(value);
export const fail = <T, E = Error>(error: E): Result<T, E> => new Failure<T, E>(error);
