//@ts-nocheck
const transactionService = require('../services/transactionService');
const logger = require('../utils/logger');

exports.validateTransaction = async (req, res, next) => {
  try {
    const transaction = req.body;

    if (!transaction || !transaction.id) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Transaction payload must include an id'
      });
    }

    logger.info('Validating transaction', { transactionId: transaction.id, amount: transaction.amount });

    const validationResult = await transactionService.validate(transaction);

    logger.info('Transaction validation completed', {
      transactionId: transaction.id,
      isValid: validationResult.isValid,
      validationTime: validationResult.validationTime
    });

    res.status(200).json({ success: true, data: validationResult });

  } catch (error) {
    logger.error('Transaction validation failed', { transaction: req.body, message: error.message, stack: error.stack });
    next(error);
  }
};

exports.batchValidate = async (req, res, next) => {
  try {
    const transactions = req.body.transactions;
    if (!Array.isArray(transactions) || transactions.length === 0 || transactions.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Transactions must be an array with 1-100 items'
      });
    }

    const results = await Promise.all(transactions.map(tx => transactionService.validate(tx)));

    logger.info('Batch validation completed', {
      total: transactions.length,
      validCount: results.filter(r => r.isValid).length
    });

    res.status(200).json({ success: true, results });
  } catch (error) {
    logger.error('Batch validation failed', { message: error.message, stack: error.stack });
    next(error);
  }
};
