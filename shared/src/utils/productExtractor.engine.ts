/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT EXTRACTOR ARCHITECTURE & CONNECTORS
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ExtractionMethod,
  ProductDimensionsDto,
  ProductDto,
  ProductImageDto,
  ProductImageType,
  ProductMaterialCategory,
  ProductMaterialDto,
  ProductProvenance,
  ProductValidationState,
  ProductVariantDto,
  ProductVerificationStatus,
} from '../types/product.types.js';
import { ProductNormalizerEngine } from './productNormalizer.engine.js';
import { ProductProvenanceEngine } from './productProvenance.engine.js';
import { ProductValidatorEngine } from './productValidator.engine.js';

export interface ExtractedRawData {
  title?: string;
  name?: string;
  brand?: string;
  sku?: string;
  category?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  availability?: string;
  rawDimensionsText?: string;
  dimensions?: ProductDimensionsDto;
  materialsText?: string;
  materials?: ProductMaterialDto[];
  images?: Array<{ url: string; type?: ProductImageType; alt?: string; isPrimary?: boolean }>;
  variants?: Array<Partial<ProductVariantDto>>;
  model3dUrl?: string;
  rawJsonLd?: any;
}

export interface IProductExtractor {
  readonly extractorName: string;
  canHandle(url: string, domain: string): boolean;
  extract(html: string, url: string, domain: string): Promise<ExtractedRawData>;
}

// ============================================================
// 1. GENERIC EXTRACTOR (JSON-LD, MICRODATA, OPENGRAPH, HTML)
// ============================================================

export class GenericProductExtractor implements IProductExtractor {
  readonly extractorName = 'GenericProductExtractor';

  canHandle(_url: string, _domain: string): boolean {
    return true; // Fallback universal
  }

  async extract(html: string, url: string, domain: string): Promise<ExtractedRawData> {
    const raw: ExtractedRawData = {
      images: [],
      variants: [],
      materials: [],
    };

    // 1. Extraer JSON-LD de tipo Product
    const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const content = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
          const parsed = JSON.parse(content);
          const productObj = this.findProductInJsonLd(parsed);
          if (productObj) {
            raw.rawJsonLd = productObj;
            raw.name = productObj.name || productObj.headline;
            raw.brand = typeof productObj.brand === 'object' ? productObj.brand.name : productObj.brand;
            raw.sku = productObj.sku || productObj.productID || productObj.mpn;
            raw.category = productObj.category;
            raw.description = productObj.description;

            // Ofertas / Precio
            if (productObj.offers) {
              const offer = Array.isArray(productObj.offers) ? productObj.offers[0] : productObj.offers;
              if (offer) {
                raw.price = ProductNormalizerEngine.parsePrice(offer.price || offer.lowPrice);
                raw.currency = ProductNormalizerEngine.normalizeCurrency(offer.priceCurrency);
                raw.availability = offer.availability ? String(offer.availability).split('/').pop() : 'InStock';
              }
            }

            // Imágenes
            if (productObj.image) {
              const imgArray = Array.isArray(productObj.image) ? productObj.image : [productObj.image];
              imgArray.forEach((img: any, idx: number) => {
                const imgUrl = typeof img === 'object' ? img.url || img.contentUrl : img;
                if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                  raw.images?.push({
                    url: imgUrl,
                    type: idx === 0 ? ProductImageType.PRIMARY : ProductImageType.GALLERY,
                    isPrimary: idx === 0,
                  });
                }
              });
            }

            // Dimensiones en JSON-LD si existen
            if (productObj.width && productObj.depth && productObj.height) {
              raw.dimensions = {
                widthM: ProductNormalizerEngine.toMeters(parseFloat(productObj.width.value || productObj.width), 'cm'),
                depthM: ProductNormalizerEngine.toMeters(parseFloat(productObj.depth.value || productObj.depth), 'cm'),
                heightM: ProductNormalizerEngine.toMeters(parseFloat(productObj.height.value || productObj.height), 'cm'),
                provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
                confidence: 0.95,
              };
            }
            break;
          }
        } catch {
          // Continuar con otros bloques JSON-LD
        }
      }
    }

    // 2. OpenGraph y Meta tags si faltan campos
    if (!raw.name) {
      const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      if (ogTitle) raw.name = ogTitle[1].trim();
    }
    if (!raw.description) {
      const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
      if (ogDesc) raw.description = ogDesc[1].trim();
    }
    if (!raw.price) {
      const ogPrice = html.match(/<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i);
      if (ogPrice) raw.price = ProductNormalizerEngine.parsePrice(ogPrice[1]);
      const ogCurr = html.match(/<meta\s+property=["']product:price:currency["']\s+content=["']([^"']+)["']/i);
      if (ogCurr) raw.currency = ProductNormalizerEngine.normalizeCurrency(ogCurr[1]);
    }
    if ((!raw.images || raw.images.length === 0)) {
      const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogImg) {
        raw.images?.push({
          url: ogImg[1].trim(),
          type: ProductImageType.PRIMARY,
          isPrimary: true,
        });
      }
    }

    // 3. Fallback de título en etiqueta <title>
    if (!raw.name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        raw.name = titleMatch[1].split('|')[0].split('-')[0].trim();
        raw.title = titleMatch[1].trim();
      }
    }

    // 4. Búsqueda de texto de dimensiones en el contenido HTML o descripción si no se encontraron en JSON-LD
    if (!raw.dimensions) {
      const fullText = `${raw.name || ''} ${raw.description || ''} ${html.replace(/<[^>]+>/g, ' ')}`;
      const parsedDim = ProductNormalizerEngine.parseDimensionsFromText(fullText);
      if (parsedDim) {
        raw.dimensions = parsedDim;
      }
    }

    // 5. Materiales
    if (raw.description) {
      raw.materials = ProductNormalizerEngine.parseMaterialsFromText(raw.description);
    }

    return raw;
  }

  private findProductInJsonLd(obj: any): any {
    if (!obj || typeof obj !== 'object') return null;
    if (obj['@type'] === 'Product' || (Array.isArray(obj['@type']) && obj['@type'].includes('Product'))) {
      return obj;
    }
    if (Array.isArray(obj['@graph'])) {
      return obj['@graph'].find((item: any) => item['@type'] === 'Product') || null;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = this.findProductInJsonLd(item);
        if (found) return found;
      }
    }
    return null;
  }
}

