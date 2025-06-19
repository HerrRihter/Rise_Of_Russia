const { redistributePopularity } = require('./partyBalance.js');

function almostEqual(a, b, eps = 0.01) {
  return Math.abs(a - b) < eps;
}

describe('redistributePopularity', () => {
  it('увеличение популярности одной партии, 3 партии', () => {
    const pop = { a: 33, b: 33, c: 34 };
    const res = redistributePopularity('a', pop, 1);
    expect(almostEqual(res.a, 34)).toBe(true);
    expect(almostEqual(res.b, 32.5)).toBe(true);
    expect(almostEqual(res.c, 33.5)).toBe(true);
    expect(almostEqual(res.a + res.b + res.c, 100)).toBe(true);
    expect(res.b >= 0 && res.c >= 0).toBe(true);
  });

  it('уменьшение популярности одной партии, 3 партии', () => {
    const pop = { a: 33, b: 33, c: 34 };
    const res = redistributePopularity('a', pop, -1);
    expect(almostEqual(res.a, 32)).toBe(true);
    expect(almostEqual(res.b, 33.5)).toBe(true);
    expect(almostEqual(res.c, 34.5)).toBe(true);
    expect(almostEqual(res.a + res.b + res.c, 100)).toBe(true);
    expect(res.b >= 0 && res.c >= 0).toBe(true);
  });

  it('не допускает отрицательных значений', () => {
    const pop = { a: 99, b: 1, c: 0 };
    const res = redistributePopularity('a', pop, 1);
    expect(res.a).toBeGreaterThanOrEqual(0);
    expect(res.b).toBeGreaterThanOrEqual(0);
    expect(res.c).toBeGreaterThanOrEqual(0);
    expect(almostEqual(res.a + res.b + res.c, 100)).toBe(true);
  });

  it('не уменьшает, если у всех кроме целевой 0%', () => {
    const pop = { a: 100, b: 0, c: 0 };
    const res = redistributePopularity('a', pop, 1);
    expect(res.a).toBeLessThanOrEqual(100);
    expect(res.b).toBeGreaterThanOrEqual(0);
    expect(res.c).toBeGreaterThanOrEqual(0);
    expect(almostEqual(res.a + res.b + res.c, 100)).toBe(true);
  });

  it('корректно работает с 2 партиями', () => {
    const pop = { a: 60, b: 40 };
    const res = redistributePopularity('a', pop, 1);
    expect(almostEqual(res.a, 61)).toBe(true);
    expect(almostEqual(res.b, 39)).toBe(true);
    expect(almostEqual(res.a + res.b, 100)).toBe(true);
  });

  it('корректно работает с большим числом партий', () => {
    const pop = { a: 20, b: 20, c: 20, d: 20, e: 20 };
    const res = redistributePopularity('a', pop, 1);
    expect(almostEqual(res.a, 21)).toBe(true);
    expect(Object.values(res).reduce((a, b) => a + b, 0)).toBeCloseTo(100, 2);
    Object.values(res).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
  });

  // --- Расширенные граничные и стресс-тесты ---
  it('не допускает отрицательных значений при попытке увеличить партию, когда у всех остальных 0%', () => {
    const pop = { a: 100, b: 0, c: 0 };
    const res = redistributePopularity('a', pop, 1);
    expect(Object.values(res).every(v => v >= 0)).toBe(true);
    expect(almostEqual(Object.values(res).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });

  it('не допускает отрицательных значений при случайных распределениях', () => {
    const pop = { a: 0.1, b: 0.1, c: 99.8 };
    const res = redistributePopularity('a', pop, 1);
    expect(Object.values(res).every(v => v >= 0)).toBe(true);
    expect(almostEqual(Object.values(res).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });

  it('последовательные операции не приводят к отрицательным значениям и нарушению суммы', () => {
    let pop = { a: 10, b: 20, c: 30, d: 40 };
    for (let i = 0; i < 50; i++) {
      pop = redistributePopularity('a', pop, 1);
      pop = redistributePopularity('b', pop, -1);
    }
    Object.values(pop).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    expect(almostEqual(Object.values(pop).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });

  it('работает с большим количеством партий (20)', () => {
    let pop = {};
    for (let i = 0; i < 20; i++) pop['p' + i] = 5;
    pop = redistributePopularity('p0', pop, 1);
    Object.values(pop).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    expect(almostEqual(Object.values(pop).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });

  it('не возникает NaN или undefined', () => {
    const pop = { a: 0, b: 0, c: 100 };
    const res = redistributePopularity('a', pop, 1);
    Object.values(res).forEach(v => {
      expect(typeof v).toBe('number');
      expect(isNaN(v)).toBe(false);
    });
  });

  it('не возникает -0.00% после перераспределения', () => {
    const pop = { a: 0, b: 0, c: 100 };
    const res = redistributePopularity('a', pop, 1);
    Object.values(res).forEach(v => expect(v >= 0).toBe(true));
  });

  it('корректно работает при попытке увеличить на большее значение, чем возможно', () => {
    const pop = { a: 99, b: 1 };
    const res = redistributePopularity('a', pop, 10);
    Object.values(res).forEach(v => expect(v >= 0).toBe(true));
    expect(almostEqual(Object.values(res).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });

  it('корректно работает при очень малых значениях', () => {
    const pop = { a: 0.01, b: 99.99 };
    const res = redistributePopularity('a', pop, 1);
    Object.values(res).forEach(v => expect(v >= 0).toBe(true));
    expect(almostEqual(Object.values(res).reduce((a, b) => a + b, 0), 100)).toBe(true);
  });
}); 