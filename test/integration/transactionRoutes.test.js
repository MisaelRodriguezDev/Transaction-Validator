//@ts-nocheck
const request = require('supertest');
const app = require('../../src/app');

describe('Transaction API', () => {

  test('POST /api/v1/transactions/validate should validate a transaction', async () => {
    const transaction = { id: 'tx123', amount: 100, currency: 'USD' };

    const res = await request(app)
      .post('/api/v1/transactions/validate')
      .send(transaction)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('isValid', true);
  });

  test('POST /api/v1/transactions/batch-validate should validate multiple transactions', async () => {
    const transactions = [
      { id: 'tx1', amount: 100, currency: 'USD' },
      { id: 'tx2', amount: -50, currency: 'USD' }
    ];

    const res = await request(app)
      .post('/api/v1/transactions/batch-validate')
      .send({ transactions })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.results.length).toBe(2);
    expect(res.body.results[0].isValid).toBe(true);
    expect(res.body.results[1].isValid).toBe(false);
  });

  test('GET /health should return service health', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.status).toBe('healthy');
  });

  test('Unknown route should return 404', async () => {
    const res = await request(app)
      .get('/api/v1/transactions/unknown')
      .expect(404);

    expect(res.body.error).toBe('Not Found');
  });

});
