/**
 * HBD — HOME BOARD DESIGNER
 * SUITE DE PRUEBAS AUTOMATIZADAS — V16.0.0
 * REAL PRODUCT IMPORT & DIGITAL FURNITURE TWIN
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  APP_METADATA,
  ProductImportEngine,
  ProductValidatorEngine,
  ProductNormalizerEngine,
  ProductProvenanceEngine,
  DigitalFurnitureTwinEngine,
  ProductExtractorRegistry,
  IkeaProductExtractor,
  GenericProductExtractor,
  MockProductAIProvider,
  ProductProvenance,
  ProductVerificationStatus,
  ProductValidationState,
  Product3DAssetType,
  ExtractionMethod,
} from '@hbd/shared';

describe('🧪 HBD V16.0.0 — SUITE DE PRUEBAS DE IMPORTACIÓN DE PRODUCTOS Y GEMELOS DIGITALES', () => {
  // ============================================================
  // 1. Identidad Centralizada, Autoría y Versión 16.0.0
  // ============================================================
  describe('--- 1. Identidad Centralizada, Autoría y Versión 16.0.0 ---', () => {
    it('Autor oficial debe ser "Adrián Palma"', () => {
      assert.strictEqual(APP_METADATA.author, 'Adrián Palma');
    });

    it('Versión global debe ser válida', () => {
      assert.ok(Boolean(APP_METADATA.version));
    });

    it('Año de copyright debe ser 2026', () => {
      assert.strictEqual(APP_METADATA.copyrightYear, 2026);
    });

    it('Copyright oficial debe incluir a Adrián Palma', () => {
      assert.ok(APP_METADATA.copyright.includes('Adrián Palma'));
      assert.ok(APP_METADATA.copyright.includes('2026'));
    });
  });

  // ============================================================
  // 2. Seguridad Anti-SSRF y Validación de URLs
  // ============================================================
  describe('--- 2. Seguridad de URL y Prevención SSRF ---', () => {
    it('Permite URLs públicas HTTPS legítimas', () => {
      const check = ProductValidatorEngine.validateUrlSecurity('https://www.ikea.com/es/es/p/sofa-klippan-12345/');
      assert.strictEqual(check.isSafe, true);
    });

    it('Bloquea direcciones locales localhost y 127.0.0.1', () => {
      const checkLocalhost = ProductValidatorEngine.validateUrlSecurity('http://localhost:3000/admin');
      assert.strictEqual(checkLocalhost.isSafe, false);

      const checkLoopback = ProductValidatorEngine.validateUrlSecurity('http://127.0.0.1:4000/api/users');
      assert.strictEqual(checkLoopback.isSafe, false);
    });

    it('Bloquea rangos IP privados (10.x.x.x, 192.168.x.x, 172.16-31.x.x)', () => {
      const check10 = ProductValidatorEngine.validateUrlSecurity('http://10.0.0.5/product');
      assert.strictEqual(check10.isSafe, false);

      const check192 = ProductValidatorEngine.validateUrlSecurity('http://192.168.1.100/admin');
      assert.strictEqual(check192.isSafe, false);

      const check172 = ProductValidatorEngine.validateUrlSecurity('http://172.20.0.1/meta');
      assert.strictEqual(check172.isSafe, false);
    });

    it('Bloquea protocolos no permitidos (file://, ftp://, javascript:)', () => {
      const checkFtp = ProductValidatorEngine.validateUrlSecurity('ftp://server/product.html');
      assert.strictEqual(checkFtp.isSafe, false);
    });
  });

  // ============================================================
  // 3. Normalizador de Dimensiones, Monedas y Materiales
  // ============================================================
  describe('--- 3. Normalizador Métrico y Extracción Semántica ---', () => {
    it('Convierte correctamente unidades a metros estándar', () => {
      assert.strictEqual(ProductNormalizerEngine.toMeters(180, 'cm'), 1.8);
      assert.strictEqual(ProductNormalizerEngine.toMeters(2000, 'mm'), 2.0);
      assert.strictEqual(ProductNormalizerEngine.toMeters(39.3701, 'in'), 1.0);
      assert.strictEqual(ProductNormalizerEngine.toMeters(1.5, 'm'), 1.5);
    });

    it('Extrae dimensiones a partir de triple formato (180 x 40 x 85 cm)', () => {
      const dims = ProductNormalizerEngine.parseDimensionsFromText('Mueble aparador 180 x 40 x 85 cm');
      assert.ok(dims);
      assert.strictEqual(dims.widthM, 1.8);
      assert.strictEqual(dims.depthM, 0.4);
      assert.strictEqual(dims.heightM, 0.85);
      assert.strictEqual(dims.provenance, ProductProvenance.OFFICIAL_PRODUCT_DATA);
    });

    it('Extrae dimensiones a partir de etiquetas explícitas (Ancho: 120, Fondo: 60, Alto: 75)', () => {
      const dims = ProductNormalizerEngine.parseDimensionsFromText('Especificaciones: Ancho: 120 cm, Fondo: 60 cm, Alto: 75 cm');
      assert.ok(dims);
      assert.strictEqual(dims.widthM, 1.2);
      assert.strictEqual(dims.depthM, 0.6);
      assert.strictEqual(dims.heightM, 0.75);
    });

    it('Normaliza monedas a formato ISO estándar', () => {
      assert.strictEqual(ProductNormalizerEngine.normalizeCurrency('€'), 'EUR');
      assert.strictEqual(ProductNormalizerEngine.normalizeCurrency('USD'), 'USD');
      assert.strictEqual(ProductNormalizerEngine.normalizeCurrency('$'), 'USD');
    });

    it('Detecta e identifica materiales comerciales a partir de texto', () => {
      const materials = ProductNormalizerEngine.parseMaterialsFromText('Estructura en madera de roble con detalles en acero y cristal templado');
      assert.ok(materials.length >= 3);
      assert.ok(materials.some((m) => m.name === 'Roble'));
      assert.ok(materials.some((m) => m.name === 'Acero'));
      assert.ok(materials.some((m) => m.name.includes('Vidrio') || m.name.includes('Cristal')));
    });
  });

  // ============================================================
  // 4. Extractor Especializado de IKEA y Extractor Genérico
  // ============================================================
  describe('--- 4. Extractores de Catálogo (IKEA & Genérico) ---', () => {
    it('IkeaProductExtractor procesa HTML con JSON-LD y referencias oficiales', async () => {
      const extractor = new IkeaProductExtractor();
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>KLIPPAN Sofá 2 plazas, Vissle gris - IKEA</title>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "KLIPPAN Sofá 2 plazas",
                "brand": { "@type": "Brand", "name": "IKEA" },
                "sku": "70386789",
                "description": "Sofá compacto de dos plazas con funda lavable.",
                "image": "https://www.ikea.com/images/klippan_sofa.jpg",
                "offers": {
                  "@type": "Offer",
                  "price": "249.00",
                  "priceCurrency": "EUR",
                  "availability": "https://schema.org/InStock"
                }
              }
            </script>
          </head>
          <body>
            <p>Nº artículo: 703.867.89</p>
            <p>Medidas: 180 x 88 x 66 cm</p>
          </body>
        </html>
      `;

      const raw = await extractor.extract(mockHtml, 'https://www.ikea.com/es/es/p/klippan-sofa/', 'ikea.com');
      assert.strictEqual(raw.name, 'KLIPPAN Sofá 2 plazas');
      assert.strictEqual(raw.brand, 'IKEA');
      assert.strictEqual(raw.sku, '70386789');
      assert.strictEqual(raw.price, 249.0);
      assert.strictEqual(raw.currency, 'EUR');
      assert.ok(raw.dimensions);
      assert.strictEqual(raw.dimensions.widthM, 1.8);
      assert.strictEqual(raw.dimensions.depthM, 0.88);
      assert.strictEqual(raw.dimensions.heightM, 0.66);
    });

    it('GenericProductExtractor extrae OpenGraph cuando no hay JSON-LD', async () => {
      const extractor = new GenericProductExtractor();
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="og:title" content="Mesa de Comedor Nórdica Roble" />
            <meta property="og:description" content="Mesa extensible de madera maciza 140x90x75 cm" />
            <meta property="product:price:amount" content="399.00" />
            <meta property="product:price:currency" content="EUR" />
            <meta property="og:image" content="https://tienda.com/mesa.jpg" />
          </head>
          <body>
            <h1>Mesa Nórdica</h1>
          </body>
        </html>
      `;

      const raw = await extractor.extract(mockHtml, 'https://tienda.com/mesa-nordica', 'tienda.com');
      assert.strictEqual(raw.name, 'Mesa de Comedor Nórdica Roble');
      assert.strictEqual(raw.price, 399.0);
      assert.strictEqual(raw.currency, 'EUR');
      assert.ok(raw.dimensions);
      assert.strictEqual(raw.dimensions.widthM, 1.4);
      assert.strictEqual(raw.dimensions.depthM, 0.9);
      assert.strictEqual(raw.dimensions.heightM, 0.75);
    });
  });

  // ============================================================
  // 5. Motor de Importación Maestro (ProductImportEngine)
  // ============================================================
  describe('--- 5. Motor Maestro de Importación y Confianza ---', () => {
    it('Genera ProductImportResult estructurado con niveles de confianza calculados', async () => {
      const engine = new ProductImportEngine();
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>KALLAX Estantería blanco - IKEA</title>
            <meta property="og:image" content="https://www.ikea.com/images/kallax.jpg" />
          </head>
          <body>
            <p>Medidas: 77 x 39 x 147 cm</p>
            <p>Precio: 59.99 €</p>
          </body>
        </html>
      `;

      const result = await engine.processHtmlImport(mockHtml, 'https://www.ikea.com/es/es/p/kallax-estanteria-blanco-80275887/');
      assert.strictEqual(result.success, true);
      assert.ok(result.product);
      assert.strictEqual(result.product.brand, 'IKEA');
      assert.strictEqual(result.dimensions?.widthM, 0.77);
      assert.strictEqual(result.dimensions?.depthM, 0.39);
      assert.strictEqual(result.dimensions?.heightM, 1.47);
      assert.ok(result.confidence >= 0.85);
      assert.strictEqual(result.confidenceLevel, 'HIGH');
    });

    it('Maneja productos sin dimensiones marcando REVIEW_REQUIRED', async () => {
      const engine = new ProductImportEngine();
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head><title>Lámpara de Pie Moderna</title></head>
          <body><p>Lámpara decorativa sin especificaciones.</p></body>
        </html>
      `;

      const result = await engine.processHtmlImport(mockHtml, 'https://tienda.com/lampara', { aiAssisted: false });
      assert.ok(result.missingFields.includes('dimensions'));
      assert.strictEqual(result.product?.verificationStatus, ProductVerificationStatus.REVIEW_REQUIRED);
      assert.ok(result.warnings.length > 0);
    });
  });

  // ============================================================
  // 6. Principio de Veracidad y Procedencia de Datos
  // ============================================================
  describe('--- 6. Principio de Veracidad y Jerarquía de Procedencia ---', () => {
    it('Evalúa la jerarquía formal de procedencia correctamente', () => {
      assert.ok(
        ProductProvenanceEngine.compareProvenance(ProductProvenance.OFFICIAL_3D, ProductProvenance.AI_RECONSTRUCTED) > 0
      );
      assert.ok(
        ProductProvenanceEngine.compareProvenance(ProductProvenance.OFFICIAL_PRODUCT_DATA, ProductProvenance.PARAMETRIC) > 0
      );
      assert.ok(
        ProductProvenanceEngine.compareProvenance(ProductProvenance.IMPORTED, ProductProvenance.ESTIMATED) > 0
      );
    });

    it('Degrada a CUSTOMIZED cuando el usuario altera las medidas de catálogo', () => {
      const originalW = 1.8;
      const originalD = 0.4;
      const originalH = 0.85;

      // Modificación a 2.10m
      const result = ProductProvenanceEngine.handleDimensionModification(originalW, originalD, originalH, 2.1, 0.4, 0.85);
      assert.strictEqual(result.isModified, true);
      assert.strictEqual(result.verificationStatus, ProductVerificationStatus.CUSTOMIZED);
      assert.ok(result.warning);
    });
  });

  // ============================================================
  // 7. Gemelo Digital de Mobiliario (DigitalFurnitureTwinEngine)
  // ============================================================
  describe('--- 7. Digital Furniture Twin e Integración con FurnitureEngine ---', () => {
    it('Crea un DigitalFurnitureTwin con geometría paramétrica volumétrica', () => {
      const product = {
        id: 'prod-123',
        name: 'Sofá Ektorp',
        category: 'Sofás y Sillones',
        brand: 'IKEA',
        dimensions: { widthM: 2.18, depthM: 0.88, heightM: 0.88, provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA, confidence: 0.95 },
        materials: [{ category: 'fabric', name: 'Tela gris', provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA, confidence: 0.9 }],
        variants: [],
        images: [{ url: 'https://ikea.com/ektorp.jpg', type: 0 as any, isPrimary: true }],
        assets3d: [],
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 0.95,
        confidenceLevel: 'HIGH' as any,
        verificationStatus: ProductVerificationStatus.USER_CONFIRMED,
        sourceUrl: 'https://ikea.com/ektorp',
        sourceDomain: 'ikea.com',
        importedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: 'EUR',
      };

      const twin = DigitalFurnitureTwinEngine.createTwinFromProduct(product as any);
      assert.ok(twin.id);
      assert.strictEqual(twin.productId, 'prod-123');
      assert.strictEqual(twin.dimensions.widthM, 2.18);
      assert.strictEqual(twin.transform?.lockRealDimensions, true);
      assert.strictEqual(twin.asset3d?.geometryConfig?.primitiveShape, 'sofa');
    });

    it('Convierte el DigitalFurnitureTwin a una entidad Furniture compatible con el diseñador 2D/3D', () => {
      const product = {
        id: 'prod-123',
        name: 'Mesa Norden',
        category: 'Mesas',
        dimensions: { widthM: 1.52, depthM: 0.8, heightM: 0.74, provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA, confidence: 0.95 },
        materials: [{ category: 'wood', name: 'Abedul', colorHex: '#D2B48C', provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA, confidence: 0.9 }],
        variants: [],
        images: [{ url: 'https://ikea.com/norden.jpg', type: 0 as any, isPrimary: true }],
        assets3d: [],
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 0.95,
        confidenceLevel: 'HIGH' as any,
        verificationStatus: ProductVerificationStatus.USER_CONFIRMED,
        sourceUrl: 'https://ikea.com/norden',
        sourceDomain: 'ikea.com',
        importedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currency: 'EUR',
      };

      const twin = DigitalFurnitureTwinEngine.createTwinFromProduct(product as any);
      const furniture = DigitalFurnitureTwinEngine.convertTwinToFurniture(twin, product as any);

      assert.ok(furniture.id.startsWith('furn-twin-'));
      assert.strictEqual(furniture.name, 'Mesa Norden');
      assert.strictEqual(furniture.defaultWidthM, 1.52);
      assert.strictEqual(furniture.defaultDepthM, 0.8);
      assert.strictEqual(furniture.defaultHeightM, 0.74);
      assert.strictEqual(furniture.isCustom, true);
    });
  });

  // ============================================================
  // 8. Proveedor de IA Desacoplado (MockProductAIProvider)
  // ============================================================
  describe('--- 8. Inteligencia Artificial Desacoplada y Reconstrucción 3D ---', () => {
    it('Clasifica categorías de producto automáticamente', async () => {
      const ai = new MockProductAIProvider();
      const sofaCat = await ai.classifyCategory('Chaise longue convertible 3 plazas');
      assert.strictEqual(sofaCat.category, 'Sofás y Sillones');

      const deskCat = await ai.classifyCategory('Escritorio elevable de oficina');
      assert.strictEqual(deskCat.category, 'Mesas y Escritorios');
    });

    it('Reconstrucción 3D por IA marca explícitamente AI_RECONSTRUCTED y isEstimatedAi', async () => {
      const ai = new MockProductAIProvider();
      const asset = await ai.reconstructGeometry(
        { widthM: 1.2, depthM: 0.6, heightM: 0.75, provenance: ProductProvenance.AI_RECONSTRUCTED, confidence: 0.8 },
        'Mesas'
      );

      assert.strictEqual(asset.type, Product3DAssetType.AI_RECONSTRUCTED);
      assert.strictEqual(asset.isEstimatedAi, true);
      assert.strictEqual(asset.provenance, ProductProvenance.AI_RECONSTRUCTED);
      assert.ok(asset.notes?.includes('IA'));
    });
  });

  // ============================================================
  // 9. Simetría de Internacionalización (es.json vs en.json)
  // ============================================================
  describe('--- 9. Simetría de Internacionalización (es.json vs en.json) ---', () => {
    it('Namespace "products" existe en ES y EN con idéntica estructura de claves', () => {
      const esPath = resolve(__dirname, '../../../client/src/i18n/locales/es.json');
      const enPath = resolve(__dirname, '../../../client/src/i18n/locales/en.json');

      assert.ok(existsSync(esPath), 'es.json debe existir');
      assert.ok(existsSync(enPath), 'en.json debe existir');

      const es = JSON.parse(readFileSync(esPath, 'utf-8'));
      const en = JSON.parse(readFileSync(enPath, 'utf-8'));

      assert.ok(es.products, 'Namespace "products" debe existir en es.json');
      assert.ok(en.products, 'Namespace "products" debe existir en en.json');

      const esKeys = Object.keys(es.products).sort();
      const enKeys = Object.keys(en.products).sort();

      assert.deepStrictEqual(esKeys, enKeys, 'Las claves del namespace products deben ser 100% simétricas');
    });
  });

  // ============================================================
  // 10. Auditoría de Centralización de Versión en "Acerca de"
  // ============================================================
  describe('--- 10. Auditoría de Centralización de Versión en "Acerca de" ---', () => {
    it('Sidebar y componentes NO contienen badges de versión V16', () => {
      const sidebarPath = resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
      const sidebarContent = readFileSync(sidebarPath, 'utf-8');

      assert.ok(!sidebarContent.includes("badge: 'V16'"), 'Sidebar NO muestra badge V16');
      assert.ok(!sidebarContent.includes('V16.0.0'), 'Sidebar NO muestra texto V16.0.0');
    });
  });
});
