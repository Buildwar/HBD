/**
 * HBD — Mock Retail Connector
 * V20.0.0 — Connected Retail Catalog
 *
 * Provides typed, structured, reliable dataset for testing & offline development.
 * All items are clearly flagged with isMockData: true.
 */

import { IRetailConnector } from './base.connector.js';
import {
  RetailerMetadata,
  RetailProductDto,
  RetailProductVariantDto,
  RetailProductPriceDto,
  RetailProductAvailabilityDto,
  RetailCatalogSearchParams,
  RetailerCode,
  ProductProvenance,
} from '@hbd/shared';

export const MOCK_RETAIL_CATALOG: RetailProductDto[] = [
  // --- IKEA PRODUCTS ---
  {
    id: 'mock-ikea-kallax-77x147',
    retailerCode: 'IKEA',
    retailerName: 'IKEA España',
    externalId: 'ikea-kallax-80275887',
    sku: '802.758.87',
    reference: 'KALLAX-77-147-WHT',
    brand: 'IKEA',
    name: 'KALLAX',
    description: 'Estantería modular de 4 huecos x 2 huecos. Se puede colocar en vertical o en horizontal como aparador o divisor de ambientes.',
    category: 'Almacenaje',
    subcategory: 'Estanterías',
    targetRoomTypes: ['LIVING_ROOM', 'BEDROOM', 'OFFICE', 'STUDIO'],
    price: {
      amount: 69.99,
      currency: 'EUR',
      previousAmount: 79.99,
      discountPercentage: 12.5,
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.77,
      depthM: 0.39,
      heightM: 1.47,
      rawWidth: 77,
      rawDepth: 39,
      rawHeight: 147,
      rawUnit: 'cm',
      weightKg: 29.5,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Tablero de partículas', 'Tablero de fibras', 'Lámina de papel'],
    colors: ['Blanco', 'Efecto Roble', 'Negro-Marrón', 'Gris'],
    variants: [
      {
        id: 'kallax-var-white',
        externalVariantId: '802.758.87',
        name: 'Blanco',
        sku: '802.758.87',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        finish: 'Mate',
        price: 69.99,
        currency: 'EUR',
        imageUrl: 'https://www.ikea.com/es/es/images/products/kallax-estanteria-blanco__0640474_pe699890_s5.jpg',
        stockStatus: 'IN_STOCK',
        isAvailable: true,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 1.0,
      },
      {
        id: 'kallax-var-oak',
        externalVariantId: '403.245.16',
        name: 'Efecto Roble',
        sku: '403.245.16',
        color: 'Roble',
        colorHex: '#C8AD7F',
        finish: 'Veta natural',
        price: 74.99,
        currency: 'EUR',
        imageUrl: 'https://www.ikea.com/es/es/images/products/kallax-estanteria-efecto-roble__0640477_pe699893_s5.jpg',
        stockStatus: 'IN_STOCK',
        isAvailable: true,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 1.0,
      },
      {
        id: 'kallax-var-black',
        externalVariantId: '202.758.85',
        name: 'Negro-Marrón',
        sku: '202.758.85',
        color: 'Negro-Marrón',
        colorHex: '#2C221E',
        finish: 'Oscuro satinado',
        price: 74.99,
        currency: 'EUR',
        stockStatus: 'IN_STOCK',
        isAvailable: true,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 1.0,
      },
    ],
    selectedVariantId: 'kallax-var-white',
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 42,
      storeAvailability: [
        { storeId: 'es-mad-ss', storeName: 'IKEA San Sebastián de los Reyes', cityName: 'Madrid', stock: 18, status: 'IN_STOCK' },
        { storeId: 'es-bcn-hosp', storeName: 'IKEA L\'Hospitalet', cityName: 'Barcelona', stock: 24, status: 'IN_STOCK' },
      ],
      deliveryEstimateDays: 2,
      deliveryEstimateFormatted: 'Entrega en 48-72h a domicilio',
      deliveryFee: 19.0,
      retrievedAt: new Date().toISOString(),
    },
    assets: [
      {
        id: 'kallax-img-1',
        type: 'IMAGE',
        url: 'https://www.ikea.com/es/es/images/products/kallax-estanteria-blanco__0640474_pe699890_s5.jpg',
        isPrimary: true,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      },
    ],
    primaryImageUrl: 'https://www.ikea.com/es/es/images/products/kallax-estanteria-blanco__0640474_pe699890_s5.jpg',
    productUrl: 'https://www.ikea.com/es/es/p/kallax-estanteria-blanco-80275887/',
    purchaseUrl: 'https://www.ikea.com/es/es/p/kallax-estanteria-blanco-80275887/',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.98,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'mock-ikea-billy-80x202',
    retailerCode: 'IKEA',
    retailerName: 'IKEA España',
    externalId: 'ikea-billy-00263850',
    sku: '002.638.50',
    reference: 'BILLY-80-202-WHT',
    brand: 'IKEA',
    name: 'BILLY',
    description: 'Librería emblemática con baldas regulables. Diseñada para adaptarse a cualquier espacio de estudio o salón.',
    category: 'Almacenaje',
    subcategory: 'Librerías',
    targetRoomTypes: ['LIVING_ROOM', 'OFFICE', 'BEDROOM'],
    price: {
      amount: 59.99,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.80,
      depthM: 0.28,
      heightM: 2.02,
      rawWidth: 80,
      rawDepth: 28,
      rawHeight: 202,
      rawUnit: 'cm',
      weightKg: 35.0,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Tablero de partículas', 'Chapa de melamina'],
    colors: ['Blanco', 'Roble', 'Negro'],
    variants: [
      {
        id: 'billy-var-white',
        name: 'Blanco',
        sku: '002.638.50',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        price: 59.99,
        currency: 'EUR',
        stockStatus: 'IN_STOCK',
        isAvailable: true,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 1.0,
      },
    ],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 65,
      deliveryEstimateDays: 2,
      deliveryEstimateFormatted: 'Disponible para envío inmediato',
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://www.ikea.com/es/es/images/products/billy-libreria-blanco__0625599_pe692385_s5.jpg',
    productUrl: 'https://www.ikea.com/es/es/p/billy-libreria-blanco-00263850/',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.95,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'mock-ikea-poang-armchair',
    retailerCode: 'IKEA',
    retailerName: 'IKEA España',
    externalId: 'ikea-poang-79240798',
    sku: '792.407.98',
    reference: 'POANG-CHAIR-BIRCH-BEIGE',
    brand: 'IKEA',
    name: 'POÄNG',
    description: 'Sillón con estructura curvada de madera de abedul encolada por capas, que aporta una elasticidad muy cómoda.',
    category: 'Asientos',
    subcategory: 'Sillones y Butacas',
    targetRoomTypes: ['LIVING_ROOM', 'BEDROOM', 'BALCONY'],
    price: {
      amount: 119.0,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.68,
      depthM: 0.82,
      heightM: 1.00,
      rawWidth: 68,
      rawDepth: 82,
      rawHeight: 100,
      rawUnit: 'cm',
      weightKg: 9.8,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Madera de abedul curvada', 'Funda de algodón y poliéster'],
    colors: ['Beige / Abedul', 'Gris / Roble', 'Cuero Negro'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 28,
      deliveryEstimateDays: 3,
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://www.ikea.com/es/es/images/products/poaeng-sillon-chapa-abedul-knisa-gris-claro__0837294_pe778939_s5.jpg',
    productUrl: 'https://www.ikea.com/es/es/p/poaeng-sillon-chapa-abedul-knisa-gris-claro-s79240798/',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.96,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'mock-ikea-lack-coffee-table',
    retailerCode: 'IKEA',
    retailerName: 'IKEA España',
    externalId: 'ikea-lack-90449905',
    sku: '904.499.05',
    reference: 'LACK-90-55-WHT',
    brand: 'IKEA',
    name: 'LACK Mesa de Centro',
    description: 'Mesa de centro con estante inferior para revistas o mandos a distancia. Ligera y fácil de mover.',
    category: 'Mesas',
    subcategory: 'Mesas de Centro',
    targetRoomTypes: ['LIVING_ROOM'],
    price: {
      amount: 29.99,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.90,
      depthM: 0.55,
      heightM: 0.45,
      rawWidth: 90,
      rawDepth: 55,
      rawHeight: 45,
      rawUnit: 'cm',
      weightKg: 8.5,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Tablero de partículas', 'Estructura nido de abeja'],
    colors: ['Blanco', 'Negro-Marrón', 'Efecto Roble'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 50,
      deliveryEstimateDays: 2,
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://www.ikea.com/es/es/images/products/lack-mesa-de-centro-blanco__0702217_pe724346_s5.jpg',
    productUrl: 'https://www.ikea.com/es/es/p/lack-mesa-de-centro-blanco-90449905/',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.94,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },

  // --- LEROY MERLIN PRODUCTS (Reforma / Baño / Bricolaje) ---
  {
    id: 'mock-leroy-suelo-vinilico-artens',
    retailerCode: 'LEROY_MERLIN',
    retailerName: 'Leroy Merlin',
    externalId: 'lm-82348921',
    sku: 'LM-82348921',
    reference: 'ARTENS-MODERNO-ROBLE',
    brand: 'Artens',
    name: 'Suelo Vinílico Click SPC Artens Roble Claro',
    description: 'Suelo vinílico rígido de alta resistencia con aislamiento acústico integrado. 100% resistente al agua, apto para baños y cocinas.',
    category: 'Reforma y Suelos',
    subcategory: 'Pavimentos Vinílicos',
    targetRoomTypes: ['LIVING_ROOM', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'HALL'],
    price: {
      amount: 19.95, // per m2
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 1.22,
      depthM: 0.18,
      heightM: 0.005,
      rawWidth: 122,
      rawDepth: 18,
      rawHeight: 0.5,
      rawUnit: 'cm',
      weightKg: 18.0,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Composite de piedra caliza SPC', 'Capa de vinilo virgen'],
    colors: ['Roble Claro Natural', 'Gris Ceniza'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 350,
      deliveryEstimateDays: 3,
      deliveryEstimateFormatted: 'Entrega pesada en 3 a 5 días laborables',
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://media.adeo.com/marketplace/MKP/82348921/format/400x400.jpg',
    productUrl: 'https://www.leroymerlin.es/productos/suelos/suelos-vinilicos/suelo-vinilico-spc-artens-82348921.html',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.97,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'mock-leroy-grifo-grohe-bauedge',
    retailerCode: 'LEROY_MERLIN',
    retailerName: 'Leroy Merlin',
    externalId: 'lm-19827361',
    sku: 'LM-19827361',
    reference: 'GROHE-BAUEDGE-CHROME',
    brand: 'Grohe',
    name: 'Grifo Monomando Lavabo Grohe BauEdge',
    description: 'Grifo de lavabo con tecnología EcoJoy para ahorro de agua del 50% y acabado cromado brillante StarLight de larga duración.',
    category: 'Baño y Sanitarios',
    subcategory: 'Grifería',
    targetRoomTypes: ['BATHROOM'],
    price: {
      amount: 64.95,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.12,
      depthM: 0.16,
      heightM: 0.15,
      rawWidth: 12,
      rawDepth: 16,
      rawHeight: 15,
      rawUnit: 'cm',
      weightKg: 1.4,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Latón cromado', 'Cartucho cerámico'],
    colors: ['Cromado Brillante', 'Negro Mate'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 19,
      deliveryEstimateDays: 1,
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://media.adeo.com/marketplace/MKP/19827361/format/400x400.jpg',
    productUrl: 'https://www.leroymerlin.es/productos/banos/grifos-de-bano/grifo-lavabo-grohe-bauedge-19827361.html',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.95,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },

  // --- KAVE HOME PRODUCTS (Diseño de Interiores & Tendencia) ---
  {
    id: 'mock-kave-silla-ralf',
    retailerCode: 'KAVE_HOME',
    retailerName: 'Kave Home',
    externalId: 'kh-cc0678m',
    sku: 'CC0678M40',
    reference: 'RALF-CHAIR-BEIGE',
    brand: 'Kave Home',
    name: 'Silla Tapizada Ralf',
    description: 'Silla con asiento y respaldo acolchado tapizado en tejido suave efecto chenilla. Patas de acero con acabado negro mate.',
    category: 'Asientos',
    subcategory: 'Sillas de Comedor',
    targetRoomTypes: ['DINING_ROOM', 'KITCHEN', 'OFFICE'],
    price: {
      amount: 98.99,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 0.48,
      depthM: 0.54,
      heightM: 0.82,
      rawWidth: 48,
      rawDepth: 54,
      rawHeight: 82,
      rawUnit: 'cm',
      weightKg: 5.5,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Tejido chenilla', 'Acero lacado', 'Espuma alta resiliencia'],
    colors: ['Beige', 'Gris Oscuro', 'Mostaza'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 16,
      deliveryEstimateDays: 4,
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://media.kavehome.com/media/catalog/product/c/c/cc0678m40_1.jpg',
    productUrl: 'https://kavehome.com/es/es/p/silla-ralf-beige-y-patas-de-acero-con-acabado-negro',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.98,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'mock-kave-sofa-blok',
    retailerCode: 'KAVE_HOME',
    retailerName: 'Kave Home',
    externalId: 'kh-s001blok',
    sku: 'S001BLOK-3S',
    reference: 'BLOK-3-SEATER-GREY',
    brand: 'Kave Home',
    name: 'Sofá Blok 3 Plazas',
    description: 'Sofá contemporáneo de líneas puras tapizado con tejido anti-manchas Teflon. Estructura interna de pino macizo sostenible.',
    category: 'Asientos',
    subcategory: 'Sofás',
    targetRoomTypes: ['LIVING_ROOM'],
    price: {
      amount: 1199.0,
      currency: 'EUR',
      previousAmount: 1350.0,
      discountPercentage: 11.2,
      priceType: 'SALE',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 2.40,
      depthM: 1.00,
      heightM: 0.69,
      rawWidth: 240,
      rawDepth: 100,
      rawHeight: 69,
      rawUnit: 'cm',
      weightKg: 78.0,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Madera de pino macizo', 'Espuma ignífuga', 'Tejido Teflon'],
    colors: ['Gris Claro', 'Beige Arena', 'Verde Bosque'],
    variants: [],
    availability: {
      status: 'AVAILABLE_TO_ORDER',
      deliveryEstimateDays: 14,
      deliveryEstimateFormatted: 'Fabricación y entrega en 2 semanas',
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://media.kavehome.com/media/catalog/product/s/0/s001blok_1.jpg',
    productUrl: 'https://kavehome.com/es/es/p/sofa-blok-3-plazas-gris-claro',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.99,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },

  // --- CONFORAMA PRODUCTS (Mobiliario & Marketplace) ---
  {
    id: 'mock-conforama-aparador-brooklyn',
    retailerCode: 'CONFORAMA',
    retailerName: 'Conforama',
    externalId: 'conf-394827',
    sku: 'CONF-394827',
    reference: 'BROOKLYN-SIDEBOARD-IND',
    brand: 'Conforama Home',
    name: 'Aparador Industrial Brooklyn 3 Puertas',
    description: 'Aparador de estilo industrial con 3 puertas y 3 cajones. Acabado en roble cepillado con tiradores y patas metálicas negras.',
    category: 'Almacenaje',
    subcategory: 'Aparadores',
    targetRoomTypes: ['LIVING_ROOM', 'DINING_ROOM'],
    price: {
      amount: 279.99,
      currency: 'EUR',
      priceType: 'REGULAR',
      source: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      retrievedAt: new Date().toISOString(),
      confidence: 1.0,
      freshness: 'CURRENT',
      isMarketplace: false,
    },
    dimensions: {
      widthM: 1.60,
      depthM: 0.42,
      heightM: 0.85,
      rawWidth: 160,
      rawDepth: 42,
      rawHeight: 85,
      rawUnit: 'cm',
      weightKg: 52.0,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 1.0,
    },
    materials: ['Melamina texturizada', 'Metal lacado en polvo'],
    colors: ['Roble / Negro'],
    variants: [],
    availability: {
      status: 'IN_STOCK',
      quantityAvailable: 12,
      deliveryEstimateDays: 5,
      retrievedAt: new Date().toISOString(),
    },
    assets: [],
    primaryImageUrl: 'https://static.conforama.es/media/catalog/product/3/9/394827_1.jpg',
    productUrl: 'https://www.conforama.es/aparador-3-puertas-3-cajones-brooklyn',
    checkoutMode: 'EXTERNAL_CHECKOUT',
    isMarketplace: false,
    dataQualityScore: 0.94,
    provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
    isMockData: true,
    lastSyncedAt: new Date().toISOString(),
  },
];

export class MockRetailConnector implements IRetailConnector {
  readonly code: RetailerCode = 'MOCK';
  readonly name: string = 'Simulador Mock Retail HBD';

  async getMetadata(): Promise<RetailerMetadata> {
    return {
      id: 'retailer-mock-001',
      code: 'MOCK',
      name: 'Simulador Mock Retail HBD',
      websiteUrl: 'https://hbd.local/mock-catalog',
      isEnabled: true,
      status: 'MOCK',
      capabilities: [
        'SEARCH',
        'PRODUCT_DETAILS',
        'VARIANTS',
        'PRICING',
        'AVAILABILITY',
        'CATEGORIES',
        'IMAGES',
        'DELIVERY_ESTIMATE',
        'PURCHASE_REDIRECT',
      ],
      integrationType: 'MOCK',
      productsCount: MOCK_RETAIL_CATALOG.length,
      isMockData: true,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'SUCCESS',
      notes: 'Catálogo sintético oficial para pruebas y desarrollo autónomo sin coste de conexión.',
    };
  }

  async searchProducts(params: RetailCatalogSearchParams): Promise<RetailProductDto[]> {
    let results = [...MOCK_RETAIL_CATALOG];

    if (params.retailerCodes && params.retailerCodes.length > 0) {
      results = results.filter((p) => params.retailerCodes!.includes(p.retailerCode));
    }

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.reference?.toLowerCase().includes(q)
      );
    }

    if (params.categories && params.categories.length > 0) {
      results = results.filter((p) => params.categories!.includes(p.category));
    }

    if (params.minPrice !== undefined) {
      results = results.filter((p) => p.price.amount >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      results = results.filter((p) => p.price.amount <= params.maxPrice!);
    }

    if (params.inStockOnly) {
      results = results.filter((p) => p.availability.status === 'IN_STOCK');
    }

    if (params.roomType) {
      results = results.filter((p) => !p.targetRoomTypes || p.targetRoomTypes.includes(params.roomType!));
    }

    // Dimension filters
    if (params.maxWidth !== undefined) {
      results = results.filter((p) => p.dimensions.widthM <= params.maxWidth!);
    }
    if (params.maxDepth !== undefined) {
      results = results.filter((p) => p.dimensions.depthM <= params.maxDepth!);
    }
    if (params.maxHeight !== undefined) {
      results = results.filter((p) => p.dimensions.heightM <= params.maxHeight!);
    }

    return results;
  }

  async getProduct(externalId: string): Promise<RetailProductDto | null> {
    const found = MOCK_RETAIL_CATALOG.find((p) => p.externalId === externalId || p.id === externalId);
    return found || null;
  }

  async getVariants(externalId: string): Promise<RetailProductVariantDto[]> {
    const product = await this.getProduct(externalId);
    return product ? product.variants : [];
  }

  async getAvailability(externalId: string, _postalCode?: string): Promise<RetailProductAvailabilityDto> {
    const product = await this.getProduct(externalId);
    if (product) {
      return product.availability;
    }
    return {
      status: 'UNKNOWN',
      retrievedAt: new Date().toISOString(),
    };
  }

  async getCategories(): Promise<string[]> {
    const set = new Set<string>();
    MOCK_RETAIL_CATALOG.forEach((p) => set.add(p.category));
    return Array.from(set);
  }

  async getPrice(externalId: string, _variantId?: string): Promise<RetailProductPriceDto> {
    const product = await this.getProduct(externalId);
    if (product) {
      return product.price;
    }
    return {
      amount: 0,
      currency: 'EUR',
      priceType: 'UNKNOWN',
      source: ProductProvenance.UNKNOWN,
      retrievedAt: new Date().toISOString(),
      confidence: 0,
      freshness: 'UNKNOWN',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return {
      success: true,
      message: 'Conexión con catálogo Mock establecida correctamente (0 ms latencia).',
      latencyMs: 1,
    };
  }
}
