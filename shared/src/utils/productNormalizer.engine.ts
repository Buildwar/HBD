/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT DATA NORMALIZER ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProductDimensionUnit,
  ProductDimensionsDto,
  ProductMaterialCategory,
  ProductMaterialDto,
  ProductProvenance,
} from '../types/product.types.js';

export class ProductNormalizerEngine {
  /**
   * Convierte cualquier valor a metros (unidad métrica estándar de HBD)
   */
  static toMeters(value: number, unit: ProductDimensionUnit): number {
    if (isNaN(value) || value <= 0) return 0;
    switch (unit) {
      case 'mm':
        return Number((value / 1000).toFixed(4));
      case 'cm':
        return Number((value / 100).toFixed(4));
      case 'm':
        return Number(value.toFixed(4));
      case 'in':
        return Number((value * 0.0254).toFixed(4));
      case 'ft':
        return Number((value * 0.3048).toFixed(4));
      default:
        return Number(value.toFixed(4));
    }
  }

  /**
   * Extrae dimensiones numéricas a partir de un texto libre o especificación técnica
   */
  static parseDimensionsFromText(text: string): ProductDimensionsDto | null {
    if (!text || typeof text !== 'string') return null;

    const normalized = text.toLowerCase().replace(/,/g, '.');

    // Función auxiliar para deducir unidad de una cadena específica
    const resolveUnit = (unitStr?: string): ProductDimensionUnit => {
      if (!unitStr) return 'cm';
      const u = unitStr.toLowerCase().trim();
      if (u === 'mm' || u.includes('milímetro') || u.includes('milimetro')) return 'mm';
      if (u === 'm' || u.includes('metro')) return 'm';
      if (u === 'in' || u.includes('inch') || u.includes('pulgada') || u === '"') return 'in';
      if (u === 'ft' || u.includes('pie') || u === "'") return 'ft';
      return 'cm';
    };

    // Patrón 1: Triple dimensión consecutiva con separador y posible unidad al final
    // Ej: "180 x 40 x 85 cm", "180x40x85cm", "180 * 40 * 85 mm", "180 × 40 × 85"
    const tripleMatch = normalized.match(
      /([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|×)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|×)\s*([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|m|in|ft|cent[ií]metros?|mil[ií]metros?|metros?|pulgadas?)?/i
    );
    if (tripleMatch) {
      const rawW = parseFloat(tripleMatch[1]);
      const rawD = parseFloat(tripleMatch[2]);
      const rawH = parseFloat(tripleMatch[3]);
      const unit = resolveUnit(tripleMatch[4]);

      return {
        widthM: this.toMeters(rawW, unit),
        depthM: this.toMeters(rawD, unit),
        heightM: this.toMeters(rawH, unit),
        rawWidth: rawW,
        rawDepth: rawD,
        rawHeight: rawH,
        rawUnit: unit,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 0.95,
      };
    }

    // Patrón 2: Ancho / Fondo / Alto explícitos
    const widthMatch = normalized.match(/(?:ancho|width|w|largura|longitud|l)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|m|in|ft)?/i);
    const depthMatch = normalized.match(/(?:fondo|profundidad|depth|d|largo|length)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|m|in|ft)?/i);
    const heightMatch = normalized.match(/(?:alto|altura|height|h|alt)[\s:]*([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|m|in|ft)?/i);

    if (widthMatch && depthMatch && heightMatch) {
      const unit = resolveUnit(widthMatch[2] || depthMatch[2] || heightMatch[2]);
      const rawW = parseFloat(widthMatch[1]);
      const rawD = parseFloat(depthMatch[1]);
      const rawH = parseFloat(heightMatch[1]);

      return {
        widthM: this.toMeters(rawW, unit),
        depthM: this.toMeters(rawD, unit),
        heightM: this.toMeters(rawH, unit),
        rawWidth: rawW,
        rawDepth: rawD,
        rawHeight: rawH,
        rawUnit: unit,
        provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
        confidence: 0.95,
      };
    }

    // Patrón 3: Doble dimensión (ej: "140 x 200 cm")
    const doubleMatch = normalized.match(
      /([0-9]+(?:\.[0-9]+)?)\s*(?:x|\*|×)\s*([0-9]+(?:\.[0-9]+)?)\s*(mm|cm|m|in|ft|cent[ií]metros?|mil[ií]metros?|metros?|pulgadas?)?/i
    );
    if (doubleMatch) {
      const rawW = parseFloat(doubleMatch[1]);
      const rawD = parseFloat(doubleMatch[2]);
      const unit = resolveUnit(doubleMatch[3]);

      return {
        widthM: this.toMeters(rawW, unit),
        depthM: this.toMeters(rawD, unit),
        heightM: 0.75, // Altura estándar estimada
        rawWidth: rawW,
        rawDepth: rawD,
        rawHeight: 75,
        rawUnit: unit,
        provenance: ProductProvenance.ESTIMATED,
        confidence: 0.65,
      };
    }

    return null;
  }

