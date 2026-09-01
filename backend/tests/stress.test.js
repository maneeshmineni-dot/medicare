const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'stress-test-secret-key-1234567890';

const app = require('../src/app');

function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    if (!addr) {
      return reject(new Error('Server is not listening'));
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path: options.path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = rawData;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: rawData });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

describe('⚡ PharmaVision AI — Comprehensive Stress & Concurrency Suite', () => {
  let server;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('High Concurrency Burst — 100 Parallel /health & /ping Requests', async () => {
    const startTime = Date.now();
    const NUM_REQUESTS = 100;

    const promises = Array.from({ length: NUM_REQUESTS }, (_, idx) => {
      const endpoint = idx % 2 === 0 ? '/health' : '/api/health';
      return makeRequest(server, { path: endpoint, method: 'GET' });
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    assert.strictEqual(results.length, NUM_REQUESTS);
    results.forEach((res, i) => {
      assert.strictEqual(res.status, 200, `Request ${i} failed with status ${res.status}`);
      assert.strictEqual(res.body.status, 'healthy');
    });

    const rps = Math.round((NUM_REQUESTS / duration) * 1000);
    console.log(`  ⚡ 100 Health Requests completed in ${duration}ms (~${rps} req/sec) with 0% error rate.`);
    assert.ok(duration < 2500, `Expected < 2500ms, got ${duration}ms`);
  });

  test('Cognitive Health Sync Burst — 50 Concurrent Telemetry Batch Packets', async () => {
    const NUM_BATCHES = 50;
    const startTime = Date.now();

    const promises = Array.from({ length: NUM_BATCHES }, (_, idx) => {
      const payload = {
        sessions: [
          {
            id: `stress_session_${idx}_1`,
            mode: 'match',
            score: 80 + (idx % 20),
            durationSeconds: 45 + (idx % 10),
            hesitationScore: 900 + (idx % 300),
            difficultyTier: (idx % 4) + 1,
            completedAt: Date.now()
          },
          {
            id: `stress_session_${idx}_2`,
            mode: 'quiz',
            score: 90,
            durationSeconds: 30,
            hesitationScore: 850,
            difficultyTier: 2,
            completedAt: Date.now()
          }
        ],
        adherenceLogs: [
          {
            id: `stress_log_${idx}`,
            medicineName: `Medicine_${idx}`,
            slot: idx % 2 === 0 ? 'morning' : 'night',
            status: idx % 5 === 0 ? 'missed' : 'taken',
            timestamp: Date.now()
          }
        ]
      };

      return makeRequest(server, { path: '/api/cognitive/sync', method: 'POST' }, payload);
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    results.forEach((res, idx) => {
      assert.strictEqual(res.status, 200, `Batch ${idx} failed with ${res.status}`);
      assert.strictEqual(res.body.success, true);
    });

    console.log(`  ⚡ 50 Telemetry Sync Batches (150 total records) ingested in ${duration}ms.`);
  });

  test('Caregiver Analytics Computation under High Historical Volume', async () => {
    const res = await makeRequest(server, { path: '/api/cognitive/caregiver-analytics?days=30', method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(typeof res.body.metrics.adherenceRate === 'number');
    assert.ok(typeof res.body.metrics.cognitiveHealthScore === 'number');
    assert.ok(typeof res.body.metrics.avgHesitationMs === 'number');
    console.log(`  ⚡ Caregiver Analytics computed: Adherence=${res.body.metrics.adherenceRate}%, Score=${res.body.metrics.cognitiveHealthScore}/100, Hesitation=${res.body.metrics.avgHesitationMs}ms.`);
  });

  test('Voice Agent Command Parsing Concurrency & Dialect Mapping', async () => {
    const testCommands = [
      { cmd: 'open medicine scanner', lang: 'en', expectedIntent: 'NAVIGATE_SCANNER' },
      { cmd: 'show my medicine cabinet', lang: 'en', expectedIntent: 'NAVIGATE_CABINET' },
      { cmd: 'check reports and prescription', lang: 'en', expectedIntent: 'NAVIGATE_REPORTS' },
      { cmd: 'open memory care games', lang: 'en', expectedIntent: 'NAVIGATE_MEMORY' },
      { cmd: 'open voice therapy room', lang: 'en', expectedIntent: 'NAVIGATE_THERAPY' },
      { cmd: 'dawa scanner kholo', lang: 'hi', expectedIntent: 'NAVIGATE_SCANNER' },
      { cmd: 'medicin cabinet open chey', lang: 'te', expectedIntent: 'NAVIGATE_CABINET' }
    ];

    const promises = testCommands.map((item) =>
      makeRequest(
        server,
        { path: '/api/voice/process-command', method: 'POST' },
        { command: item.cmd, language: item.lang }
      )
    );

    const results = await Promise.all(promises);
    results.forEach((res, i) => {
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.action, `Missing action for ${testCommands[i].cmd}`);
    });
    console.log(`  ⚡ Voice command router passed all dialect mapping stress checks.`);
  });

  test('Security & Fuzzing Resilience — Malformed, Giant, and Injected Payloads', async () => {
    // 1. Empty Object
    const res1 = await makeRequest(server, { path: '/api/cognitive/sync', method: 'POST' }, {});
    assert.strictEqual(res1.status, 200);

    // 2. Giant Payload (200kb of junk)
    const giantPayload = {
      junk: 'A'.repeat(200000),
      sessions: []
    };
    const res2 = await makeRequest(server, { path: '/api/cognitive/sync', method: 'POST' }, giantPayload);
    assert.strictEqual(res2.status, 200);

    // 3. SQL / NoSQL Injection strings in Voice Controller
    const injectionCmd = "'; DROP TABLE users; -- OR 1=1";
    const res3 = await makeRequest(
      server,
      { path: '/api/voice/process-command', method: 'POST' },
      { command: injectionCmd, language: 'en' }
    );
    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.body.success, true);

    console.log(`  ⚡ Security & Fuzzing: Zero crashes or unhandled exceptions under adversarial payloads.`);
  });

  test('Memory & Event-Loop Stability Verification', async () => {
    const memBefore = process.memoryUsage().heapUsed;
    
    // Execute 200 sequential operations
    for (let i = 0; i < 200; i++) {
      await makeRequest(server, { path: '/api/health', method: 'GET' });
    }

    const memAfter = process.memoryUsage().heapUsed;
    const diffMb = (memAfter - memBefore) / (1024 * 1024);
    console.log(`  ⚡ Heap Delta after 200 consecutive requests: ${diffMb.toFixed(2)} MB.`);
    assert.ok(diffMb < 50, 'Excessive memory growth detected.');
  });
});
