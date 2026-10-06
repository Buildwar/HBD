# HBD — Infraestructura Técnica Inteligente y Smart Home (Fase V21 / 1.21.0)

## 1. Visión General y Propósito

La Fase **V21** introduce en **HBD (Home Board Designer)** un sistema holístico para el modelado, dimensionado, validación normativa, simulación de cobertura y presupuestación de las instalaciones técnicas de una vivienda.

El módulo abarca 10 categorías técnicas esenciales:
1. **Electricidad (ELECTRICAL):** Tomas de corriente, mecanismos de mando, cuadros secundarios y circuitos normalizados.
2. **Iluminación (LIGHTING):** Puntos de luz, downlights LED empotrados, tiras LED en foseados y dimmers.
3. **Red de Datos (NETWORK):** Tomas RJ45 Cat6/6A/7, rosetas ópticas PTRO y switches.
4. **Wi-Fi y RF (WIFI):** Puntos de acceso (APs), simulación de propagación electromagnética y mapa de calor.
5. **Domótica e IoT (SMART_HOME):** Micromódulos relé, pasarelas Zigbee/Matter/Thread/KNX y sensores ambientales.
6. **Seguridad (SECURITY):** Cámaras IP con conos de visión (FOV), detectores volumétricos PIR y contactos magnéticos.
7. **Climatización (HVAC):** Unidades interiores/splits, termostatos modulantes y conductos de impulsión/retorno.
8. **Fontanería (PLUMBING):** Tomas de agua fría/caliente (AFS/ACS), desagües y botes sifónicos.
9. **Multimedia (MULTIMEDIA):** Tomas de TV/FM/SAT, HDMI y audio multiroom empotrado.
10. **Cuartos Técnicos (TECHNICAL_ROOM):** Cuadros de mando y protección (CGMP), racks 10"/19" y colectores hidráulicos.

---

## 2. Motores Especializados de Cálculo

### 2.1. `ElectricalEngine`
- Clasificación según circuitos normalizados del REBT (C1 Alumbrado, C2 Tomas generales, C3 Cocina/Horno, C4 Electrodomésticos, C5 Baños/Tomas húmedas, C9 Climatización, C11 Domótica, C12 Vehículo Eléctrico).
- Cálculo de potencia total instalada y potencia demandada simultánea considerando factores de diversidad (ITC-BT-10).
- Recomendación de potencia a contratar normalizada (escalones oficiales: 3.45 kW, 4.60 kW, 5.75 kW, 6.90 kW, etc.).
- Comprobación de sobrecargas por circuito (número máximo de puntos y límite de intensidad).

### 2.2. `NetworkInfrastructureEngine`
- Dimensionado de electrónica de red (switches recomendados de 8, 16, 24 o 48 puertos con 25% de margen de expansión).
- Balance de potencia PoE (Power over Ethernet) según clases 802.3af (15.4W), 802.3at PoE+ (30W) y 802.3bt PoE++ (60W).
- Estimación de longitudes de cableado estructurado UTP/FTP y número de terminaciones de fibra óptica.

### 2.3. `WiFiCoverageEngine`
- Simulación de propagación de radiofrecuencia (RF) mediante modelo Log-Distance Path Loss en frecuencias de 2.4 GHz, 5 GHz y 6 GHz.
- Cálculo de pérdidas de inserción y atenuación por tipología de muro (hormigón 12 dB, ladrillo 6 dB, pladur 3 dB, vidrio 2 dB).
- Generación de mapa de calor bidimensional y clasificación de calidad de señal:
  - **Excelente:** $\ge -55\text{ dBm}$ (Verde)
  - **Bueno:** $-55\text{ a } -67\text{ dBm}$ (Azul)
  - **Aceptable:** $-67\text{ a } -75\text{ dBm}$ (Amarillo)
  - **Zona Muerta / Pobre:** $< -75\text{ dBm}$ (Rojo)

