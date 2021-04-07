const supertest = require('supertest');
const request = supertest('http://localhost:8080/api');
const mockAcc = { email: 'hoangnm@hisoft.com.vn', password: '123123123' };
describe('Test API POST /login ', () => {
  test('It should respond 200 with true account', async () => {
    const response = await request.post('/login').send(mockAcc);
    expect(response.body.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.data.email).toBe(mockAcc.email);
    expect(response.body.data.role).toBeTruthy();
    expect(response.body.data.access_token).toBeTruthy();
    expect(response.statusCode).toBe(200);
  });

  test('It should respond 402 with email not password', async () => {
    const response = await request
      .post('/login')
      .send({ email: mockAcc.email });
    expect(response.body.status).toBe(402);
    expect(response.statusCode).toBe(200);
  });

  test('It should respond 402 with password not email', async () => {
    const response = await request
      .post('/login')
      .send({ password: mockAcc.password });
    expect(response.body.status).toBe(402);
    expect(response.statusCode).toBe(200);
  });

  test('It should respond 402 with wrong email', async () => {
    const response = await request
      .post('/login')
      .send({ email: 'hoangnm1@hisoft.com.vn', password: mockAcc.password });
    expect(response.body.status).toBe(402);
    expect(response.statusCode).toBe(200);
  });

  test('It should respond 402 with wrong password', async () => {
    const response = await request
      .post('/login')
      .send({ email: mockAcc.email, password: '123' });
    expect(response.body.status).toBe(402);
    expect(response.statusCode).toBe(200);
  });
});
