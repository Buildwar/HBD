# ============================================================
# HBD — HOME BOARD DESIGNER
# CLIENT SPA DOCKERFILE (Multi-stage build with Nginx)
# ============================================================

# 1. Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/
RUN npm install --workspace=shared --workspace=client

COPY shared ./shared
RUN npm --workspace=shared run build

COPY client ./client
RUN npm --workspace=client run build

# 2. Production Nginx runtime stage
FROM nginx:alpine AS production
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
