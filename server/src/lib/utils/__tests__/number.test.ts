import { describe, expect, it } from 'vitest';
import { toValidMoney } from '../number.js';

describe('toValidMoney', () => {
  it('should round to two decimal places', () => {
    expect(toValidMoney(1.005)).toBe(1.0); // toFixed rounds away from zero
    expect(toValidMoney(2.004)).toBe(2.0);
    expect(toValidMoney(2.005)).toBe(2.0);
    expect(toValidMoney(1.999)).toBe(2.0);
    expect(toValidMoney(1.991)).toBe(1.99);
  });

  it('should handle whole numbers', () => {
    expect(toValidMoney(10)).toBe(10.0);
    expect(toValidMoney(0)).toBe(0.0);
    expect(toValidMoney(-5)).toBe(-5.0);
  });

  it('should handle numbers with more than two decimals', () => {
    expect(toValidMoney(12.34567)).toBe(12.35);
    expect(toValidMoney(-12.34567)).toBe(-12.35);
  });

  it('should handle numbers that are already two decimals', () => {
    expect(toValidMoney(3.14)).toBe(3.14);
    expect(toValidMoney(-3.14)).toBe(-3.14);
  });

  it('should handle numbers with one decimal', () => {
    expect(toValidMoney(3.1)).toBe(3.1);
    expect(toValidMoney(-3.1)).toBe(-3.1);
  });
});
