/**
 * HBD — HOME BOARD DESIGNER
 * V20.0.0 — CONNECTED RETAIL CATALOG & PRODUCT PLACEMENT TYPES
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { ProductProvenance, ProductVerificationStatus, ProductValidationState } from './product.types.js';

// ============================================================
// 1. ENUMS & CONSTANTES DE RETAILERS Y CONECTORES
// ============================================================

export type RetailerCode =
  | 'IKEA'
  | 'LEROY_MERLIN'
  | 'KAVE_HOME'
  | 'CONFORAMA'
  | 'MAISONS_DU_MONDE'
  | 'MANOMANO'
  | 'AMAZON'
  | 'MOCK';

export type ConnectorStatus =
  | 'AVAILABLE'
  | 'CONFIGURATION_REQUIRED'
  | 'NOT_AVAILABLE'
  | 'MOCK'
  | 'DISABLED';

export type ConnectorCapability =
  | 'SEARCH'
  | 'PRODUCT_DETAILS'
  | 'VARIANTS'
  | 'PRICING'
  | 'AVAILABILITY'
  | 'CATEGORIES'
  | 'IMAGES'
  | 'DOCUMENTS'
  | '3D_ASSET'
  | 'AFFILIATE_LINK'
  | 'PURCHASE_REDIRECT'
  | 'NATIVE_CHECKOUT'
  | 'STORE_AVAILABILITY'
  | 'DELIVERY_ESTIMATE';

export type IntegrationType =
  | 'OFFICIAL_API'
  | 'OFFICIAL_FEED'
  | 'AFFILIATE_FEED'
  | 'PARTNER_API'
  | 'AUTHORIZED_IMPORT'
  | 'USER_IMPORT'
  | 'MANUAL'
  | 'MOCK';

export type RetailStockStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'AVAILABLE_TO_ORDER'
  | 'PREORDER'
  | 'UNKNOWN';

export type PriceType =
  | 'REGULAR'
  | 'SALE'
  | 'MEMBER'
  | 'COUPON'
  | 'CLEARANCE'
  | 'MARKETPLACE'
  | 'ESTIMATED'
  | 'UNKNOWN';

export type DataFreshness = 'CURRENT' | 'RECENT' | 'STALE' | 'UNKNOWN';

export type GeometryFitResult = 'VALID' | 'WARNING' | 'INVALID' | 'UNKNOWN';

export type CheckoutMode =
  | 'EXTERNAL_CHECKOUT'
  | 'AFFILIATE_CHECKOUT'
  | 'NATIVE_CHECKOUT'
  | 'NOT_AVAILABLE';

// ============================================================
// 2. MODELOS DE RETAILER & CONECTOR
// ============================================================

export interface RetailerMetadata {
  id: string;
  code: RetailerCode;
  name: string;
  logoUrl?: string;
  websiteUrl: string;
  affiliateNetwork?: string;
  affiliateId?: string;
  isEnabled: boolean;
  status: ConnectorStatus;
  capabilities: ConnectorCapability[];
  integrationType: IntegrationType;
  lastSyncedAt?: string;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  productsCount: number;
  isMockData: boolean;
  notes?: string;
}

export interface ConnectorConfigDto {
  retailerCode: RetailerCode;
  isEnabled: boolean;
  apiKey?: string;
  partnerId?: string;
  affiliateId?: string;
  feedUrl?: string;
  rateLimitPerMin?: number;
  syncIntervalHours?: number;
}

// ============================================================
// 3. MODELO NORMALIZADO DE PRODUCTO RETAIL (NORMALIZED PRODUCT)
// ============================================================

export interface RetailProductDimensionDto {
  widthM: number;
  depthM: number;
  heightM: number;
  diameterM?: number;
  rawWidth?: number;
  rawDepth?: number;
  rawHeight?: number;
  rawUnit?: string;
  weightKg?: number;
  provenance: ProductProvenance;
  confidence: number;
}

export interface RetailProductVariantDto {
  id: string;
  externalVariantId?: string;
  name: string;
  sku?: string;
  reference?: string;
  color?: string;
  colorCode?: string;
  colorHex?: string;
  material?: string;
  finish?: string;
  price?: number;
  currency: string;
  imageUrl?: string;
  dimensions?: RetailProductDimensionDto;
  stockStatus?: RetailStockStatus;
  isAvailable: boolean;
  provenance: ProductProvenance;
  confidence: number;
}

export interface RetailProductPriceDto {
  amount: number;
  currency: string;
  previousAmount?: number;
  discountPercentage?: number;
  priceType: PriceType;
  source: ProductProvenance;
  retrievedAt: string;
  validUntil?: string;
  isMarketplace?: boolean;
  marketplaceSeller?: string;
  confidence: number;
  freshness: DataFreshness;
}

export interface RetailProductAvailabilityDto {
  status: RetailStockStatus;
  quantityAvailable?: number;
  storeAvailability?: Array<{
    storeId: string;
    storeName: string;
    cityName: string;
    postalCode?: string;
    stock: number;
    status: RetailStockStatus;
  }>;
  deliveryEstimateDays?: number;
  deliveryEstimateFormatted?: string;
  deliveryFee?: number;
  retrievedAt: string;
}

export interface RetailProductAssetDto {
  id: string;
  type: 'IMAGE' | '3D_MODEL' | 'DOCUMENT' | 'MANUAL';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  format?: string;
  isPrimary?: boolean;
  provenance: ProductProvenance;
}

export interface RetailProductDto {
  id: string;
  retailerId?: string;
  retailerCode: RetailerCode;
  retailerName: string;
  externalId: string;
  sku?: string;
  reference?: string;
  brand?: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  targetRoomTypes?: string[];
  price: RetailProductPriceDto;
  dimensions: RetailProductDimensionDto;
  materials: string[];
  colors: string[];
  variants: RetailProductVariantDto[];
  selectedVariantId?: string;
  availability: RetailProductAvailabilityDto;
  assets: RetailProductAssetDto[];
  primaryImageUrl?: string;
  productUrl: string;
  purchaseUrl?: string;
  affiliateUrl?: string;
  checkoutMode: CheckoutMode;
  isMarketplace: boolean;
  marketplaceSeller?: string;
  dataQualityScore: number; // 0.0 to 1.0 (e.g. 0.95 = 95%)
  provenance: ProductProvenance;
  isMockData: boolean;
  lastSyncedAt: string;
  isFavorite?: boolean;
  matchedInternalProductId?: string;
}

// ============================================================
// 4. BÚSQUEDA Y FILTRADO AVANZADO DEL CATÁLOGO
// ============================================================

export interface RetailCatalogSearchParams {
  query?: string;
  retailerCodes?: RetailerCode[];
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  roomType?: string;
  minWidth?: number; // meters
  maxWidth?: number; // meters
  minDepth?: number; // meters
  maxDepth?: number; // meters
  minHeight?: number; // meters
  maxHeight?: number; // meters
  color?: string;
  material?: string;
  fitToZone?: {
    availableWidthM: number;
    availableDepthM: number;
    availableHeightM?: number;
  };
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'availability' | 'dimensions' | 'quality';
  page?: number;
  limit?: number;
  onlyFavorites?: boolean;
}

export interface RetailCatalogSearchResult {
  items: RetailProductDto[];
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
  retailersSummary: Array<{
    code: RetailerCode;
    name: string;
    count: number;
    status: ConnectorStatus;
  }>;
  availableCategories: string[];
  availableColors: string[];
  availableMaterials: string[];
  queryNormalized?: string;
  totalRetailersQueried?: number;
}

// ============================================================
// 5. SMART FIT & INTEGRACIÓN ESPACIAL 2D/3D
// ============================================================

export interface SpaceFitValidationResult {
  fitResult: GeometryFitResult;
  message: string;
  clearanceScore: number; // 0 to 100
  warnings: string[];
  dimensionComparison: {
    productWidthM: number;
    productDepthM: number;
    productHeightM: number;
    availableWidthM: number;
    availableDepthM: number;
    availableHeightM?: number;
    widthDifferenceM: number;
    depthDifferenceM: number;
  };
}

export interface AddRetailProductToProjectInput {
  projectId: string;
  productId: string;
  variantId?: string;
  floorId?: string;
  roomId?: string;
  roomName?: string;
  quantity?: number;
  placeOnPlan?: boolean;
  posX?: number;
  posY?: number;
  posZ?: number;
  rotationDeg?: number;
  addToFinancial?: boolean;
  addToProcurement?: boolean;
}

export interface AddRetailProductToProjectResult {
  success: boolean;
  projectProductId: string;
  productId: string;
  furnitureTwinId?: string;
  furniturePlacementId?: string;
  fitValidation: SpaceFitValidationResult;
  financialItemCreated: boolean;
  procurementItemCreated: boolean;
  message: string;
}

// ============================================================
// 6. COMPARADOR MULTI-PRODUCTO
// ============================================================

export interface RetailProductComparisonItemDto {
  product: RetailProductDto;
  score: number;
  pros: string[];
  cons: string[];
  isBestPrice: boolean;
  isBestFit: boolean;
}

export interface RetailProductComparisonResultDto {
  items: RetailProductComparisonItemDto[];
  bestPriceId?: string;
  bestFitId?: string;
  bestQualityId?: string;
  comparisonMatrix: {
    prices: Record<string, number>;
    dimensions: Record<string, string>;
    availability: Record<string, string>;
    delivery: Record<string, string>;
  };
}
