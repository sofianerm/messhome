// Production server entry point
// This script simply imports the built server module which automatically starts the HTTP server
// The server stays alive because the HTTP listener keeps the event loop active

import { createHonoServer } from 'react-router-hono-server/node';

console.log('🚀 Initializing MeshHome Production Server...');
console.log(`   Node: ${process.version}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`   Port: ${process.env.PORT || '3000'}`);
console.log(`   Host: ${process.env.HOST || '0.0.0.0'}`);
console.log('');

try {
  // Import the base Hono app with middlewares
  const { default: baseApp, serverConfig } = await import('./build/server/index.js');

  console.log('✅ Base app module loaded successfully');
  console.log('🔧 Creating full server with React Router integration...');

  // Create the full Hono server with React Router SSR
  // This adds the React Router request handler and serves static files
  await createHonoServer({
    app: baseApp,
    ...serverConfig,
  });

  console.log('📡 Server with React Router started successfully');

} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Handle shutdown signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
