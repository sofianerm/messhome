import { serve } from '@hono/node-server';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting MeshHome Server`);
console.log(`   Port: ${port}`);
console.log(`   Host: ${host}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`   Node: ${process.version}`);

try {
  // Import the server (it uses top-level await)
  const { default: server } = await import('./build/server/index.js');

  if (!server || !server.fetch) {
    throw new Error('Server module did not export a valid Hono app');
  }

  // Start the server
  const serverInstance = serve({
    fetch: server.fetch,
    port,
    hostname: host,
  }, (info) => {
    console.log(`✅ Server is running on http://${info.address}:${info.port}`);
    console.log(`Ready to accept connections!`);
  });

  console.log('Server instance created:', serverInstance ? 'yes' : 'no');

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
  });

  // Keep process alive
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
