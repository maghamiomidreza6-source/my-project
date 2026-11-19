const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

let server;
let hostAddress;

function executeRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(endpoint, hostAddress);
    const config = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      config.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(targetUrl, config, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          if (rawData) parsed = JSON.parse(rawData);
        } catch {
          parsed = rawData;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('Issue & Task Tracker API Suite', () => {
  before((_, done) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      hostAddress = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  describe('Service Health', () => {
    test('GET /api/v1/health responds with HEALTHY and uptime', async () => {
      const res = await executeRequest('/api/v1/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'HEALTHY');
      assert.equal(res.body.service, 'issue-tracker-backend');
    });
  });

  describe('User Resource Domain', () => {
    test('GET /api/v1/users lists team members', async () => {
      const res = await executeRequest('/api/v1/users');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 2);
    });

    test('GET /api/v1/users/:id returns user by id', async () => {
      const res = await executeRequest('/api/v1/users/usr-201');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.username, 'omid_lead');
    });

    test('GET /api/v1/users/:id yields 404 for missing member', async () => {
      const res = await executeRequest('/api/v1/users/usr-unknown');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('POST /api/v1/users registers new team member', async () => {
      const payload = {
        username: 'reza_backend',
        fullName: 'Reza Tehrani',
        email: 'reza.t@company.internal',
        department: 'DevOps',
        role: 'engineer'
      };
      const res = await executeRequest('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.username, 'reza_backend');
    });

    test('POST /api/v1/users prevents duplicate username', async () => {
      const payload = {
        username: 'reza_backend',
        fullName: 'Duplicate Reza',
        email: 'reza.diff@company.internal'
      };
      const res = await executeRequest('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
    });

    test('POST /api/v1/users rejects short username', async () => {
      const payload = {
        username: 'ab',
        fullName: 'Short User',
        email: 'short@company.internal'
      };
      const res = await executeRequest('/api/v1/users', { method: 'POST', body: payload });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('PUT /api/v1/users/:id updates profile attributes', async () => {
      const payload = { department: 'Core Architecture' };
      const res = await executeRequest('/api/v1/users/usr-201', { method: 'PUT', body: payload });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.department, 'Core Architecture');
    });
  });

  describe('Task Resource Domain', () => {
    let createdTaskId;

    test('GET /api/v1/tasks retrieves all issue items', async () => {
      const res = await executeRequest('/api/v1/tasks');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 3);
    });

    test('GET /api/v1/tasks?priority=HIGH filters high priority issues', async () => {
      const res = await executeRequest('/api/v1/tasks?priority=HIGH');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      res.body.data.forEach(item => {
        assert.equal(item.priority, 'HIGH');
      });
    });

    test('POST /api/v1/tasks creates work item with assignee check', async () => {
      const payload = {
        title: 'Migrate Logging Service to Grafana Loki',
        description: 'Implement distributed log collection pipeline',
        type: 'FEATURE',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: 'usr-201',
        estimatedHours: 16,
        tags: ['logging', 'devops']
      };
      const res = await executeRequest('/api/v1/tasks', { method: 'POST', body: payload });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Migrate Logging Service to Grafana Loki');
      createdTaskId = res.body.data.id;
    });

    test('POST /api/v1/tasks yields 404 on invalid assigneeId', async () => {
      const payload = {
        title: 'Task with ghost assignee',
        assigneeId: 'usr-does-not-exist'
      };
      const res = await executeRequest('/api/v1/tasks', { method: 'POST', body: payload });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    test('PATCH /api/v1/tasks/:id/status updates lifecycle progress', async () => {
      const res = await executeRequest(`/api/v1/tasks/${createdTaskId}/status`, {
        method: 'PATCH',
        body: { status: 'DONE' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'DONE');
    });

    test('DELETE /api/v1/tasks/:id removes task item', async () => {
      const res = await executeRequest(`/api/v1/tasks/${createdTaskId}`, { method: 'DELETE' });
      assert.equal(res.status, 204);

      const check = await executeRequest(`/api/v1/tasks/${createdTaskId}`);
      assert.equal(check.status, 404);
    });
  });
});
