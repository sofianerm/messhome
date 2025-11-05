#!/bin/sh

echo "=== Starting MeshHome Server ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "PORT: ${PORT}"
echo "HOST: ${HOST}"
echo "================================"

# Infinite loop to keep restarting if server crashes
while true; do
    echo "Starting server..."
    npm start
    EXIT_CODE=$?
    echo "Server exited with code: $EXIT_CODE"

    # If exit code is not 0, something went wrong
    if [ $EXIT_CODE -ne 0 ]; then
        echo "Server crashed! Restarting in 5 seconds..."
        sleep 5
    else
        # Exit code 0 means clean shutdown - also restart but with shorter delay
        echo "Server stopped cleanly. Restarting in 2 seconds..."
        sleep 2
    fi
done
