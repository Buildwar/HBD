/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT DATA VALIDATOR & SECURITY ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProductDimensionsDto,
  ProductDto,
  ProductValidationState,
} from '../types/product.types.js';

export interface ValidationReport {
  state: ProductValidationState;
  isValid: boolean;
  issues: string[];
  warnings: string[];
  canCreateTwin: boolean;
}

export class ProductValidatorEngine {
  /**
   * Valida la seguridad de la URL para evitar ataques SSRF
   */
  static validateUrlSecurity(urlStr: string): { isSafe: boolean; reason?: string } {
    if (!urlStr || typeof urlStr !== 'string') {
      return { isSafe: false, reason: 'URL vacía o no válida' };
    }

    try {
      const parsed = new URL(urlStr);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isSafe: false, reason: 'Solo se admiten protocolos HTTP y HTTPS' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Bloquear localhost y variantes
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === '::1'
      ) {
        return { isSafe: false, reason: 'Acceso a direcciones locales bloqueado por seguridad (SSRF)' };
      }

      // Bloquear rangos de IP privadas (RFC 1918)
      // 10.0.0.0/8
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return { isSafe: false, reason: 'Direcciones IP privadas (10.0.0.0/8) no permitidas' };
      }
      // 192.168.0.0/16
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return { isSafe: false, reason: 'Direcciones IP privadas (192.168.0.0/16) no permitidas' };
      }
      // 172.16.0.0 - 172.31.255.255
      const ip172Match = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
      if (ip172Match) {
        const octet = parseInt(ip172Match[1], 10);
        if (octet >= 16 && octet <= 31) {
          return { isSafe: false, reason: 'Direcciones IP privadas (172.16.0.0/12) no permitidas' };
        }
      }

      // Bloquear metadatos cloud (169.254.169.254)
      if (hostname === '169.254.169.254') {
        return { isSafe: false, reason: 'Direcciones de metadatos de infraestructura cloud no permitidas' };
      }

      return { isSafe: true };
    } catch {
      return { isSafe: false, reason: 'Formato de URL inválido' };
    }
  }

  /**
   * Valida las dimensiones volumétricas del producto
   */
  static validateDimensions(dimensions?: ProductDimensionsDto | null): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!dimensions) {
      issues.push('No se han especificado las dimensiones del producto.');
      return { isValid: false, issues, warnings };
    }

    const { widthM, depthM, heightM } = dimensions;

    if (isNaN(widthM) || widthM <= 0) {
      issues.push('La anchura debe ser un número positivo mayor que cero.');
    }
    if (isNaN(depthM) || depthM <= 0) {
      issues.push('La profundidad/fondo debe ser un número positivo mayor que cero.');
    }
    if (isNaN(heightM) || heightM <= 0) {
      issues.push('La altura debe ser un número positivo mayor que cero.');
    }

    // Comprobaciones de rango realista para mobiliario residencial (0.05m a 10m)
    if (widthM > 10 || depthM > 10 || heightM > 10) {
      warnings.push('Las dimensiones detectadas superan los 10 metros; comprueba si la unidad (cm/mm) se convirtió correctamente.');
    }
    if (widthM < 0.10 && depthM < 0.10) {
      warnings.push('El objeto tiene menos de 10 cm en planta; puede tratarse de un accesorio pequeño o una medida errónea.');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Valida integralmente el producto antes de crear el Digital Furniture Twin
   */
  static validateProduct(product: Partial<ProductDto>): ValidationReport {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      issues.push('El nombre del producto es obligatorio.');
    }

    if (!product.sourceUrl) {
      issues.push('La URL de origen es obligatoria para garantizar la trazabilidad.');
    } else {
      const urlCheck = this.validateUrlSecurity(product.sourceUrl);
      if (!urlCheck.isSafe) {
        issues.push(`Seguridad URL: ${urlCheck.reason}`);
      }
    }

    const dimCheck = this.validateDimensions(product.dimensions);
    issues.push(...dimCheck.issues);
    warnings.push(...dimCheck.warnings);

    if (product.price === undefined || product.price === null) {
      warnings.push('No se ha detectado el precio del producto.');
    }

    if (!product.images || product.images.length === 0) {
      warnings.push('No se han encontrado fotografías del producto.');
    }

    let state = ProductValidationState.VALID;
    if (issues.length > 0) {
      state = ProductValidationState.INVALID;
    } else if (warnings.length > 0) {
      state = ProductValidationState.WARNING;
    }

    return {
      state,
      isValid: issues.length === 0,
      issues,
      warnings,
      canCreateTwin: issues.length === 0 && Boolean(product.dimensions && product.dimensions.widthM > 0),
    };
  }
}
