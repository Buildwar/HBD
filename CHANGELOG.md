# Changelog — HBD (Home Board Designer)

Todos los cambios notables en este proyecto son documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## Estructura y Reglas Oficiales de Versionado HBD
- **Fase de Roadmap:** Identificada como `V1`, `V2`, `V3`... `V20`, `V21`...
- **Versión Semántica de Software:** `MAJOR.MINOR.PATCH` donde:
  - `MAJOR = 1`: Generación principal del producto.
  - `MINOR`: Fase funcional del roadmap (`1.0.0` para Fase V1, `1.2.0` para Fase V2, `1.20.0` para Fase V20, `1.21.0` para Fase V21).
  - `PATCH`: Correcciones, ajustes y revisiones dentro de la misma fase (`1.20.1`, `1.20.2`...).

## [1.24.5] — V24 Patch

### Brand Identity & Application Icons

- Nueva identidad visual de HBD.
- Nuevo logotipo y logomark.
- Nuevo favicon.
- Nuevos iconos de aplicación.
- Integración del branding en Login, Sidebar, Header y Acerca de.
- Assets optimizados para producción.
- Mantenimiento del sistema centralizado de temas y colores de acento.

## [1.24.4] — V24 Patch (2026-10-06)
### Application Recovery & Stability Repair
- **Recuperación del Arranque del Frontend y Backend:** Resolución del bloqueo de inicialización asegurando que el frontend escuche de manera estable y continua en el puerto `3003` y el backend en el puerto `4003`.
- **Estabilización de i18n y Protección de Runtime:** Corrección del orden de importación en `main.tsx` garantizando la inicialización síncrona de `i18n.js` antes de la evaluación de componentes, y blindaje de llamadas a `i18n.language` con fallbacks seguros en `Navbar.tsx` y `SettingsPage.tsx` para evitar excepciones `TypeError`.
- **Integridad de Navegación y Rutas:** Verificación integral de todas las rutas directas y lazy-loaded (`Suspense`), preservando todos los módulos desde V1 hasta V24.
- **Validación Completa de Build y Tests:** Compilación exitosa al 100% en todos los workspaces (`shared`, `server`, `client`) con 0 errores de TypeScript y Vite, y paso exitoso de todas las pruebas automatizadas (70 pruebas de versión y 52 pruebas de auditoría i18n).
- **Preservación de Datos:** Conservación estricta y no destructiva de base de datos PostgreSQL, usuarios, roles, proyectos y configuraciones.

## [1.24.3] — Fase V24.3 (2026-10-05)
### Complete Internationalization & Translation Repair
- **Reparación y Reemplazo Exhaustivo de Cadenas Hardcodeadas:** Migración completa a `useTranslation()` en todos los componentes del frontend (Editor 2D, Visor 3D, Renders, IA Diseño/Visión, Construcción, Escenarios, Optimización, Documentos, Ejecución, Finanzas, Compras, Catálogo Retail, Infraestructura Técnica, AR, Property Intelligence, Copilot, Modales y Tablas).
- **Traducción Universal de Enums y Estados de Sistema:** Estandarización de badges y estados técnicos (`CONFIRMED`, `ESTIMATED`, `HIGH`, `MEDIUM`, `LOW`, `ACTIVE`, `COMPLETED`, `DRAFT`, etc.) con etiquetas 100% traducibles tanto en español como en inglés.
- **Ampliación y Sincronización de Diccionarios de Idiomas:** Integración exhaustiva de claves en `es.json` y `en.json` con paridad total de namespaces, eliminando cualquier texto no traducido o clave expuesta.
- **Suite de Pruebas y Validación i18n:** Ejecución automatizada de auditoría `i18n-audit.test.ts` asegurando 0 textos faltantes, 0 textos vacíos y cobertura integral de los componentes.

