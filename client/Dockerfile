# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/
RUN npm install --workspace=shared --workspace=client

COPY shared ./shared
RUN npm --workspace=shared run build

COPY client ./client
RUN npm --workspace=client run build

# Nginx stage
FROM nginx:alpine AS production
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
