import { serve } from '@hono/node-server';

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Starting server on ${host}:${port}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Import the server (it uses top-level await)
const { default: server } = await import('./build/server/index.js');

serve({
  fetch: server.fetch,
  port,
  hostname: host,
}, (info) => {
  console.log(`✅ Server is running on http://${info.address}:${info.port}`);
});
