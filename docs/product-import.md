# HBD V16.0.0 — REAL PRODUCT IMPORT & DIGITAL FURNITURE TWIN

**Home Board Designer (HBD)**  
**Autor:** Adrián Palma  
**Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.  
**Versión:** 16.0.0

---

## 1. Arquitectura y Visión General

El módulo **Real Product Import & Digital Furniture Twin (V16.0.0)** permite importar productos físicos comerciales reales directamente desde internet a partir de una URL (p. ej. IKEA, tiendas de diseño de interiores o fabricantes) y transformarlos en **Gemelos Digitales de Mobiliario (Digital Furniture Twins)** listos para ser colocados, medidos y visualizados en planos 2D y gemelos 3D.

```
URL de Producto
     ↓
ProductImportEngine (Anti-SSRF & Validaciones)
     ↓
ProductExtractorRegistry (IkeaProductExtractor / GenericProductExtractor)
     ↓
ProductNormalizerEngine (Conversión métrica internacional -> metros)
     ↓
ProductValidatorEngine (Comprobación de coherencia física y volumétrica)
     ↓
ProductProvenanceEngine (Evaluación de fiabilidad y procedencia)
     ↓
DigitalFurnitureTwinEngine (Generación de geometría paramétrica / enlace 3D)
     ↓
Integración con FurnitureEngine (2D, colisiones, paso libre, escena 3D y presupuesto)
```

---

## 2. Jerarquía de Veracidad y Procedencia (Provenance)

HBD implementa un principio estricto de **no invención de datos**, clasificando la información en una jerarquía transparente:

1. `USER_CONFIRMED` / `USER_EDITED`: Datos revisados o introducidos manualmente por el usuario profesional.
2. `OFFICIAL_3D`: Modelo 3D oficial facilitado directamente por el fabricante.
3. `OFFICIAL_PRODUCT_DATA`: Metadatos y especificaciones técnicas estructuradas oficiales (JSON-LD Schema.org / Microdata).
4. `USER_PROVIDED`: Datos suministrados por el cliente o diseñador.
5. `IMPORTED`: Datos extraídos de páginas web públicas.
6. `AI_RECONSTRUCTED`: Geometría o dimensiones inferidas mediante visión e inteligencia artificial (siempre indicando "Modelo estimado mediante IA").
7. `PARAMETRIC`: Representación volumétrica generada proceduralmente respetando las dimensiones de catálogo.
8. `ESTIMATED`: Medidas aproximadas por tipología de mueble cuando faltan especificaciones en el catálogo.

### Restricción de Escala y Desconexión de Catálogo
Si el usuario modifica las dimensiones de un producto de catálogo para adaptarlo a su estancia, el sistema marca el producto como `CUSTOMIZED`, informando que ha dejado de corresponder a las medidas comerciales originales.

---

## 3. Seguridad y Prevención SSRF

Para evitar ataques de falsificación de peticiones del lado del servidor (SSRF), `ProductValidatorEngine`:
- Valida estrictamente los protocolos (`http:` y `https:`).
- Bloquea accesos a `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`.
- Bloquea rangos de red privada según RFC 1918 (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).
- Bloquea endpoints de metadatos cloud (`169.254.169.254`).
- Aplica límites de tiempo (timeout) y rate limiting en el backend.

---

## 4. Endpoints API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/products/import` | Analiza una URL externa y extrae datos técnicos estructurados |
| `POST` | `/api/products/confirm` | Guarda el producto confirmado y crea su Gemelo Digital |
| `GET` | `/api/products` | Lista los productos del catálogo con filtros |
| `GET` | `/api/products/:id` | Detalle completo de producto, materiales, fotos y variantes |
| `DELETE` | `/api/products/:id` | Eliminación segura de un producto del catálogo |
| `GET` | `/api/products/project/:projectId` | Lista de productos asignados a un proyecto |
| `POST` | `/api/products/project/:projectId` | Asigna un producto a una habitación del proyecto |
| `DELETE` | `/api/products/project/item/:id` | Desvincula un producto de una estancia |
| `GET` | `/api/products/project/:projectId/shopping-list` | Resumen presupuestario y lista de compras consolidada |

---

## 5. Limitaciones y Consideraciones

1. **Modelos 3D Oficiales:** No todos los fabricantes disponen de modelos GLB/GLTF descargables; en su ausencia, HBD genera una caja volumétrica paramétrica con los colores y proporciones exactas del catálogo.
2. **Propiedad Intelectual y Enlaces:** HBD almacena referencias técnicas, dimensiones y URLs de origen, respetando la autoría y facilitando enlaces directos a la tienda original.
3. **Inferencia por IA:** Las reconstrucciones estimadas por IA siempre se identifican como tales y no sustituyen a las fichas técnicas oficiales.
