/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT IMPORT MASTER ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ExtractionMethod,
  Product3DAssetDto,
  ProductDimensionsDto,
  ProductDto,
  ProductImageDto,
  ProductImageType,
  ProductImportInput,
  ProductImportResultDto,
  ProductMaterialCategory,
  ProductMaterialDto,
  ProductProvenance,
  ProductValidationState,
  ProductVariantDto,
  ProductVerificationStatus,
} from '../types/product.types.js';
import { DigitalFurnitureTwinEngine } from './digitalFurnitureTwin.engine.js';
import { IProductAIProvider, MockProductAIProvider } from './productAI.provider.js';
import { ExtractedRawData, ProductExtractorRegistry } from './productExtractor.engine.js';
import { ProductNormalizerEngine } from './productNormalizer.engine.js';
import { ProductProvenanceEngine } from './productProvenance.engine.js';
import { ProductValidatorEngine } from './productValidator.engine.js';

export class ProductImportEngine {
  private aiProvider: IProductAIProvider;

  constructor(aiProvider?: IProductAIProvider) {
    this.aiProvider = aiProvider || new MockProductAIProvider();
  }

  /**
   * Importa y analiza un producto a partir de su contenido HTML y URL de origen
   */
  async processHtmlImport(
    html: string,
    url: string,
    options: { projectId?: string; aiAssisted?: boolean } = {}
  ): Promise<ProductImportResultDto> {
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const validationIssues: string[] = [];

    // 1. Verificación de Seguridad de la URL (Anti-SSRF)
    const urlCheck = ProductValidatorEngine.validateUrlSecurity(url);
    if (!urlCheck.isSafe) {
      return {
        success: false,
        variants: [],
        images: [],
        warnings: [],
        missingFields: [],
        confidence: 0,
        confidenceLevel: 'LOW',
        provenance: ProductProvenance.UNKNOWN,
        extractionMethod: ExtractionMethod.GENERIC_HTML,
        sourceUrl: url,
        sourceDomain: 'unknown',
        validationIssues: [urlCheck.reason || 'URL no permitida por motivos de seguridad.'],
        validationState: ProductValidationState.INVALID,
      };
    }

    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();

    // 2. Selección de conector y extracción de datos
    const extractor = ProductExtractorRegistry.getExtractor(url);
    const rawData = await extractor.extract(html, url, domain);

    const extractionMethod =
      extractor.extractorName === 'IkeaProductExtractor'
        ? ExtractionMethod.IKEA_SPECIFIC
        : rawData.rawJsonLd
        ? ExtractionMethod.JSON_LD
        : ExtractionMethod.GENERIC_HTML;

    // 3. Resolución de nombre y marca
    const name = rawData.name || rawData.title || 'Producto Importado';
    const brand = rawData.brand || (domain.includes('ikea') ? 'IKEA' : domain.replace('www.', '').split('.')[0].toUpperCase());

    // 4. Resolución y normalización de dimensiones
    let dimensions: ProductDimensionsDto | undefined = rawData.dimensions;
    if (!dimensions && options.aiAssisted) {
      const aiDim = await this.aiProvider.extractDimensions(`${name} ${rawData.description || ''}`);
      if (aiDim) {
        dimensions = aiDim;
        warnings.push('Las dimensiones se dedujeron mediante inferencia de IA.');
      }
    }

    if (!dimensions) {
      missingFields.push('dimensions');
      warnings.push('No se pudieron extraer las dimensiones completas. Se requiere confirmación manual del usuario.');
      dimensions = {
        widthM: 1.0,
        depthM: 0.6,
        heightM: 0.75,
        provenance: ProductProvenance.ESTIMATED,
        confidence: 0.35,
      };
    }

    // 5. Materiales
    let materials: ProductMaterialDto[] = rawData.materials || [];
    if (materials.length === 0 && options.aiAssisted) {
      materials = await this.aiProvider.detectMaterials(`${name} ${rawData.description || ''}`);
    }
    if (materials.length === 0) {
      materials = [
        {
          category: ProductMaterialCategory.UNKNOWN,
          name: 'Material estándar de catálogo',
          provenance: ProductProvenance.ESTIMATED,
          confidence: 0.5,
        },
      ];
    }

    // 6. Imágenes
    const images: ProductImageDto[] = (rawData.images || []).map((img, idx) => ({
      url: img.url,
      type: img.type || (idx === 0 ? ProductImageType.PRIMARY : ProductImageType.GALLERY),
      altText: img.alt || name,
      isPrimary: idx === 0,
      sourceUrl: url,
    }));

    if (images.length === 0) {
      missingFields.push('images');
      warnings.push('No se encontraron imágenes oficiales del producto.');
    }

    // 7. Categoría
    let category = rawData.category;
    if (!category) {
      const aiCat = await this.aiProvider.classifyCategory(name, rawData.description);
      category = aiCat.category;
    }

    // 8. Precio
    const price = rawData.price !== undefined ? rawData.price : null;
    const currency = rawData.currency || 'EUR';
    if (price === null) {
      missingFields.push('price');
      warnings.push('El precio no está disponible o no se pudo extraer.');
    }

    // 9. Variantes
    const variants: ProductVariantDto[] = (rawData.variants || []).map((v, i) => ({
      id: `var-${i + 1}`,
      productId: 'temp-prod-id',
      name: v.name || `Variante ${i + 1}`,
      sku: v.sku,
      color: v.color,
      colorCode: v.colorCode,
      material: v.material,
      finish: v.finish,
      price: v.price || price || 0,
      currency,
      imageUrl: v.imageUrl || images[0]?.url,
      provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
      confidence: 0.9,
      selected: i === 0,
    }));

    // 10. Cálculo de Confianza Global y Procedencia
    let confidence = 0.95;
    if (extractionMethod === ExtractionMethod.GENERIC_HTML) confidence -= 0.15;
    if (missingFields.includes('dimensions')) confidence -= 0.35;
    if (missingFields.includes('price')) confidence -= 0.1;
    if (missingFields.includes('images')) confidence -= 0.1;
    confidence = Math.max(0.2, Number(confidence.toFixed(2)));

    const confidenceLevel = ProductProvenanceEngine.getConfidenceTier(confidence);
    const provenance =
      extractionMethod === ExtractionMethod.IKEA_SPECIFIC || extractionMethod === ExtractionMethod.JSON_LD
        ? ProductProvenance.OFFICIAL_PRODUCT_DATA
        : ProductProvenance.IMPORTED;

    const verificationStatus =
      missingFields.includes('dimensions')
        ? ProductVerificationStatus.REVIEW_REQUIRED
        : ProductVerificationStatus.SYSTEM_EXTRACTED;

    const tempProduct: ProductDto = {
      id: `prod-${Date.now().toString(36)}`,
      projectId: options.projectId || null,
      name,
      brand,
      sku: rawData.sku || null,
      category,
      description: rawData.description || null,
      sourceUrl: url,
      sourceDomain: domain,
      importedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency,
      price,
      availability: rawData.availability || 'InStock',
      productPageTitle: rawData.title || name,
      provenance,
      confidence,
      confidenceLevel,
      verificationStatus,
      dimensions,
      materials,
      variants,
      images,
      assets3d: [],
      rawStructuredData: rawData.rawJsonLd || null,
    };

    // Generar asset paramétrico inicial
    const initialAsset = DigitalFurnitureTwinEngine.generateParametricAsset(tempProduct, dimensions);
    tempProduct.assets3d = [initialAsset];

    // Validación
    const validationReport = ProductValidatorEngine.validateProduct(tempProduct);
    validationIssues.push(...validationReport.issues);

    return {
      success: validationReport.isValid || validationReport.state === ProductValidationState.WARNING,
      product: tempProduct,
      variants,
      images,
      dimensions,
      warnings: [...warnings, ...validationReport.warnings],
      missingFields,
      confidence,
      confidenceLevel,
      provenance,
      extractionMethod,
      sourceUrl: url,
      sourceDomain: domain,
      validationIssues,
      validationState: validationReport.state,
    };
  }
}
