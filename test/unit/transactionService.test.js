//@ts-nocheck
const transactionService = require('../../src/services/transactionService');

describe('TransactionService', () => {

  const validTransaction = { id: 'tx1', amount: 100, currency: 'USD' };
  const invalidTransaction = { id: 'tx2', amount: -10, currency: 'USD' };

  test('should validate a correct transaction', async () => {
    const result = await transactionService.validate(validTransaction);
    expect(result).toHaveProperty('isValid', true);
    expect(result).toHaveProperty('transactionId', validTransaction.id);
  });

  test('should invalidate transaction with negative amount', async () => {
    const result = await transactionService.validate(invalidTransaction);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Invalid amount');
  });

  test('should detect fraudulent transaction (simulate)', async () => {
    // Reemplazamos checkFraud para simular fraude
    const originalCheckFraud = transactionService.checkFraud;
    transactionService.checkFraud = async () => true;

    const result = await transactionService.validate(validTransaction);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Potential fraudulent transaction');

    transactionService.checkFraud = originalCheckFraud;
  });

});
