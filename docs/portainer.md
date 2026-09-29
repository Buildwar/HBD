# Despliegue y Gestión en Portainer

Esta guía detalla el procedimiento paso a paso para desplegar, monitorizar, actualizar y revertir (rollback) **HBD (Home Board Designer)** en entornos de producción mediante **Portainer**.

---

## 1. Arquitectura de Despliegue

```
  ┌─────────────────────────────────────────────────────────────┐
  │                         PORTAINER                           │
  │                                                             │
  │   Stack: hbd                                                │
  │   Repositorio: https://github.com/adrianpalma360-create/HBD.git
  │   Compose: docker-compose.portainer.yml                     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
 ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
 │    hbd-db         │ │    backend        │ │    frontend       │
 │  (postgres:16)    │ │  (GHCR Image)     │ │  (GHCR Image)     │
 └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
           │                     │                     │
           ▼                     ▼                     ▼
   [ hbd_postgres_data ]   [ hbd_uploads ]       [ Puerto 3003 ]
```

Portainer **no compila el código fuente**. Descarga e instancia directamente las imágenes Docker generadas por GitHub Actions en GitHub Container Registry (`ghcr.io`).

---

## 2. Procedimiento de Despliegue Inicial

### Paso 1: Crear nuevo Stack
1. Accede a tu panel de Portainer.
2. En el menú lateral, selecciona **Stacks** y haz clic en **+ Add stack**.
3. Asigna un nombre al Stack: `hbd`.

### Paso 2: Seleccionar método de repositorio Git
1. En la sección **Build method**, selecciona **Repository**.
2. Configura los parámetros:
   - **Repository URL**: `https://github.com/adrianpalma360-create/HBD.git`
   - **Repository reference**: `refs/heads/main` (o rama `main`)
   - **Compose path**: `docker-compose.portainer.yml`

### Paso 3: Configuración de Variables de Entorno
En la sección **Environment variables**, añade las variables requeridas (puedes tomar como referencia el archivo `.env.example`):

| Variable | Descripción | Ejemplo / Valor Recomendado |
| :--- | :--- | :--- |
| `HBD_VERSION` | Versión de la imagen GHCR | `9.0.0` o `latest` |
| `HBD_EXTERNAL_PORT` | Puerto de acceso en host | `3003` |
| `POSTGRES_USER` | Usuario de base de datos | `hbd_user` |
| `POSTGRES_PASSWORD` | Contraseña base de datos | *(Generar contraseña segura)* |
| `POSTGRES_DB` | Nombre de base de datos | `hbd_db` |
| `JWT_SECRET` | Secreto para firma JWT | *(Cadena aleatoria de 64+ caracteres)* |
| `JWT_EXPIRES_IN` | Caducidad del token | `7d` |
| `ADMIN_EMAIL` | Email administrador inicial | `admin@hbd.local` |
| `ADMIN_USERNAME` | Usuario administrador | `admin` |
| `ADMIN_PASSWORD` | Contraseña administrador | *(Contraseña inicial para primer login)* |
| `ADMIN_NAME` | Nombre completo admin | `Administrador del Sistema` |
| `AI_PROVIDER` | Proveedor de IA de diseño | `mock` (o `openai`) |
| `AI_API_KEY` | Clave API para IA (opcional) | *(vacío para mock)* |
| `AI_VISION_PROVIDER`| Proveedor IA visión | `mock` (o `openai`) |
| `AI_VISION_API_KEY` | Clave API visión (opcional) | *(vacío para mock)* |

### Paso 4: Desplegar el Stack
1. Haz clic en **Deploy the stack**.
2. Portainer clonará la configuración del compose, descargará las imágenes de `ghcr.io` y levantará los servicios en orden de dependencia.

---

## 3. Verificación Posterior al Despliegue

1. **Estado de Contenedores**:
   - `hbd-portainer-db`: `healthy`
   - `hbd-portainer-backend`: `healthy`
   - `hbd-portainer-frontend`: `running` / `healthy`
2. **Volúmenes Persistentes**:
   - Comprueba en **Volumes** que `hbd_postgres_data` y `hbd_uploads` están asignados y activos.
3. **Endpoint de Salud**:
   - Accede a `http://<IP-DEL-HOST>:3003/api/health` o `http://<IP-DEL-HOST>:3003/health` para verificar la respuesta `{"status":"ok"}`.
4. **Acceso Web**:
   - Abre en el navegador `http://<IP-DEL-HOST>:3003`.

---

## 4. Actualización Controlada de Versión

Cuando se publique una nueva versión (por ejemplo `9.0.1` o `10.0.0`):

1. Accede al Stack `hbd` en Portainer.
2. Ve a la pestaña **Editor**.
3. En la sección **Environment variables**, cambia:
   ```env
   HBD_VERSION=9.0.1
   ```
4. Haz clic en **Update the stack**.
5. Marca la casilla **Re-pull image** si deseas asegurar la descarga de la última versión etiquetada.
6. Haz clic en **Update**. Portainer sustituirá los contenedores de aplicación conservando intactos los volúmenes de base de datos y uploads.

---

## 5. Procedimiento de Rollback (Reversión Segura)

Si una nueva versión presenta cualquier anomalía:

1. Ve a Portainer → **Stacks** → `hbd`.
2. En **Editor** → **Environment variables**, establece `HBD_VERSION` con el número de la versión estable previa (ejemplo `9.0.0`).
3. Haz clic en **Update the stack**.
4. La aplicación volverá inmediatamente a la versión anterior.
5. **Preservación de Datos**: La base de datos en `hbd_postgres_data` y los archivos en `hbd_uploads` no se alteran durante el rollback.

---

## 6. Copias de Seguridad (Backups)

Antes de cualquier actualización mayor, se recomienda respaldar los dos volúmenes persistentes:

1. **Base de Datos PostgreSQL**:
   ```bash
   docker exec -t hbd-portainer-db pg_dump -U hbd_user hbd_db > backup_hbd_$(date +%Y%m%d).sql
   ```
2. **Archivos y Planos (`uploads`)**:
   ```bash
   tar -czvf backup_uploads_$(date +%Y%m%d).tar.gz /var/lib/docker/volumes/hbd_uploads/_data
   ```
