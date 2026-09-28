# Guía de Desarrollo Local — HBD

## Requisitos Previos
- **Node.js**: v20 o superior (recomendado v22+)
- **npm**: v10 o superior
- **PostgreSQL**: v15 o superior (o ejecutar mediante Docker)
- **Docker**: (opcional para desarrollo local, requerido para despliegue)

---

## 1. Instalación Inicial
Clona el repositorio e instala las dependencias de los workspaces:

```bash
# Instalar todas las dependencias
npm install
```

---

## 2. Configuración de Variables de Entorno
Copia la plantilla de entorno:

```bash
cp .env.example .env
```

Ajusta la variable `DATABASE_URL` según tu instancia de base de datos PostgreSQL local o de Docker.

---

## 3. Base de Datos y Migraciones
Genera el cliente de Prisma y ejecuta las migraciones controladas:

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Aplicar migraciones
npm run prisma:migrate

# Ejecutar el seed inicial controlado (crea roles, permisos y admin demo)
npm run prisma:seed
```

---

## 4. Ejecución en Modo Desarrollo
Inicia tanto el backend Express como el frontend React Vite concurrentemente:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3003](http://localhost:3003)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Credenciales por defecto**: `admin` (o `admin@hbd.local`) / `admin_HBD`
