# Dockerfile optimisé pour React Router v7 + Hono sur Northflank
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files from apps/web directory
COPY apps/web/package.json apps/web/package-lock.json* ./

# Install dependencies
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ .

# Build the app
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactrouter

# Copy built application
COPY --from=builder --chown=reactrouter:nodejs /app/build ./build
COPY --from=builder --chown=reactrouter:nodejs /app/package.json ./package.json
COPY --from=builder --chown=reactrouter:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=reactrouter:nodejs /app/start-server.sh ./start-server.sh

# Make script executable
RUN chmod +x ./start-server.sh

USER reactrouter

# Expose port
EXPOSE 3000

# Set host to 0.0.0.0 to accept connections from outside container
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the server directly using node with the production server script
CMD ["node", "production-server.js"]
