const supertest = require('supertest');
const request = supertest('http://localhost:8080/api/admin');
// mockAcc1: correct username, wrong password
const mockAcc1 = { email: 'hoangnm@hisoft.com.vn', password: 'lovehangga' };
// mockAcc2: correct username, correct password
const mockAcc2 = { email: 'hoangnm@hisoft.com.vn', password: '123123123' };
// mockAcc3: username maybe in db (or not)
const mockAcc3 = { email: 'longnn@hisoft.com.vn', password: 'longvip98' };
describe('TEST API LOGIN ON ADMIN PAGE(METHOD POST)', () => {
  test('It should respond 200 with true account', async () => {
    const response = await request.post('/login').send(mockAcc2);
    expect(response.body.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.email).toBe(mockAcc2.email);
    expect(response.body.data.role).toBe('AD');
  });

  test('It should respond 403 with correct username and wrong password', async () => {
    const response = await request.post('/login').send(mockAcc1);
    expect(response.body.status).toBe(402);
  });

  test('It should respond 403 with account employee(not admin)', async () => {
    const response = await request.post('/login').send(mockAcc3);
    expect(response.body.status).toBe(403);
  });
});
