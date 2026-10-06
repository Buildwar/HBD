# HBD V17.0.0 — Project Investment & Total Cost Intelligence

**Home Board Designer**  
**Autor:** Adrián Palma  
**Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.

---

## 1. Visión General

HBD V17.0.0 introduce una capa financiera transversal y unificada para todo el ciclo de vida del proyecto de arquitectura e interiorismo. La versión responde de forma precisa y objetiva a las cuestiones clave de inversión:

- **¿Cuánto cuesta transformar la vivienda?** (*Coste del Proyecto / Transformación*)
- **¿Cuál es la inversión patrimonial global?** (*Inversión Total*, incluyendo adquisición e impuestos)
- **¿Cómo se desglosa el coste por estancia y por m²?**
- **¿Qué partidas presentan desviaciones respecto al presupuesto base?**
- **¿Cuál es el saldo vivo de pagos y compromisos pendientes?**
- **¿Cuál es la proyección de coste final y qué colchón de contingencia se recomienda?**

---

## 2. Segregación Conceptual de Costes

Para evitar mezclar conceptos financieros, HBD V17 clasifica rigurosamente los costes en 10 categorías:

1. **`PROPERTY_ACQUISITION` (Adquisición Inmobiliaria):**
   - Precio de compraventa del inmueble.
   - Tributos: ITP (Impuesto de Transmisiones Patrimoniales) / AJD / IVA.
   - Honorarios notariales y de Registro de la Propiedad.
   - Honorarios de agencia/inmobiliaria y gestoría/asesoría jurídica.
   - Tasación hipotecaria.

2. **`RENOVATION` (Reforma & Obra):**
   - Demoliciones, albañilería, electricidad, fontanería, climatización, carpintería, solados, pinturas, sanitarios, etc. (Consolida con V11 y V15).

3. **`FURNITURE` (Mobiliario):**
   - Sofás, mesas, sillas, camas, armarios, estanterías, mobiliario a medida y gemelos digitales (Consolida con V5 y V16).

4. **`APPLIANCES` (Electrodomésticos):**
   - Frigoríficos, hornos, placas de inducción, campanas extractoras, lavavajillas, lavadoras, televisores.

5. **`EQUIPMENT` (Equipamiento Técnico):**
   - Aerotermia, climatización por conductos, domótica, seguridad, iluminación técnica, redes.

6. **`PROFESSIONAL_SERVICES` (Servicios Profesionales):**
   - Honorarios de arquitectura, diseño de interiores, ingeniería, dirección de obra, coordinación de seguridad.

7. **`LOGISTICS` (Logística & Montaje):**
   - Envíos, transporte, portes, elevadores, montaje e instalación, gestión de residuos y cubas.

8. **`PERMITS` (Licencias & Tasas):**
   - Licencia de obras (ICIO / tasa urbanística), licencias de actividad, vados, certificados de habitabilidad.

9. **`CONTINGENCY` (Colchón de Contingencia):**
   - Imprevistos de obra, margen para incrementos de precios y reservas de seguridad.

10. **`OTHER` (Otros Gastos Directos):**
    - Gastos misceláneos imputables al proyecto.

---

## 3. Regla Fundamental de los Dos Totales (Dual Totals)

El sistema calcula y muestra en todo momento dos agregados independientes:

$$\text{Coste del Proyecto (Transformación)} = \sum_{\text{categorías} \neq \text{ACQUISITION}} \text{Coste Efectivo}$$

$$\text{Inversión Total} = \text{Coste de Adquisición} + \text{Coste del Proyecto (Transformación)}$$

*Nota:* Si un proyecto no registra datos de adquisición inmobiliaria, la **Inversión Total** coincide exactamente con el **Coste de Transformación**.

---

## 4. Consolidación y Sincronización Antiduplicidad

El motor financiero consume y normaliza datos provenientes de versiones previas:
- **V11 (Construction Intelligence):** Partidas estimadas de obra y materiales (`v11_item:<id>`).
- **V15 (Construction Execution):** Facturas certificadas y costes reales de obra (`v15_invoice:<id>`).
- **V16 (Product Import & Digital Twin):** Mobiliario y productos vinculados al proyecto (`product:<id>`).

El campo `sourceReference` garantiza que sucesivas sincronizaciones actualicen las partidas existentes sin crear duplicidades presupuestarias.

---

## 5. Control de Pagos, Tesorería y Proyección

- **Seguimiento de Pagos:** Cada `CostItem` gestiona `estimatedTotalCost`, `actualTotalCost`, `paidAmount` y `pendingAmount`.
- **Registro de Pagos (`ProjectPayment`):** Desembolsos vinculados a partidas o generales con fecha, método de pago, referencia y emisor.
- **Motor de Proyección (`FinancialForecastEngine`):**
  - Proyección de coste final según gasto real, compromisos contraídos y estimaciones restantes.
  - Cálculo de varianza presupuestaria (`UNDER_BUDGET`, `ON_BUDGET`, `OVER_BUDGET`).
  - Nivel de riesgo (`LOW`, `MEDIUM`, `HIGH`) y puntuación de confianza (0-100%).
  - Recomendación de colchón de contingencia dinámico.
  - Alertas y recomendaciones estratégicas.
