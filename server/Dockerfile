# Base stage
FROM node:22-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN npm install --workspace=shared --workspace=server

# Build shared
COPY shared ./shared
RUN npm --workspace=shared run build

# Build server
COPY server ./server
RUN cd server && npx prisma generate && npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY shared/package.json ./shared/
COPY shared/dist ./shared/dist
COPY server/package.json ./server/
COPY server/prisma ./server/prisma

RUN npm install --omit=dev --workspace=shared --workspace=server
RUN cd server && npx prisma generate

COPY --from=dependencies /app/server/dist ./server/dist

EXPOSE 4000

CMD ["sh", "-c", "cd server && npx prisma migrate deploy && node dist/server.js"]
