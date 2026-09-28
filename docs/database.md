# Modelo de Datos — HBD (PostgreSQL & Prisma)

## Principios de Persistencia
1. **Sin resets destructivos**: Toda modificación en esquema se realiza mediante migraciones controladas (`prisma migrate dev` / `prisma migrate deploy`).
2. **Separación de Metadatos y Archivos Físicos**: Los archivos binarios (PDFs de planos, modelos 3D, texturas y renders) se almacenan en el volumen de `uploads/`, guardando en la BD exclusivamente sus metadatos, URLs relativas, tamaño y dimensiones.

---

## Diagrama Entidad-Relación Conceptual

```
User (1) ───< (N) Project (1) ───< (N) Floor (1) ───< (N) Room
                                      │  │  │
                                      │  │  └───< (N) Wall ───< (N) Door / Window
                                      │  │
                                      │  └──────< (N) FloorPlan (Análisis & Escala)
                                      │
                                      └─────────< (N) FurniturePlacement >─── (1) Furniture >─── (1) Category
```

---

## Principales Tablas
- `users`: Cuentas, credenciales seguras (bcrypt), preferencias de tema y lenguaje.
- `roles` & `permissions`: Sistema RBAC extensible.
- `projects`: Viviendas, propiedades y reformas.
- `floors`: Plantas asociadas a una vivienda (Planta Baja, 1ª Planta, Garaje...).
- `floor_plans`: Planos PDF/imágenes, factor de escala (píxeles/metro) y datos del análisis.
- `walls`: Paredes exteriores, interiores y tabiques con grosor y altura calculados.
- `rooms`: Habitaciones poligonales con cálculo dinámico de superficie ($m^2$).
- `doors` & `windows`: Huecos arquitectónicos y sentido de apertura.
- `furniture_categories` & `furniture`: Catálogo de muebles reales y personalizados.
- `furniture_placements`: Posicionamiento espacial y rotación en planta.
- `measurements`: Cotas y mediciones interactivas.
- `renders`: Galería de visualizaciones de proyecto.
- `app_settings` & `system_logs`: Configuración y auditoría no destructiva.
