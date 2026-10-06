/**
 * HBD — HOME BOARD DESIGNER
 * Security Infrastructure & Vision Cone Engine (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  TechnicalElementDto
} from '../types/technicalInfrastructure.types.js';

export interface SecurityCameraCone {
  cameraId: string;
  cameraCode: string;
  origin: { x: number; y: number; z: number };
  fovDegrees: number;
  rangeMeters: number;
  rotationDegrees: number;
  polygonPoints: { x: number; y: number }[];
}

export interface SecurityCoverageReport {
  totalCameras: number;
  totalMotionSensors: number;
  totalAlarms: number;
  cameraCones: SecurityCameraCone[];
  accessPointsCovered: number;
  totalAccessPoints: number;
  coverageRatio: number;
  recommendations: string[];
}

export class SecurityInfrastructureEngine {
  /**
   * Calcula los polígonos de cono de visión para cámaras y analiza la cobertura de seguridad
   */
  public static analyzeSecurity(
    elements: TechnicalElementDto[],
    accessPointsCount: number = 2
  ): SecurityCoverageReport {
    const cameras = elements.filter(
      (e) => e.category === 'SECURITY' && (e.cameraFovDegrees || e.name.toLowerCase().includes('cámara') || e.name.toLowerCase().includes('camara'))
    );

    const motionSensors = elements.filter(
      (e) => e.category === 'SECURITY' && (e.name.toLowerCase().includes('pir') || e.name.toLowerCase().includes('movimiento'))
    );

    const alarms = elements.filter(
      (e) => e.category === 'SECURITY' && (e.name.toLowerCase().includes('alarma') || e.name.toLowerCase().includes('sirena') || e.name.toLowerCase().includes('teclado'))
    );

    const cameraCones: SecurityCameraCone[] = [];

    for (const cam of cameras) {
      const fov = cam.cameraFovDegrees ?? 100;
      const range = cam.cameraRangeMeters ?? 8.0;
      const rotDeg = cam.rotation ?? 0;

      const halfFovRad = ((fov / 2) * Math.PI) / 180;
      const centerAngleRad = (rotDeg * Math.PI) / 180;

      const angleLeft = centerAngleRad - halfFovRad;
      const angleRight = centerAngleRad + halfFovRad;

      const p0 = { x: cam.position.x, y: cam.position.y };
      const p1 = {
        x: Math.round((p0.x + range * Math.cos(angleLeft)) * 100) / 100,
        y: Math.round((p0.y + range * Math.sin(angleLeft)) * 100) / 100
      };
      const p2 = {
        x: Math.round((p0.x + range * Math.cos(centerAngleRad)) * 100) / 100,
        y: Math.round((p0.y + range * Math.sin(centerAngleRad)) * 100) / 100
      };
      const p3 = {
        x: Math.round((p0.x + range * Math.cos(angleRight)) * 100) / 100,
        y: Math.round((p0.y + range * Math.sin(angleRight)) * 100) / 100
      };

      cameraCones.push({
        cameraId: cam.id,
        cameraCode: cam.code || cam.name,
        origin: cam.position,
        fovDegrees: fov,
        rangeMeters: range,
        rotationDegrees: rotDeg,
        polygonPoints: [p0, p1, p2, p3]
      });
    }

    const covered = Math.min(accessPointsCount, cameras.length + motionSensors.length);
    const coverageRatio = accessPointsCount > 0 ? Math.round((covered / accessPointsCount) * 100) : 100;

    const recommendations: string[] = [];
    if (cameras.length === 0 && motionSensors.length === 0) {
      recommendations.push('No se han definido dispositivos de seguridad o detección volumétrica.');
    } else if (coverageRatio < 100) {
      recommendations.push('Existen accesos perimetrales sin cobertura directa por sensor o cámara.');
    }

    return {
      totalCameras: cameras.length,
      totalMotionSensors: motionSensors.length,
      totalAlarms: alarms.length,
      cameraCones,
      accessPointsCovered: covered,
      totalAccessPoints: accessPointsCount,
      coverageRatio,
      recommendations
    };
  }
}
