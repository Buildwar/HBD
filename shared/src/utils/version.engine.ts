/**
 * HBD — Version & Phase Engine
 * Sistema de versionado semántico estructurado y mapeo de fases de roadmap.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

export class VersionEngine {
  /**
   * Valida si un string cumple el formato SemVer básico (MAJOR.MINOR.PATCH)
   */
  static isValidSemVer(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Parsea un string de versión en componentes numéricos
   */
  static parseVersion(version: string): VersionInfo {
    if (!this.isValidSemVer(version)) {
      throw new Error(`Versión inválida para HBD: "${version}". Se requiere formato SemVer MAJOR.MINOR.PATCH.`);
    }
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch, raw: version };
  }

  /**
   * Convierte una fase del roadmap (V1, V2, V20, etc.) a su versión semántica de software correspondiente
   * 
   * Reglas de negocio HBD:
   * - Fase V1  -> 1.0.0
   * - Fase V2  -> 1.2.0
   * - Fase V3  -> 1.3.0
   * - Fase V10 -> 1.10.0
   * - Fase V19 -> 1.19.0
   * - Fase V20 -> 1.20.0
   * - Fase V21 -> 1.21.0
   * - Fase V24 -> 1.24.0
   */
  static phaseToVersion(phase: string, patch: number = 0): string {
    const cleaned = phase.trim().toUpperCase();
    const match = cleaned.match(/^V?(\d+)$/);
    if (!match) {
      throw new Error(`Fase del roadmap inválida: "${phase}". Debe tener formato V1, V2, ... V20, etc.`);
    }

    const phaseNumber = parseInt(match[1], 10);
    if (phaseNumber < 1) {
      throw new Error(`Número de fase inválido: ${phaseNumber}`);
    }

    const major = 1;
    // Para V1, la versión base es 1.0.0. Para V2 en adelante, MINOR = phaseNumber.
    const minor = phaseNumber === 1 ? 0 : phaseNumber;
    return `${major}.${minor}.${patch}`;
  }

  /**
   * Extrae la fase del roadmap asociada a una versión del software
   * 
   * Ejemplos:
   * - 1.0.0  -> V1
   * - 1.2.0  -> V2
   * - 1.20.0 -> V20
   * - 1.20.3 -> V20
   */
  static versionToPhase(version: string): string {
    const { major, minor } = this.parseVersion(version);
    if (major === 1) {
      if (minor === 0) return 'V1';
      return `V${minor}`;
    }
    // En caso de que en un futuro exista MAJOR > 1
    return `V${major}.${minor}`;
  }

  /**
   * Incrementa el número de PATCH dentro de la misma fase funcional
   * 
   * Ejemplos:
   * - 1.20.0 -> 1.20.1
   * - 1.20.1 -> 1.20.2
   */
  static incrementPatch(version: string): string {
    const { major, minor, patch } = this.parseVersion(version);
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Incrementa la versión a una nueva fase del roadmap
   * 
   * Ejemplos:
   * - 1.20.0 -> 1.21.0
   * - 1.20.3 -> 1.21.0
   */
  static nextPhase(version: string): string {
    const { major, minor } = this.parseVersion(version);
    const nextMinor = minor === 0 ? 2 : minor + 1;
    return `${major}.${nextMinor}.0`;
  }
}
