//@ts-nocheck
const transactionService = require('../services/transactionService');
const logger = require('../utils/logger');

exports.validateTransaction = async (req, res, next) => {
  try {
    const transaction = req.body;
    
    // Log entrada
    logger.info('Validating transaction', {
      transactionId: transaction.id,
      amount: transaction.amount,
      timestamp: new Date().toISOString()
    });
    
    // Simula procesamiento con problemas
    await new Promise(resolve => {
      setTimeout(resolve, Math.random() * 1000); // Latencia variable
    });
    
    // Simula errores 500 (0.8% de probabilidad)
    if (Math.random() < 0.008) {
      logger.error('Simulated 500 error in transaction validation');
      throw new Error('Internal server error simulation');
    }
    
    const validationResult = await transactionService.validate(transaction);
    
    // Log exitoso
    logger.info('Transaction validation completed', {
      transactionId: transaction.id,
      isValid: validationResult.isValid,
      validationTime: validationResult.validationTime
    });
    
    res.status(200).json(validationResult);
    
  } catch (error) {
    logger.error('Transaction validation failed', {
      error: error.message,
      stack: error.stack,
      transaction: req.body
    });
    
    // Si es un error simulado, devuelve 500
    if (error.message === 'Internal server error simulation') {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Transaction validation service unavailable'
      });
    }
    
    next(error);
  }
};

exports.batchValidate = async (req, res, next) => {
  try {
    const transactions = req.body.transactions;
    
    if (!Array.isArray(transactions) || transactions.length > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Transactions must be an array with max 100 items'
      });
    }
    
    // Problema: Procesamiento secuencial en lugar de paralelo
    const results = [];
    for (let i = 0; i < transactions.length; i++) {
      const result = await transactionService.validate(transactions[i]);
      results.push(result);
    }
    
    res.status(200).json({ results });
    
  } catch (error) {
    logger.error('Batch validation failed', error);
    next(error);
  }
};