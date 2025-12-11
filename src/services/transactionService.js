//@ts-nocheck
const logger = require('../utils/logger');

class TransactionService {
  constructor() {
    this.validationRules = null;
  }

  // Carga simulada de reglas (lazy-loading)
  async loadValidationRules() {
    if (this.validationRules) return this.validationRules;

    logger.warn('Loading validation rules...');
    await new Promise(resolve => setTimeout(resolve, 500));

    this.validationRules = {
      maxAmount: 10000,
      minAmount: 0.01,
      allowedCurrencies: ['MXN', 'USD'],
      maxTransactionsPerHour: 10,
      blacklistedMerchants: ['FRAUDULENT_CO', 'TEST_MERCHANT']
    };

    logger.info('Validation rules loaded');
    return this.validationRules;
  }

  async ensureRulesLoaded() {
    if (!this.validationRules) await this.loadValidationRules();
  }

  // Validación principal
  async validate(transaction) {
    const startTime = Date.now();
    await this.ensureRulesLoaded();

    try {
      const basicResult = this.basicValidation(transaction);
      if (!basicResult.isValid) return this.buildResult(transaction.id, false, basicResult.reason, startTime);

      if (await this.checkFraud(transaction)) {
        return this.buildResult(transaction.id, false, 'Potential fraudulent transaction', startTime);
      }

      await this.simulateDatabaseQuery();

      return this.buildResult(transaction.id, true, null, startTime);
    } catch (error) {
      logger.error('Validation error', { transactionId: transaction.id, error: error.message });
      return this.buildResult(transaction.id, false, `Internal error: ${error.message}`, startTime);
    }
  }

  basicValidation(transaction) {
    if (!transaction.id) return { isValid: false, reason: 'Transaction ID is required' };
    if (!transaction.amount || transaction.amount <= 0) return { isValid: false, reason: 'Invalid amount' };
    if (transaction.amount < this.validationRules.minAmount) return { isValid: false, reason: 'Amount below minimum' };
    if (transaction.amount > this.validationRules.maxAmount) return { isValid: false, reason: 'Amount exceeds maximum limit' };
    if (!this.validationRules.allowedCurrencies.includes(transaction.currency)) {
      return { isValid: false, reason: `Currency ${transaction.currency} not allowed` };
    }
    if (this.validationRules.blacklistedMerchants.includes(transaction.merchant)) {
      return { isValid: false, reason: 'Merchant is blacklisted' };
    }
    return { isValid: true };
  }

  async checkFraud(transaction) {
    await new Promise(resolve => setTimeout(resolve, 50)); // más rápido
    return Math.random() < 0.01; // 1% fraude
  }

  async simulateDatabaseQuery() {
    const delay = Math.random() * 200 + 50; // 50-250ms
    await new Promise(resolve => setTimeout(resolve, delay));
    if (Math.random() < 0.002) throw new Error('Database timeout'); // menor probabilidad
  }

  buildResult(id, isValid, reason, startTime) {
    return {
      transactionId: id,
      isValid,
      reason: reason || undefined,
      validationTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new TransactionService();
