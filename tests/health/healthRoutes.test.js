const request = require('supertest');
const app = require('../../app');

describe('Health Endpoints', () => {
  it('should respond with heartbeat', async () => {
    const res = await request(app)
      .get('/api/health/heartbeat');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Up");
  });
});