### 2.4. `SmartHomeEngine`
- Compatibilidad de protocolos domóticos: Zigbee 3.0, Matter over Thread, KNX, Wi-Fi, Z-Wave y DALI.
- Detección de topología mesh y alerta de dispositivos huérfanos sin pasarela/coordinador compatible.

### 2.5. `SecurityInfrastructureEngine`
- Cálculo geométrico 2D/3D de conos de visión (FOV) para cámaras de seguridad según su ángulo de lente y alcance efectivo.
- Análisis de cobertura perimetral de accesos (puertas y ventanas).

### 2.6. `HvacPlumbingEngine`
- Verificación de ratios de potencia térmica (100 W/m² estándar para climatización) y caudales de aire (m³/h).
- Caudal simultáneo de fontanería (l/s) según CTE DB-HS 4 y validación de pendientes mínimas de desagüe ($\ge 1.0\% - 1.5\%$).

### 2.7. `TechnicalValidationEngine`
- Distancias reglamentarias de seguridad en cuartos húmedos (REBT ITC-BT-27 Volumen de Prohibición: mínimo 50 cm entre enchufes no estancos y puntos de agua).
- Alturas ergonómicas estándar sobre suelo terminado:
  - Mecanismos de encendido: 0.90 m – 1.10 m (universal: 1.00 m)
  - Tomas de corriente generales: 0.30 m
  - Tomas sobre encimera: 1.10 m
  - Termostatos: 1.50 m
  - Cuadros eléctricos: 1.40 m – 2.00 m

---

## 3. Integración Transversal del Ecosistema HBD

| Módulo HBD | Entidad Vinculada | Propósito de la Integración |
| :--- | :--- | :--- |
| **V17 Finanzas** | `CostItem` (`EQUIPMENT`) | Imputación automática del coste de suministros y mecanismos al presupuesto de la vivienda. |
| **V18 Compras** | `ProcurementItem` (`NEEDED`) | Inclusión de equipos (APs, cámaras, pasarelas, splits) en el plan de aprovisionamiento del proyecto. |
| **V15 Ejecución** | `ExecutionTask` | Generación de tareas de obra para rozas, canalizaciones, cableado y montaje de mecanismos. |
| **V11 Reforma** | `ConstructionItem` | Cubicaciones de metros lineales de tubo corrugado, rozas y cableado por estancia. |
| **V10 Geometría** | `GeometryEngine` | Validación espacial de colisiones con carpinterías (puertas/ventanas) y mobiliario. |

---

## 4. Endpoints de la API REST (`/api/technical`)

- `GET /api/technical/projects/:projectId/elements`: Listado de mecanismos y elementos técnicos.
- `POST /api/technical/projects/:projectId/elements`: Crear nuevo elemento técnico (soporta `autoSync: true` para V17/V18/V15).
- `PUT /api/technical/elements/:id`: Actualizar cotas, circuito, potencia o parámetros.
- `DELETE /api/technical/elements/:id`: Eliminar elemento técnico.
- `POST /api/technical/elements/:id/sync`: Sincronización manual con V17, V18 y V15.
- `GET /api/technical/projects/:projectId/connections`: Listado de canalizaciones y cableados.
- `POST /api/technical/projects/:projectId/connections`: Crear nueva canalización con cálculo métrico.
- `DELETE /api/technical/connections/:id`: Eliminar canalización.
- `GET /api/technical/projects/:projectId/zones`: Cuadros eléctricos y armarios técnicos.
- `POST /api/technical/projects/:projectId/zones`: Crear zona técnica.
- `GET /api/technical/projects/:projectId/summary`: Resumen consolidado holístico de infraestructura.
- `GET /api/technical/projects/:projectId/wifi-heatmap`: Simulación de mapa de calor Wi-Fi.
- `GET /api/technical/projects/:projectId/validate`: Auditoría normativa REBT, CTE, RITE e ICT-2.

---

## 5. Autoría y Licencia

- **Autor:** Adrián Palma
- **Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.
