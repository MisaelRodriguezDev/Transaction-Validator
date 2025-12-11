//@ts-nocheck
const errorHandler = require('../../src/middleware/errorHandler');

describe('ErrorHandler Middleware', () => {
  test('should return structured error in dev mode', () => {
    process.env.NODE_ENV = 'development';

    const err = new Error('Test error');
    err.statusCode = 400;

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Error',
        message: 'Test error',
        details: expect.objectContaining({ message: 'Test error' })
      })
    );
  });
});
