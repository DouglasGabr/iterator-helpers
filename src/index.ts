export class Iter<T> {
  private constructor(private iterator: Iterator<T>) {}

  [Symbol.iterator](): Iterator<T> {
    return this.iterator;
  }

  map<U>(mapper: (value: T, counter: number) => U): Iter<U> {
    const iterated = this[Symbol.iterator]();
    function* process(): Generator<U, undefined> {
      let counter = 0;
      while (true) {
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
        yield mapper(next.value, counter);
        counter += 1;
      }
    }
    return new Iter(process());
  }

  filter(predicate: (value: T, counter: number) => boolean): Iter<T>;
  filter<U extends T>(
    predicate: (value: T, counter: number) => value is U,
  ): Iter<U>;
  filter(predicate: (value: T, counter: number) => boolean): Iter<T> {
    const iterated = this[Symbol.iterator]();
    function* process(): Generator<T, undefined> {
      let counter = 0;
      while (true) {
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
        if (predicate(next.value, counter)) {
          yield next.value;
        }
        counter += 1;
      }
    }
    return new Iter(process());
  }

  take(limit: number): Iter<T> {
    const iterated = this[Symbol.iterator]();
    if (isNaN(limit)) {
      throw new RangeError('limit must be non NaN');
    }
    const integerLimit = Math.floor(limit);
    if (integerLimit < 0) {
      throw new RangeError('limit must be non negative');
    }
    function* process(): Generator<T, undefined> {
      let remaining = integerLimit;
      while (remaining > 0) {
        if (isFinite(remaining)) {
          remaining -= 1;
        }
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
        yield next.value;
      }
    }
    return new Iter(process());
  }

  drop(limit: number): Iter<T> {
    const iterated = this[Symbol.iterator]();
    if (isNaN(limit)) {
      throw new RangeError('limit must be non NaN');
    }
    const integerLimit = Math.floor(limit);
    if (integerLimit < 0) {
      throw new RangeError('limit must be non negative');
    }
    function* process(): Generator<T, undefined> {
      let remaining = integerLimit;
      while (remaining > 0) {
        if (isFinite(remaining)) {
          remaining -= 1;
        }
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
      }
      while (true) {
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
        yield next.value;
      }
    }
    return new Iter(process());
  }

  forEach(fn: (value: T, counter: number) => void): void {
    let counter = 0;
    for (const item of this) {
      fn(item, counter);
      counter += 1;
    }
  }

  some(predicate: (value: T, counter: number) => boolean): boolean {
    let counter = 0;
    for (const iterator of this) {
      if (predicate(iterator, counter)) {
        return true;
      }
      counter += 1;
    }
    return false;
  }

  every(predicate: (value: T, counter: number) => boolean): boolean {
    let counter = 0;
    for (const iterator of this) {
      if (!predicate(iterator, counter)) {
        return false;
      }
      counter += 1;
    }
    return true;
  }

  find(predicate: (value: T, counter: number) => boolean): T | undefined {
    let counter = 0;
    for (const iterator of this) {
      if (predicate(iterator, counter)) {
        return iterator;
      }
      counter += 1;
    }
    return undefined;
  }

  flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): Iter<U> {
    const iterated = this[Symbol.iterator]();
    function* process(): Generator<U, undefined, undefined> {
      let counter = 0;
      while (true) {
        const next = iterated.next();
        if (next.done) {
          return undefined;
        }
        const mapped = mapper(next.value, counter);
        yield* mapped;
        counter += 1;
      }
    }
    return new Iter(process());
  }

  reduce(reducer: (accumulator: T, value: T, counter: number) => T): T;
  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue: U,
  ): U;
  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue?: U,
  ): U {
    const iterated = this[Symbol.iterator]();
    let accumulator: U;
    let counter = 0;
    if (typeof initialValue === 'undefined') {
      const next = iterated.next();
      if (next.done) {
        throw new TypeError('Reduce of empty iterator with no initial value');
      }
      accumulator = next.value as unknown as U;
      counter = 1;
    } else {
      accumulator = initialValue;
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = iterated.next();
      if (next.done) {
        return accumulator;
      }
      const result = reducer(accumulator, next.value, counter);
      accumulator = result;
      counter += 1;
    }
  }

  toArray(): T[] {
    const items: T[] = [];
    for (const item of this) {
      items.push(item);
    }
    return items;
  }

  static from<T>(iterable: Iterable<T> | Iterator<T>): Iter<T> {
    if ('next' in iterable) {
      return new Iter(iterable);
    } else {
      return new Iter(iterable[Symbol.iterator]());
    }
  }
}
