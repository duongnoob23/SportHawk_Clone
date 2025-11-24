/**
 * Unit Test: Payment Stripe Fee Calculation
 *
 * Test tính toán phí Stripe cho payments
 *
 * Formula: total = amount + amount * 1.9% + 0.2
 *
 * Priority: ⭐⭐⭐⭐⭐ (CRITICAL - Money related)
 */

import { paymentCaculationStripeFee } from '../paymentCaculationiStripeFee';

describe('paymentCaculationStripeFee', () => {
  describe('when isUserDisplay is true (pence input)', () => {
    it('should calculate fee correctly for 25$ (2500 pence)', () => {
      const result = paymentCaculationStripeFee(2500, true);

      // amountInPounds = 2500 (pence)
      expect(result.amountInPounds).toBe(2500);

      // transactionFee = 2500 * 0.019 + 20 = 47.5 + 20 = 67.5 (pence)
      expect(result.transactionFee).toBeCloseTo(67.5, 1);

      // total = 2500 + 67.5 = 2567.5 (pence)
      expect(result.total).toBeCloseTo(2567.5, 1);
    });

    it('should calculate fee correctly for 50$ (5000 pence)', () => {
      const result = paymentCaculationStripeFee(5000, true);

      expect(result.amountInPounds).toBe(5000);
      // transactionFee = 5000 * 0.019 + 20 = 95 + 20 = 115 (pence)
      expect(result.transactionFee).toBeCloseTo(115, 1);
      // total = 5000 + 115 = 5115 (pence)
      expect(result.total).toBeCloseTo(5115, 1);
    });

    it('should return 0 fee for 0 amount', () => {
      const result = paymentCaculationStripeFee(0, true);

      expect(result.amountInPounds).toBe(0);
      expect(result.transactionFee).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle small amounts', () => {
      const result = paymentCaculationStripeFee(100, true); // 1$

      expect(result.amountInPounds).toBe(100);
      // transactionFee = 100 * 0.019 + 20 = 1.9 + 20 = 21.9
      expect(result.transactionFee).toBeCloseTo(21.9, 1);
      expect(result.total).toBeCloseTo(121.9, 1);
    });
  });

  describe('when isUserDisplay is false (pounds input)', () => {
    it('should convert pence to pounds and calculate fee', () => {
      const result = paymentCaculationStripeFee(2500, false);

      // amountInPounds = 2500 / 100 = 25 (pounds)
      expect(result.amountInPounds).toBe(25);

      // transactionFee = 25 * 0.019 + 0.2 = 0.475 + 0.2 = 0.675 (pounds)
      expect(result.transactionFee).toBeCloseTo(0.675, 2);

      // total = 25 + 0.675 = 25.675 (pounds)
      expect(result.total).toBeCloseTo(25.675, 2);
    });

    it('should handle 0 amount', () => {
      const result = paymentCaculationStripeFee(0, false);

      expect(result.amountInPounds).toBe(0);
      expect(result.transactionFee).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const result = paymentCaculationStripeFee(1000000, true); // 10,000$

      expect(result.amountInPounds).toBe(1000000);
      // transactionFee = 1000000 * 0.019 + 20 = 19000 + 20 = 19020
      expect(result.transactionFee).toBeCloseTo(19020, 1);
      expect(result.total).toBeCloseTo(1019020, 1);
    });

    it('should handle decimal results correctly', () => {
      // Test với số lẻ để đảm bảo không mất precision
      const result = paymentCaculationStripeFee(1234, true);

      expect(result.amountInPounds).toBe(1234);
      // transactionFee = 1234 * 0.019 + 20 = 23.446 + 20 = 43.446
      expect(result.transactionFee).toBeCloseTo(43.446, 2);
      expect(result.total).toBeCloseTo(1277.446, 2);
    });
  });
});
