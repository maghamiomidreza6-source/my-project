# ===============================================
# Production Multi-Layer Dockerfile
# Issue & Task Tracking Backend Service
# ===============================================

FROM node:20-alpine

# Working directory inside container
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY src/ ./src/

# Environment settings
ENV NODE_ENV=production
ENV PORT=8080

# Expose mapped port
EXPOSE 8080

# Security: Non-root execution
USER node

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# Start server
CMD ["node", "src/server.js"]
