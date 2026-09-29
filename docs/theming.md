# 🎨 HBD — Sistema de Temas y Tokens de Diseño (V2.0.0)

El sistema de temas de **HBD (Home Board Designer)** está diseñado sobre una arquitectura centralizada de tokens en cascada, garantizando reactividad en tiempo real, persistencia multiplataforma y desacoplamiento visual.

---

## 1. Arquitectura de Tokens

```
                      ┌────────────────────────────┐
                      │    User Theme Preference   │
                      │  (Database / LocalStorage) │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │       ThemeProvider        │
                      │  (React Context + State)   │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │       CSS Variables        │
                      │ (:root / .dark Tokens)     │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │    Tailwind CSS Engine     │
                      │   (Dynamic RGB mappings)   │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │  Toda la Interfaz de HBD   │
                      │ (Sidebar, Buttons, Cards)  │
                      └────────────────────────────┘
```

---

## 2. Variables CSS Centralizadas

Las variables se inyectan dinámicamente en el elemento `:root` / `.dark` del DOM:

| Token CSS | Descripción | Ejemplo / Valor |
|---|---|---|
| `--color-bg` | Fondo principal de la aplicación | `#0b0c0e` (dark) / `#f8fafc` (light) |
| `--color-surface` | Superficies de barras, modales y paneles | `#141519` (dark) / `#ffffff` (light) |
| `--color-card` | Fondo de tarjetas y elementos secundarios | `#1c1e24` (dark) / `#f1f5f9` (light) |
| `--color-border` | Bordes y divisores estructurales | `#2d303b` (dark) / `#cbd5e1` (light) |
| `--primary-r, --primary-g, --primary-b` | Canales RGB del color de acento activo | `16, 185, 129` (Emerald) |
| `--color-primary` | Color primario en formato RGB | `rgb(var(--primary-r), ...)` |
| `--color-primary-hover` | Tinte calculado para estado hover | `#059669` |
| `--color-primary-active` | Tinte calculado para estado active | `#047857` |
| `--color-primary-glow` | Resplandor y sombras con opacidad | `rgba(var(--primary-r), ..., 0.28)` |
| `--radius` | Radio de bordes configurable | `0.5rem`, `0.75rem`, `1.0rem` |

---

## 3. Paletas y Temas Predefinidos (V2.0.0)

HBD incluye 8 paletas calibradas para entornos oscuros y claros:

1. **HBD Emerald** (`#10b981`): Verde esmeralda equilibrado y predeterminado.
2. **HBD Spotify** (`#1db954`): Verde vibrante de alta visibilidad.
3. **HBD Ocean Blue** (`#0ea5e9`): Azul cielo tecnológico y profesional.
4. **HBD Electric Indigo** (`#6366f1`): Índigo moderno para diseño espacial.
5. **HBD Purple Neon** (`#a855f7`): Púrpura contemporáneo y creativo.
6. **HBD Amber Gold** (`#f59e0b`): Ámbar cálido para arquitectura y acabados.
7. **HBD Rose Red** (`#f43f5e`): Rojo carmesí enérgico.
8. **HBD Cyan Sky** (`#06b6d4`): Cian luminoso de máxima precisión.

Además, el usuario puede seleccionar **cualquier color personalizado** mediante el selector hexadecimal interactivo en `Configuración → Apariencia`.

---

## 4. Persistencia y Sincronización

1. **LocalStorage**: Los cambios se reflejan inmediatamente en el almacenamiento local para evitar parpadeos visuales al recargar.
2. **Base de Datos**: Si el usuario está autenticado, la preferencia se almacena en el campo `themePreferences` (JSON) del modelo `User` en PostgreSQL.
3. **Flujo de Carga**:
   - `AuthProvider` autentica y recupera el perfil del usuario.
   - `ThemeProvider` detecta las preferencias sincronizadas y aplica instantáneamente las variables CSS correspondientes.

---

## 5. Cómo Añadir un Nuevo Tema Predefinido

Para registrar una nueva paleta en el sistema:

1. Abre `client/src/context/ThemeContext.tsx`.
2. Añade un objeto al arreglo `THEME_PRESETS`:
```typescript
{
  id: 'nuevo-tema',
  name: 'HBD Coral',
  hex: '#ff6b6b',
  description: 'Tono coral cálido'
}
```
3. El sistema calculará automáticamente los componentes RGB, las clases de Tailwind (`brand-500`, `brand-400`, `brand-500/20`, etc.), los efectos de foco y los estados hover sin modificar ningún componente individual.
