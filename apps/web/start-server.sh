#!/bin/sh
set -e

echo "=== Starting MeshHome Server ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "PORT: ${PORT}"
echo "HOST: ${HOST}"
echo "================================"

# Start the server and keep it running
exec npx react-router-serve ./build/server/index.js --port 3000 --host 0.0.0.0
