const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('fail 1', () => {
  throw new Error('BKP');
});

test('fail 2', () => {
  expect(true).toBeFalsy();
});

test('fail 3', () => {
  expect(1).toBe(2);
});
