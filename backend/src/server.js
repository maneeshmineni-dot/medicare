const app = require('./app');
const { connectDB } = require('./config/db');
const { startKeepAlive } = require('./services/keepAliveService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  PharmaVision AI Server running on 0.0.0.0:${PORT}`);
    console.log(`  Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`====================================================`);

    // Start Render anti-sleep keep alive service
    startKeepAlive();
  });
}

startServer();
