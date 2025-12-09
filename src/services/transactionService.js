//@ts-nocheck

const logger = require('../utils/logger');

class TransactionService {
  constructor() {
    this.validationRules = this.loadValidationRules();
  }
  
  // Simula carga lenta de reglas
  loadValidationRules() {
    logger.warn('Loading validation rules (slow operation)...');
    // Simula carga pesada
    const start = Date.now();
    const rules = {
      maxAmount: 10000,
      minAmount: 0.01,
      allowedCurrencies: ['MXN', 'USD'],
      maxTransactionsPerHour: 10,
      blacklistedMerchants: ['FRAUDULENT_CO', 'TEST_MERCHANT']
    };
    
    // Simula delay en carga
    const end = start + 500; // 500ms de delay
    while (Date.now() < end) {}
    
    logger.info('Validation rules loaded');
    return rules;
  }
  
  async validate(transaction) {
    const startTime = Date.now();
    
    // Validaciones básicas
    if (!transaction.id) {
      throw new Error('Transaction ID is required');
    }
    
    if (!transaction.amount || transaction.amount <= 0) {
      return {
        transactionId: transaction.id,
        isValid: false,
        reason: 'Invalid amount',
        validationTime: Date.now() - startTime
      };
    }
    
    if (transaction.amount > this.validationRules.maxAmount) {
      return {
        transactionId: transaction.id,
        isValid: false,
        reason: 'Amount exceeds maximum limit',
        validationTime: Date.now() - startTime
      };
    }
    
    // Simula validación de fraude (operación pesada)
    const isFraudulent = await this.checkFraud(transaction);
    if (isFraudulent) {
      return {
        transactionId: transaction.id,
        isValid: false,
        reason: 'Potential fraudulent transaction',
        validationTime: Date.now() - startTime
      };
    }
    
    // Simula conexión lenta a base de datos
    await this.simulateDatabaseQuery();
    
    return {
      transactionId: transaction.id,
      isValid: true,
      validationTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
  
  async checkFraud(transaction) {
    // Simula análisis de fraude complejo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 1% de probabilidad de marcar como fraude
    return Math.random() < 0.01;
  }
  
  async simulateDatabaseQuery() {
    // Simula query lenta a base de datos
    const delay = Math.random() * 300 + 100; // 100-400ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simula timeout ocasional
    if (Math.random() < 0.005) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      throw new Error('Database timeout');
    }
  }
}

module.exports = new TransactionService();