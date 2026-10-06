# HBD — AI Copilot & Orchestration (Fase V24 / Versión 1.24.0)

## 1. Visión General
**HBD AI Copilot** es el copiloto inteligente integral de HBD (Home Board Designer). Actúa como la capa de orquestación superior del sistema, permitiendo al usuario interactuar en lenguaje natural con un asistente que comprende el contexto del proyecto, habitaciones, geometría, productos de catálogo, compras, finanzas, instalaciones técnicas, realidad aumentada e información del inmueble.

---

## 2. Principio Contractual Fundamental: La IA no es la Fuente de Verdad
* **La IA:** Razona, explica decisiones, detecta intenciones, planifica consultas y propone **acciones estructuradas**.
* **Los Motores de HBD:** Son los únicos autorizados para calcular presupuestos, validar colisiones espaciales, calcular recorridos de cableado/fontanería, comprobar normas de circulación y persistir cambios en la base de datos.
* **Transparencia en Precios y Mediciones:** No se inventan cifras. Todo importe o dimensión se atribuye con su procedencia (`RETAIL_CATALOG`, `FINANCIAL_ENGINE`, `PROCUREMENT`, `SUPPLIER_QUOTE`, `AI_ESTIMATED`, `UNKNOWN`) y su nivel de confianza (`HIGH`, `MEDIUM`, `LOW`). Las partidas estimadas (como mano de obra) se marcan explícitamente como `ESTIMATED`.

---

## 3. Arquitectura del Sistema

```
                    ┌─────────────────────────┐
                    │       Usuario / UI      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    HBD AI COPILOT UI    │
                    │   (Sidepanel & Page)    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   CopilotOrchestrator   │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ CopilotIntentEngine│ │CopilotContextEngine│ │ CopilotToolRegistry│
└────────────────────┘ └────────────────────┘ └──────────┬─────────┘
                                                         │
                                 ┌───────────────────────┴───────────────────────┐
                                 │ Motores Subyacentes:                         │
                                 │ • Geometry & Spaces (V4, V10)                 │
                                 │ • Furniture & 3D (V5, V6)                     │
                                 │ • Connected Retail Catalog (V20)             │
                                 │ • Technical Infrastructure & Smart Home (V21) │
                                 │ • Financial & Procurement (V17, V18)         │
                                 │ • Construction & Execution (V11, V15)        │
                                 │ • AR Visualization (V22)                     │
                                 │ • Property Intelligence (V23)                │
                                 └───────────────────────┬───────────────────────┘
                                                         │
                                                         ▼
                                            ┌─────────────────────────┐
                                            │   Acciones Estructuradas│
                                            │    (AICopilotAction)    │
                                            └────────────┬────────────┘
                                                         │
                                                         ▼
                                            ┌─────────────────────────┐
                                            │Confirmación del Usuario │
                                            └─────────────────────────┘
```

---

## 4. Contexto Progresivo por Capas (`AIProjectContext`)
Para optimizar el tamaño de payload y proteger la privacidad del usuario, el sistema aplica minimización de datos mediante 9 niveles de contexto:
* **Level 1 — Summary:** Resumen del proyecto, superficies totales, estancias y estado.
* **Level 2 — Room:** Estancia activa, superficie, tipo y perímetro.
* **Level 3 — Geometry:** Paredes, huecos, puertas y ventanas.
* **Level 4 — Furniture:** Mobiliario colocado y cotas.
* **Level 5 — Technical:** Elementos técnicos, cableados, potencia y cobertura RF.
* **Level 6 — Products:** Productos de catálogo retail asignados o sugeridos.
* **Level 7 — Financial:** Presupuesto global, partidas unitarias y desviaciones.
* **Level 8 — Construction:** Fases y tareas de reforma.
* **Level 9 — Execution:** Progreso de obra, incidencias y recepciones.

---

## 5. Herramientas del Orquestador (`ToolRegistry`)
| Herramienta | Categoría | Riesgo | Confirmación Requerida |
|---|---|---|---|
| `get_project_summary` | SYSTEM | LOW | No |
| `get_room_geometry` | GEOMETRY | LOW | No |
| `get_room_measurements` | GEOMETRY | LOW | No |
| `get_furniture` | FURNITURE | LOW | No |
| `search_products` | RETAIL | LOW | No |
| `check_product_fit` | FURNITURE | LOW | No |
| `calculate_project_cost` | FINANCIAL | LOW | No |
| `get_purchase_status` | PROCUREMENT | LOW | No |
| `get_construction_tasks` | CONSTRUCTION | LOW | No |
| `get_technical_infrastructure` | TECHNICAL | LOW | No |
| `get_property_insights` | PROPERTY | LOW | No |
| `compare_scenarios` | SCENARIO | LOW | No |
| `propose_furniture_placement` | FURNITURE | MEDIUM | **Sí** |
| `propose_create_scenario` | SCENARIO | MEDIUM | **Sí** |
| `propose_technical_element` | TECHNICAL | MEDIUM | **Sí** |
| `prepare_ar_session` | VISUALIZATION | LOW | No |
| `generate_document` | DOCUMENTATION | LOW | No |

---

## 6. Endpoints REST API
* `POST /api/ai/copilot/chat` — Envío de mensaje, orquestación y respuesta.
* `GET /api/ai/conversations` — Listado de conversaciones por usuario/proyecto.
* `POST /api/ai/conversations` — Creación de nueva conversación.
* `GET /api/ai/conversations/:id` — Consulta de conversación e histórico de mensajes.
* `DELETE /api/ai/conversations/:id` — Eliminación de conversación.
* `POST /api/ai/actions/:id/confirm` — Confirmación y ejecución de acción propuesta.
* `POST /api/ai/actions/:id/cancel` — Cancelación o rechazo de acción.
* `GET /api/ai/tools` — Catálogo de tools registradas con esquemas.
* `GET /api/ai/interactions` — Registro de auditoría de interacciones.
* `GET /api/ai/usage` — Métricas de consumo de tokens y llamadas.

---

## 7. Modelos de Base de Datos (Prisma ORM)
* `AIConversation`: Hilos de conversación vinculados al usuario, proyecto o inmueble.
* `AIMessage`: Mensajes con payload estructurado (`cardType`, `products`, `budgetBreakdown`, `fitCheckResult`, `alternatives`, `actions`, `sources`).
* `AIInteraction`: Registro de auditoría con latencia, estado y resumen de inputs/outputs.
* `AIAction`: Acciones estructuradas con ciclo de vida (`PENDING` -> `EXECUTED` / `CANCELLED`).
* `AIToolExecution`: Trazabilidad detallada de llamadas a tools y duración.
* `AIUsage`: Auditoría de consumo de tokens y modelos.

---

## 8. Autoría y Licencia
* **Autor:** Adrián Palma
* **Copyright:** © 2026 Adrián Palma — HBD (Home Board Designer). Todos los derechos reservados.
