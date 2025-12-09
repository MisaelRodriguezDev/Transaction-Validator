const request = require('supertest');
const app = require('../src/app');

describe('Transaction Validator V1', () => {
  test('should validate transaction', async () => {
    const response = await request(app)
      .post('/api/v1/transactions/validate')
      .send({
        id: 'test-123',
        amount: 100,
        currency: 'MXN',
        merchantId: 'test_merchant'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('transactionId');
  });
  
  test('should handle invalid transaction', async () => {
    const response = await request(app)
      .post('/api/v1/transactions/validate')
      .send({
        amount: -100,
        currency: 'MXN'
      });
    
    expect(response.status).toBe(500); 
  });
});