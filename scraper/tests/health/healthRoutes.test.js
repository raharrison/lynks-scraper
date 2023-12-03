import request from "supertest";
import app from "../../app.js";

describe('Health Endpoints', () => {
  it('should respond with heartbeat', async () => {
    const res = await request(app)
      .get('/api/health/heartbeat');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Up");
  });
});