## [1.24.2] — Fase V24.2 (2026-10-05)
### Internationalization & Translation Hardening
- **Auditoría Exhaustiva de Claves i18n:** Paridad 100% estricta (788 claves) entre los diccionarios español (`es.json`) e inglés (`en.json`) sin claves faltantes ni valores vacíos.
- **Internacionalización Integral de la Interfaz:** Reemplazo de cadenas hardcodeadas en vistas y componentes clave (Sidebar, Navbar, SettingsTabs, RetailCatalog, Copilot, Property, etc.) mediante el hook reactivo `useTranslation()`.
- **Detección y Persistencia Reactiva:** Cambio dinámico de idioma en tiempo real sin recarga de página, con persistencia automática en `localStorage` y selector en Navbar y panel de Configuración.
- **Suite de Pruebas de Auditoría i18n:** Implementación del test automatizado `i18n-audit.test.ts` verificando paridad exacta de diccionarios, ausencia de cadenas vacías, fallback a español y cobertura de claves.

## [1.24.1] — Fase V24.1 (2026-10-05)
### Release Hardening & Bundle Optimization
- **Frontend Code-Splitting & Lazy Loading:** División de código mediante `React.lazy()` y `Suspense` para vistas pesadas y dependencias gráficas (`Viewer3DPage`, `ARVisualizationPage`, `RendersPage`, etc.), reduciendo drásticamente el tamaño inicial de carga del cliente.
- **Rollup & Chunking Optimization:** Configuración optimizada de empaquetado Vite para aislar módulos vendor (`three`, `lucide-react`, `i18n`, `react`) y evitar chunks monolíticos.
- **Verificación de Entorno de Producción:** Validación exhaustiva de plantillas `.env.example`, variables de entorno y compatibilidad de despliegue.
- **Auditoría de Seguridad y CORS:** Verificación de políticas CORS, rate limiting, sanitización de entradas y protección de rutas.
- **Sincronización Semántica de Versión:** Actualización uniforme a `1.24.1` en `version.json`, `package.json`, paquetes de workspaces, configuraciones de cliente/servidor y suites de pruebas automatizadas.

## [1.24.0] — Fase V24 (2026-10-05)
### HBD AI Copilot
- **Copiloto Inteligente Integral:** `AICopilotEngine` y `AIOrchestrator` como capa superior de orquestación para diseño, reforma, mobiliario, compras, finanzas, infraestructura técnica y propiedad.
- **Principio Fundamental de Veracidad:** La IA razona, explica, planifica y propone acciones estructuradas, mientras que los motores de negocio y geometría de HBD (`GeometryEngine`, `FurnitureEngine`, `RetailCatalog`, `FinancialEngine`, `ConstructionIntelligence`) calculan, validan y persisten datos reales.
- **Sistema de Herramientas y Registro:** `ToolRegistry` con validación de esquemas, permisos granulares (`ai.read`, `ai.use`, `ai.execute`, `ai.confirm`, `ai.manage`), niveles de riesgo (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) y confirmación obligatoria.
- **Acciones Estructuradas con Confirmación:** `AIAction` para operaciones seguras (añadir/mover mobiliario, registrar infraestructura, crear escenarios, planificar compras, generar documentos y renders), exigiendo confirmación del usuario para acciones persistentes o de alto riesgo sin ejecutar compras ni destrucciones automáticas.
- **Contexto Progresivo por Capas:** `AIProjectContext` con 9 niveles de contexto bajo demanda (Resumen, Estancia, Geometría, Mobiliario, Técnico, Productos, Finanzas, Construcción, Ejecución) con minimización de datos y protección de privacidad.
- **Presupuestación Real y Rango de Precios:** Desglose con fuentes verificadas (`Retail Catalog`, `Financial Intelligence`, `Procurement Quotes`, `Estimated`), marcando datos estimados sin inventar precios ni disponibilidad.
- **Integración Transversal Completa:** Conexión con Geometría (V4), Mobiliario (V5), 3D (V6), Renders (V7), IA Diseño/Visión (V8/V9), Espacios (V10), Construcción (V11), Escenarios (V12), Optimización (V13), Documentos (V14), Ejecución (V15), Importación (V16), Finanzas (V17), Compras (V18), Catálogo Retail (V20), Infraestructura Técnica (V21), AR (V22) y Propiedad (V23).
- **Abstracción de Proveedor IA:** Soporte desacoplado para proveedores externos y `MockAICopilotProvider` para desarrollo y tests sin dependencia obligatoria de APIs de terceros.
- **Interfaz Copilot Sidepanel:** Panel lateral interactivo con soporte para chat en lenguaje natural, tarjetas estructuradas de productos y presupuestos, comparadores de alternativas, botones de acción y confirmación visual.

