import { Iter } from '.';

test('.from()', () => {
  expect(Iter.from([1, 2, 3])).toBeInstanceOf(Iter);
  expect(Iter.from([1, 2, 3][Symbol.iterator]())).toBeInstanceOf(Iter);
});

test('.map()', () => {
  const i = Iter.from([1, 2, 3]).map((x) => x + 1);
  expect(i.toArray()).toEqual([2, 3, 4]);
});

test('.filter()', () => {
  const i = Iter.from([1, 2, 3]).filter((x) => x % 2 === 0);
  expect(i.toArray()).toEqual([2]);
});

test('.take()', () => {
  const i = Iter.from([1, 2, 3]).take(2);
  expect(i.toArray()).toEqual([1, 2]);
  const j = Iter.from([1, 2, 3]).take(Infinity);
  expect(j.toArray()).toEqual([1, 2, 3]);
  expect(() => Iter.from([1, 2, 3]).take(-1)).toThrow(RangeError);
  expect(() => Iter.from([1, 2, 3]).take(NaN)).toThrow(RangeError);
});

test('.drop()', () => {
  const i = Iter.from([1, 2, 3]).drop(2);
  expect(i.toArray()).toEqual([3]);
  const j = Iter.from([1, 2, 3]).drop(Infinity);
  expect(j.toArray()).toEqual([]);
  expect(() => Iter.from([1, 2, 3]).drop(-1)).toThrow(RangeError);
  expect(() => Iter.from([1, 2, 3]).drop(NaN)).toThrow(RangeError);
});

test('.forEach()', () => {
  const fn = jest.fn();
  const i = Iter.from([1, 2, 3]);
  i.forEach(fn);
  expect(fn).toHaveBeenCalledTimes(3);
  expect(fn).toHaveBeenNthCalledWith(1, 1, 0);
  expect(fn).toHaveBeenNthCalledWith(2, 2, 1);
  expect(fn).toHaveBeenNthCalledWith(3, 3, 2);
});

test('.some()', () => {
  expect(Iter.from([1, 2, 3]).some((x) => x === 4)).toBe(false);
  expect(Iter.from([1, 2, 3]).some((x) => x === 2)).toBe(true);
  expect(Iter.from([]).some((x) => x === 2)).toBe(false);
});

test('.every()', () => {
  const i = Iter.from([1, 2, 3]);
  expect(i.every((x) => x === 4)).toBe(false);
  expect(i.every((x) => x === 2)).toBe(false);
  expect(i.every((x) => x > 0)).toBe(true);
  expect(Iter.from([]).every((x) => x === 2)).toBe(true);
});

test('.find()', () => {
  expect(Iter.from([1, 2, 3]).find((x) => x === 4)).toBe(undefined);
  expect(Iter.from([1, 2, 3]).find((x) => x === 2)).toBe(2);
  expect(Iter.from([]).find((x) => x === 2)).toBe(undefined);
});

test('.flatMap()', () => {
  const i = Iter.from([1, 2, 3]).flatMap((x) => [x, x + 1]);
  expect(i.toArray()).toEqual([1, 2, 2, 3, 3, 4]);
});

test('.reduce()', () => {
  expect(Iter.from([1, 2, 3]).reduce((a, b) => a + b)).toBe(6);
  expect(Iter.from([1, 2, 3]).reduce((a, b) => a + b, 4)).toBe(10);
  expect(() => Iter.from<number>([]).reduce((a, b) => a + b)).toThrow(
    TypeError,
  );
});
