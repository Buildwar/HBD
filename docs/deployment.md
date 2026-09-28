# Guía de Despliegue — HBD (Docker & Portainer)

## 1. Despliegue Local con Docker Compose

Para levantar el entorno completo (PostgreSQL + Backend API + Frontend Nginx):

```bash
# 1. Configurar entorno
cp .env.example .env

# 2. Construir y levantar contenedores
docker compose up --build -d
```

- **Frontend**: [http://localhost:3003](http://localhost:3003)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

---

## 2. Despliegue en Portainer (Stack desde GitHub)

1. En tu panel de **Portainer**, navega a **Stacks** → **Add Stack**.
2. Selecciona el método **Repository** e introduce la URL de tu repositorio GitHub.
3. Especifica la ruta del archivo Compose: `docker-compose.portainer.yml`.
4. En la sección **Environment variables**, define las variables seguras:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_NAME`
   - `HBD_EXTERNAL_PORT` (por ejemplo: `8080`)
5. Haz clic en **Deploy the stack**.