// ============================================================
// 2. IKEA PRODUCT EXTRACTOR (ESPECÍFICO CON MÁXIMA PRECISIÓN)
// ============================================================

export class IkeaProductExtractor implements IProductExtractor {
  readonly extractorName = 'IkeaProductExtractor';

  canHandle(url: string, domain: string): boolean {
    const d = domain.toLowerCase();
    return d.includes('ikea.com') || d.includes('ikea.es') || d.includes('ikea.fr') || d.includes('ikea.de') || url.includes('ikea.');
  }

  async extract(html: string, url: string, domain: string): Promise<ExtractedRawData> {
    const generic = new GenericProductExtractor();
    const raw = await generic.extract(html, url, domain);

    raw.brand = 'IKEA';

    // Detección de SKU de IKEA (ejemplo: "304.567.89" o "30456789")
    const ikeaArticleMatch = html.match(/(?:artículo|nº\s*artículo|item\s*no|article\s*number)[\s:]*([0-9]{3}\.?[0-9]{3}\.?[0-9]{2}|[0-9]{8})/i);
    if (ikeaArticleMatch) {
      raw.sku = ikeaArticleMatch[1].replace(/\./g, '');
    }

    // Dimensiones específicas de IKEA (ej: "180x40x85 cm", "140x200 cm")
    const titleOrDesc = `${raw.name || ''} ${raw.description || ''} ${html.replace(/<[^>]+>/g, ' ')}`;
    const dim = ProductNormalizerEngine.parseDimensionsFromText(titleOrDesc);
    if (dim) {
      raw.dimensions = {
        ...dim,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 0.98,
      };
    }

    // Asignar categoría apropiada de mobiliario
    if (raw.name) {
      const lower = raw.name.toLowerCase();
      if (lower.includes('sofá') || lower.includes('sofa') || lower.includes('sillón')) raw.category = 'Sofás y Sillones';
      else if (lower.includes('mesa') || lower.includes('table')) raw.category = 'Mesas y Escritorios';
      else if (lower.includes('silla') || lower.includes('chair')) raw.category = 'Sillas';
      else if (lower.includes('armario') || lower.includes('wardrobe') || lower.includes('pax')) raw.category = 'Armarios y Almacenaje';
      else if (lower.includes('cama') || lower.includes('bed') || lower.includes('malm')) raw.category = 'Camas y Dormitorio';
      else if (lower.includes('estantería') || lower.includes('estanteria') || lower.includes('kallax') || lower.includes('billy')) raw.category = 'Estanterías';
      else raw.category = raw.category || 'Mobiliario';
    }

    return raw;
  }
}

// ============================================================
// 3. REGISTRO DE EXTRACTORES
// ============================================================

export class ProductExtractorRegistry {
  private static extractors: IProductExtractor[] = [
    new IkeaProductExtractor(),
    new GenericProductExtractor(), // Universal fallback al final
  ];

  static registerExtractor(extractor: IProductExtractor): void {
    this.extractors.unshift(extractor);
  }

  static getExtractor(url: string): IProductExtractor {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.toLowerCase();
      const match = this.extractors.find((e) => e.canHandle(url, domain));
      return match || this.extractors[this.extractors.length - 1];
    } catch {
      return this.extractors[this.extractors.length - 1];
    }
  }
}
