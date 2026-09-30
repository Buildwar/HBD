# ============================================================
# HBD — HOME BOARD DESIGNER
# SERVER DOCKERFILE (Multi-stage build)
# ============================================================

# 1. Base stage
FROM node:22-alpine AS base
WORKDIR /app

# 2. Dependencies & Build stage
FROM base AS dependencies
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN npm install --workspace=shared --workspace=server

# Copy source code
COPY shared ./shared
RUN npm --workspace=shared run build

COPY server ./server
RUN cd server && npx prisma generate && npm run build

# 3. Production runtime stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY --from=dependencies /app/shared/dist ./shared/dist
COPY server/package.json ./server/
COPY server/prisma ./server/prisma

RUN npm install --omit=dev --workspace=shared --workspace=server
RUN cd server && npx prisma generate

COPY --from=dependencies /app/server/dist ./server/dist

# Expose backend API port
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Launch migrations and application server
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && node dist/server.js"]