## [1.23.0] — Fase V23 (2026-10-05)
### Property Intelligence
- **Inteligencia Integral del Inmueble:** Modelo centralizado `Property` independiente y desacoplado de proyectos específicos, permitiendo a un inmueble físico albergar múltiples proyectos (reformas, escenarios alternativos, actualizaciones técnicas).
- **Instantáneas Históricas del Inmueble:** `PropertySnapshot` para preservar estados temporales (estado inicial, estado propuesto, tras reforma, ejecutado) sin sobreescritura de datos.
- **Trazabilidad de Fuentes y Confianza:** Atribución estricta de procedencia (`OFFICIAL`, `USER_PROVIDED`, `DOCUMENT`, `PLAN`, `IMAGE`, `VISION`, `CATALOG`, `MEASURED`, `CALCULATED`, `AI_ESTIMATED`, `UNKNOWN`) y niveles de confianza (`CONFIRMED`, `ESTIMATED`, `CALCULATED`, `UNKNOWN`) para toda métrica y valoración.
- **Perfil Espacial y Distribución:** Resumen holístico de superficies (construida, útil, parcela), estancias, zonas de circulación, adyacencias funcionales y recorridos integrando `GeometryEngine` y `SpatialRulesEngine`.
- **Detección de Oportunidades y Mejoras:** `PropertyOpportunityEngine` para sugerir optimizaciones de distribución, almacenamiento, climatización, conectividad, eficiencia y domótica con priorización (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Gestión de Riesgos e Intervenciones:** `PropertyRiskEngine` para categorizar riesgos estructurales, eléctricos, fontanería, humedades, costes y plazos, marcando estimaciones de IA como potenciales que requieren validación profesional.
- **Auditoría de Calidad del Dato:** `PropertyDataQualityEngine` con cálculo de tasa de completitud, datos confirmados vs estimados y frescura temporal.
- **Consolidación Transversal sin Duplicación:** Consumo unificado de datos de Mobiliario (V5/V20), Instalaciones Técnicas (V21), Reformas (V11), Ejecución (V15), Finanzas y Retorno (V17), Compras (V18), IA y Visión (V8/V9) y Realidad Aumentada (V22).

## [1.22.0] — Fase V22 (2026-10-05)
### AR / Real Space Visualization
- **Motor de Visualización en Espacio Real:** `ARVisualizationEngine` para proyectar el modelo 3D de HBD sobre el entorno físico mediante WebXR, cámara o fallback basado en fotografías.
- **Detección de Capacidades del Dispositivo:** `ARCapabilityEngine` con auditoría de WebXR, detección de planos/superficies, seguimiento de imágenes, estimación de luz y fallbacks adaptativos (`AR_LIVE`, `PHOTO_AR`, `AR_PREVIEW`, `SIDE_BY_SIDE`, `OVERLAY`, `BEFORE_AFTER`).
- **Sistema de Calibración Métrica:** `ARCalibrationEngine` con referencias reales (puertas, ventanas, paredes, muebles, marcadores) para un ajuste de escala riguroso sin inventar precisión.
- **Anchors y Detección de Superficies:** `ARAnchorEngine` con fijación espacial de muebles (`FurnitureTwin` V20) e infraestructura técnica (V21), control de colisiones en tiempo real mediante `GeometryEngine` y `SpatialValidationEngine`.
- **Herramientas de Medición y Comparación:** Medición 3D punto a punto con cualificación de precisión (`HIGH`, `MEDIUM`, `LOW`, `UNKNOWN`), comparador interactivo Antes/Después y capturas de escena integrables en la Documentación Ejecutiva V14.
- **Trazabilidad y Veracidad:** Identificación transparente de la procedencia de modelos 3D (`OFFICIAL_3D`, `USER_PROVIDED`, `IMPORTED`, `AI_RECONSTRUCTED`, `PARAMETRIC`, `PRIMITIVE`), materiales y precios (V17/V18/V20).

## [1.21.0] — Fase V21 (2026-10-05)
### Smart Home & Technical Infrastructure
- **Infraestructura Técnica Multicapa:** Soporte integral para 10 capas técnicas (Electricidad, Iluminación, Red de Datos, Cobertura Wi-Fi, Domótica/Smart Home, Seguridad, Climatización/HVAC, Fontanería/Saneamiento, Multimedia y Cuartos/Zonas Técnicas).
- **Modelado 2D/3D de Instalaciones:** Elementos técnicos (`TechnicalElement`) con tipos de montaje (pared, suelo, techo, empotrado, superficie), cotas de altura, rotación y visualización 3D con gemelo técnico.
- **Conexiones y Canalizaciones:** Sistema de trazado de cableados, tuberías y enlaces lógicos (`TechnicalConnection`) con cálculo de longitudes, tipo de medio y canalizaciones/rozas asociadas.
- **Cuartos y Cuadros Técnicos:** Gestión de cuadros eléctricos, racks de red, colectores de fontanería y pasarelas domóticas (`TechnicalZone`).
- **Motores Especializados de Cálculo:**
  - `ElectricalEngine`: Cálculo de potencia instalada/simultánea, balanceo de fases y asignación de circuitos.
  - `NetworkInfrastructureEngine`: Asignación de puertos de switch, balance de potencia PoE y presupuestos de latencia/distancia.
  - `WiFiCoverageEngine`: Simulación de propagación RF 2.4/5/6 GHz, atenuación por tipo de pared y generación de mapa de calor de cobertura.
  - `SmartHomeEngine`: Gestión de protocolos domóticos (Zigbee, Matter, Thread, KNX, WiFi, Z-Wave), topología mesh y automatizaciones.
  - `SecurityInfrastructureEngine`: Conos de visión (FOV) de cámaras de seguridad y zonas de cobertura de sensores PIR.
  - `HvacPlumbingEngine`: Distribución de caudal de climatización, pérdidas de carga de fontanería y pendientes mínimas de desagües.
  - `TechnicalValidationEngine`: Validación de distancias normativas (zonas húmedas REBT, alturas ergonómicas, cruces de instalaciones e interferencias con carpinterías/mobiliario con `GeometryEngine`).
- **Integración Transversal:** Conexión automática con Presupuesto V17 (`CostItem`), Compras V18 (`ProcurementItem`), Ejecución V15 (`ExecutionTask`) y Mediciones/Rozas V11.

## [1.20.0] — Fase V20 (2026-10-04)
### Connected Retail Catalog & Product Placement
- **Conectores Multitienda Desacoplados:** Arquitectura modular con aislamiento de fallos (`IRetailConnector`, `IkeaConnector`, `LeroyMerlinConnector`, `KaveHomeConnector`, `ConforamaConnector`, `MockRetailConnector`).
- **Motor de Búsqueda Federada Multitienda:** `RetailSearchEngine` con filtrado por facetas (categoría, precio, color, material, disponibilidad de stock).
- **Motor de Calidad de Datos:** `ProductDataQualityService` con puntuación de completitud y validación dimensional y económica.
- **Motor de Matching y Comparación:** `ProductMatchingEngine` para detección de equivalencias multitienda y matriz de pros/contras.
- **Validación Espacial Space Fit:** Integración con `GeometryEngine` para comprobar holguras, tolerancias y colisiones antes de añadir productos.
- **Digital Furniture Twin:** Conversión automática de productos reales a muebles 2D/3D con trazabilidad de origen y dimensiones métricas bloqueadas.
- **Integración Transversal V17 / V18:** Inserción directa de partidas en Finanzas (V17 — Costes Mobiliario) y Compras (V18 — Procurement items).
- **Administración en Configuración:** Pestaña de gestión de Retailers y conectores.

## [1.19.0] — Fase V19 (2026-10-04)
### Configuration & System Management — Functionalization & UX
- Funcionalización completa de los paneles de Configuración (Apariencia, Idioma, Cuenta, Usuarios, Roles, General, Proyectos, IA y Visión, Almacenamiento, Seguridad, Sistema, Acerca de).
- Persistencia real en base de datos (`AppSetting`) y auditoría de acciones del sistema.

## [1.18.0] — Fase V18 (2026-10-04)
### Procurement & Project Purchasing Intelligence
- Motor integral de compras y aprovisionamiento (`ProcurementEngine`, `PurchasePlanningEngine`, `ProcurementRiskEngine`).
- Comparador multicriterio de cotizaciones y control de pedidos, recepciones e incidencias.

## [1.17.0] — Fase V17 (2026-10-04)
### Project Investment & Total Cost Intelligence
- Capa transversal financiera y desglose de costes del proyecto en 10 categorías (Reforma vs Mobiliario vs Equipamiento).

## [1.16.0] — Fase V16 (2026-10-02)
### Real Product Import & Digital Furniture Twin
- Importación de productos reales desde URL o catálogo, extracción de datos estructurados y gemelo digital de mobiliario.

## [1.15.0] — Fase V15 (2026-10-02)
### Construction Execution & Site Management
- Gestión y ejecución de obras, diario de obra, libro de órdenes, hitos y control de desviaciones.

## [1.14.0] — Fase V14 (2026-10-02)
### Professional Project Documentation & Presentation
- Generación automatizada de memorias técnicas, planos y dossiers ejecutivos de proyecto.

## [1.13.0] — Fase V13 (2026-10-02)
### Intelligent Design Optimization Engine
- Optimización automática de distribución espacial, ergonomía, circulaciones y análisis bioclimático.

## [1.12.0] — Fase V12 (2026-10-02)
### Intelligent Project Planning & Scenario Engine
- Planificación temporal y simulador de escenarios comparativos de reforma.

## [1.11.0] — Fase V11 (2026-10-02)
### Construction & Renovation Intelligence
- Estimación paramétrica de partidas de obra, demoliciones, albañilería e instalaciones.

## [1.10.0] — Fase V10 (2026-10-01)
### Project & Spatial Intelligence
- Reglas espaciales, validación geométrica de estancias y normativas de habitabilidad.

## [1.9.0] — Fase V9 (2026-10-01)
### AI Vision & Multimodal Spatial Recognition
- Reconocimiento multimodal de imágenes de estancias y extracción de mobiliario.

## [1.8.0] — Fase V8 (2026-10-01)
### AI Design & Interiorism
- Asistente de interiorismo con inteligencia artificial generativa y presets de estilo.

## [1.7.0] — Fase V7 (2026-10-01)
### Rendering & Visualization
- Motor de renderizado con modos día/noche, iluminación y presets de cámara.

## [1.6.0] — Fase V6 (2026-09-28)
### 3D Engine
- Motor tridimensional basado en Three.js con navegación en primera persona y visualización volumétrica.

## [1.5.0] — Fase V5 (2026-09-28)
### Furniture Engine
- Catálogo de mobiliario 2D/3D con posicionamiento y validación de colisiones.

## [1.4.0] — Fase V4 (2026-09-28)
### Floorplan Engine
- Detección vectorial de planos, estancias, paredes, puertas y ventanas.

## [1.3.0] — Fase V3 (2026-09-28)
### Project & Floorplan Management
- Gestión de proyectos arquitectónicos, plantas y calibración de escalas.

## [1.2.0] — Fase V2 (2026-09-28)
### Design System, Theming & Multi-Language
- Sistema de diseño con temas personalizables e internacionalización (ES / EN).

## [1.0.0] — Fase V1 (2026-09-28)
### Core Architecture & Foundations
- Arquitectura central, autenticación JWT, RBAC y persistencia PostgreSQL con Prisma.
