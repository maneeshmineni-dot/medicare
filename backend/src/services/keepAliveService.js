/**
 * Render Keep-Alive / Anti-Sleep Service
 * Automatically pings the server's public URL every 10-12 minutes to prevent Render's
 * free tier from spinning down due to inactivity.
 */

const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.intervalMs = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 10 * 60 * 1000; // 10 minutes default
    this.pingUrl = this.resolvePingUrl();
  }

  resolvePingUrl() {
    // Render automatically provides RENDER_EXTERNAL_URL for web services (e.g. https://pharmavision-api.onrender.com)
    let baseUrl = process.env.RENDER_EXTERNAL_URL ||
                  process.env.RENDER_URL ||
                  process.env.BACKEND_URL ||
                  process.env.SERVER_URL ||
                  null;

    if (!baseUrl) return null;

    baseUrl = baseUrl.replace(/\/+$/, '');
    return `${baseUrl}/api/health`;
  }

  ping() {
    const targetUrl = this.resolvePingUrl();
    if (!targetUrl) {
      console.log('[KeepAlive] ℹ️ No public RENDER_EXTERNAL_URL or BACKEND_URL detected. Self-ping skipped (local dev mode).');
      return;
    }

    try {
      const urlObj = new URL(targetUrl);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'PharmaVision-KeepAlive/1.0',
          'Accept': 'application/json'
        },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            console.log(`[KeepAlive] 🟢 Health ping successful (${res.statusCode}) at ${new Date().toISOString()} -> ${targetUrl}`);
          } else {
            console.warn(`[KeepAlive] ⚠️ Health ping returned status ${res.statusCode} at ${new Date().toISOString()}`);
          }
        });
      });

      req.on('error', (err) => {
        console.warn(`[KeepAlive] ⚠️ Ping warning: ${err.message}`);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[KeepAlive] ⚠️ Ping request timed out (10s)`);
      });
    } catch (err) {
      console.error('[KeepAlive] ❌ Ping error:', err.message);
    }
  }

  start() {
    const targetUrl = this.resolvePingUrl();
    if (!targetUrl) {
      console.log('[KeepAlive] ℹ️ Render Keep-Alive service is active in standby. To activate self-pinging on Render, set RENDER_EXTERNAL_URL or BACKEND_URL environment variable.');
      return;
    }

    console.log(`[KeepAlive] 🚀 Keep-Alive service initialized.`);
    console.log(`[KeepAlive] 🎯 Target URL: ${targetUrl}`);
    console.log(`[KeepAlive] ⏱️ Interval: every ${Math.round(this.intervalMs / 60000)} minutes`);

    // Initial ping after 30 seconds of startup
    setTimeout(() => this.ping(), 30000);

    // Recurring ping
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.intervalMs);

    // Prevent interval from holding the Node process on graceful shutdown
    if (this.intervalId && typeof this.intervalId.unref === 'function') {
      this.intervalId.unref();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[KeepAlive] 🛑 Keep-Alive service stopped.');
    }
  }
}

const keepAliveService = new KeepAliveService();

module.exports = {
  keepAliveService,
  startKeepAlive: () => keepAliveService.start(),
  stopKeepAlive: () => keepAliveService.stop()
};
