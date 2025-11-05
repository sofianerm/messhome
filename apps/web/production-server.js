// Production server entry point
// This script simply imports the built server module which automatically starts the HTTP server
// The server stays alive because the HTTP listener keeps the event loop active

console.log('🚀 Initializing MeshHome Production Server...');
console.log(`   Node: ${process.version}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`   Port: ${process.env.PORT || '3000'}`);
console.log(`   Host: ${process.env.HOST || '0.0.0.0'}`);
console.log('');

try {
  // Import the server module - it starts the server automatically via top-level await
  await import('./build/server/index.js');

  console.log('✅ Server module loaded successfully');
  console.log('📡 Server is now handling requests');

} catch (error) {
  console.error('❌ Failed to start server:', error);
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
