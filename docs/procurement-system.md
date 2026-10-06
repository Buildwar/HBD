# HBD V18.0.0 — Procurement & Project Purchasing Intelligence

**Home Board Designer**  
**Autor:** Adrián Palma  
**Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.

---

## 1. Visión General

HBD V18.0.0 introduce el motor integral de **Aprovisionamiento y Gestión de Compras de Proyecto** (*ProcurementEngine*, *PurchasePlanningEngine* y *ProcurementRiskEngine*).

Mientras V17 responde a la pregunta *"¿Cuánto cuesta el proyecto?"*, V18 responde a la operativa directa:
- **¿Qué necesitamos comprar y en qué cantidad?**
- **¿A qué proveedor se lo compramos y bajo qué condiciones?**
- **¿Cuándo debe pedirse para no bloquear la ejecución de la obra?**
- **¿Cuáles son las entregas en tránsito y las recepciones en obra?**
- **¿Qué compras presentan riesgo de retrasar el proyecto?**
- **¿Cómo gestionar albaranes, recepciones parciales, incidencias y devoluciones?**

---

## 2. Arquitectura del Sistema de Aprovisionamiento

El sistema conecta de forma fluida y transversal cuatro capas clave de HBD:
1. **V11 (Construction Intelligence):** Extracción de mediciones netas y cálculo de coeficientes de merma/sobrante para materiales.
2. **V15 (Construction Execution):** Vinculación con tareas de obra, fechas de ejecución en el diagrama de Gantt e hitos de montaje.
3. **V16 (Real Product Import & Digital Furniture Twin):** Inclusión de productos de catálogo con precios, dimensiones y proveedores oficiales, con exclusión estricta de elementos etiquetados como `DESIGN_ONLY`.
4. **V17 (Project Investment & Total Cost Intelligence):** Consolidación de costes previstos, importes comprometidos, pedidos emitidos y saldo pendiente de compra.

---

## 3. Motores de Inteligencia Especializados

### 3.1. `ProcurementEngine`
- **Normalización de Estados:** Ciclo de vida completo del aprovisionamiento: `DRAFT` $\rightarrow$ `NEEDED` $\rightarrow$ `REQUESTED` $\rightarrow$ `QUOTED` $\rightarrow$ `APPROVAL_PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `ORDERED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `PARTIALLY_RECEIVED` $\rightarrow$ `RECEIVED` $\rightarrow$ `INSPECTED` $\rightarrow$ `INSTALLED` $\rightarrow$ `COMPLETED`.
- **Comparador Multicriterio de Cotizaciones:** Análisis automático entre múltiples ofertas de distribuidores, identificando simultáneamente la opción de *Mejor Precio* y la de *Entrega Más Rápida*.
- **Agregación de Presupuesto:** Cálculo de presupuesto total de compras, costes comprometidos, importes desembolsados y saldo pendiente de contratar.

### 3.2. `PurchasePlanningEngine`
- **Cálculo de Mermas & Necesidad Neta:** Computación precisa de $\text{Necesidad Total} = \text{Cantidad Neta} \times (1 + \text{Merma}/100)$, cubriendo mermas típicas de corte y rotura (5% - 15%).
- **Planificación Temporal por Semanas:** Tramificación de compras por calendario de necesidad en obra para optimizar el almacenamiento y evitar saturación del espacio.

### 3.3. `ProcurementRiskEngine`
- **Detección Proactiva de Retrasos:** Evaluación de `leadTimeDays` frente a los días restantes hasta `requiredDate`.
- **Nivel de Riesgo de Suministro:** Clasificación en `SAFE`, `WARNING`, `AT_RISK` y `CRITICAL`.
- **Sugerencias de Mitigación:** Alertas automáticas para solicitar transportes urgentes o buscar suministros alternativos en stock local cuando una partida amenaza la ruta crítica de la obra.

---

## 4. Gestión de Órdenes, Recepción e Incidencias

- **Órdenes de Compra (`ProcurementOrder`):** Emisión formal de pedidos numerados a proveedores (`PO-YYYY-XXXX`), con desglose de líneas, costes de envío, impuestos y condiciones pactadas.
- **Recepción en Obra & Albaranes (`ProcurementDelivery`):** Registro de cantidades recibidas, dañadas y faltantes, con actualización automática del estado de la orden y el inventario.
- **Incidencias (`ProcurementIncident`):** Tipificación de roturas (`DAMAGED`), errores de modelo (`WRONG_VARIANT`, `WRONG_PRODUCT`), faltantes (`MISSING`) o retrasos (`DELAY`).
- **Devoluciones (`ProcurementReturn`):** Tramitación de devoluciones a distribuidores con control de importes de abono y reembolsos.

---

## 5. Prevención de Duplicidades (Anti-Duplication)

Toda sincronización automática con motores de obra y producto genera identificadores unívocos en `sourceReference`:
- Materiales V11: `v11_mat:<materialId>`
- Tareas V15: `v15_task:<taskId>`
- Productos V16: `v16_product:<productId>`

Las sincronizaciones posteriores actualizan precios y cantidades sin duplicar partidas existentes.
