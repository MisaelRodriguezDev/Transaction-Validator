const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/validate', transactionController.validateTransaction);
router.post('/batch-validate', transactionController.batchValidate);

module.exports = router;