  /**
   * Clasifica e identifica materiales a partir de texto
   */
  static parseMaterialsFromText(text: string): ProductMaterialDto[] {
    if (!text || typeof text !== 'string') return [];

    const lower = text.toLowerCase();
    const materials: ProductMaterialDto[] = [];

    const checkAndAdd = (keyword: string, category: ProductMaterialCategory, name: string, hex?: string) => {
      if (lower.includes(keyword)) {
        materials.push({
          category,
          name,
          colorHex: hex,
          provenance: ProductProvenance.OFFICIAL_PRODUCT_DATA,
          confidence: 0.85,
        });
      }
    };

    checkAndAdd('roble', ProductMaterialCategory.WOOD, 'Roble', '#A07044');
    checkAndAdd('nogal', ProductMaterialCategory.WOOD, 'Nogal', '#5C4033');
    checkAndAdd('pino', ProductMaterialCategory.WOOD, 'Pino', '#D2B48C');
    checkAndAdd('madera', ProductMaterialCategory.WOOD, 'Madera', '#8B5A2B');
    checkAndAdd('acero', ProductMaterialCategory.METAL, 'Acero', '#71797E');
    checkAndAdd('aluminio', ProductMaterialCategory.METAL, 'Aluminio', '#848789');
    checkAndAdd('hierro', ProductMaterialCategory.METAL, 'Hierro', '#36454F');
    checkAndAdd('cristal', ProductMaterialCategory.GLASS, 'Vidrio / Cristal', '#A8CCD7');
    checkAndAdd('vidrio', ProductMaterialCategory.GLASS, 'Vidrio', '#A8CCD7');
    checkAndAdd('tela', ProductMaterialCategory.FABRIC, 'Tejido textil', '#E5E4E2');
    checkAndAdd('lino', ProductMaterialCategory.FABRIC, 'Lino', '#FAF0E6');
    checkAndAdd('cuero', ProductMaterialCategory.LEATHER, 'Cuero', '#4A2511');
    checkAndAdd('piel', ProductMaterialCategory.LEATHER, 'Piel sintética / natural', '#3D2314');
    checkAndAdd('marmol', ProductMaterialCategory.STONE, 'Mármol', '#F5F5F5');
    checkAndAdd('mármol', ProductMaterialCategory.STONE, 'Mármol', '#F5F5F5');
    checkAndAdd('plastico', ProductMaterialCategory.PLASTIC, 'Polipropileno / Plástico', '#E0E0E0');
    checkAndAdd('plástico', ProductMaterialCategory.PLASTIC, 'Plástico', '#E0E0E0');

    // Deduplicar por nombre
    const unique = materials.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
    return unique.length > 0
      ? unique
      : [
          {
            category: ProductMaterialCategory.UNKNOWN,
            name: 'Material estándar',
            provenance: ProductProvenance.ESTIMATED,
            confidence: 0.5,
          },
        ];
  }

  /**
   * Normaliza la moneda (ISO 4217)
   */
  static normalizeCurrency(currencyStr?: string): string {
    if (!currencyStr) return 'EUR';
    const c = currencyStr.trim().toUpperCase();
    if (c === '€' || c === 'EUR' || c === 'EURO' || c === 'EUROS') return 'EUR';
    if (c === '$' || c === 'USD' || c === 'DOLLAR') return 'USD';
    if (c === '£' || c === 'GBP') return 'GBP';
    return c.substring(0, 3);
  }

  /**
   * Normaliza el precio numérico
   */
  static parsePrice(priceVal: any): number | null {
    if (typeof priceVal === 'number' && !isNaN(priceVal)) return Number(priceVal.toFixed(2));
    if (typeof priceVal === 'string') {
      const clean = priceVal.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
      const parsed = parseFloat(clean);
      return !isNaN(parsed) && parsed >= 0 ? Number(parsed.toFixed(2)) : null;
    }
    return null;
  }
}
