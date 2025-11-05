#!/bin/sh
set -e

echo "=== Starting MeshHome Server ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "PORT: ${PORT}"
echo "HOST: ${HOST}"
echo "================================"

# Start the server in the background and wait for it
npx react-router-serve ./build/server/index.js --port 3000 --host 0.0.0.0 &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Wait for the server process
wait $SERVER_PID
