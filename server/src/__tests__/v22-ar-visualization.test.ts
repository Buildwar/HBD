/**
 * HBD — TEST SUITE FASE V22 / 1.22.0
 * AR / REAL SPACE VISUALIZATION
 * 
 * Batería de pruebas automatizadas para la visualización en realidad aumentada y espacio real:
 * - ARCapabilityEngine: Detección de WebXR, sensores de cámara, giroscopio y modos de respaldo.
 * - ARCalibrationEngine: Calibración métrica con referencias físicas estándar y factores de conversión pixel/metro.
 * - ARAnchorEngine: Anclaje espacial 3D, ajuste a planos (suelo, pared, techo) y detección de colisiones.
 * - ARMeasurementEngine: Mediciones punto a punto en el espacio real, calidad y verificación de holgura.
 * - ARComparisonEngine: Modos comparativos Antes/Después (slider dividido, superposición de opacidad).
 * - ARVisualizationEngine: Fachada maestra de gestión de escenas AR, anclajes e instantáneas.
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ARVisualizationEngine,
  ARCapabilityEngine,
  ARCalibrationEngine,
  ARAnchorEngine,
  ARMeasurementEngine,
  ARComparisonEngine,
  STANDARD_REFERENCE_DIMENSIONS,
  ARAnchorItem,
  ARSceneConfig,
} from '@hbd/shared';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('🧪 HBD — TEST SUITE FASE V22 / 1.22.0: AR / REAL SPACE VISUALIZATION');
console.log('============================================================\n');

// -------------------------------------------------------------
// 1. ARCapabilityEngine: Diagnóstico de capacidades y fallbacks
// -------------------------------------------------------------
console.log('--- 1. ARCapabilityEngine (Detección de Hardware & Modos) ---');

const webxrResult = ARCapabilityEngine.evaluateCapabilities({
  hasWebXR: true,
  hasImmersiveAR: true,
  hasHitTest: true,
  hasCamera: true,
});
assert(webxrResult.isSupported === true, 'WebXR inmersivo detectado como compatible');
assert(webxrResult.recommendedMode === 'WEBXR_IMMERSIVE', 'Modo recomendado es WEBXR_IMMERSIVE');
assert(webxrResult.availableCapabilities.includes('HIT_TEST_SUPPORTED'), 'Soporta prueba de impacto (hit-test)');

const trackedResult = ARCapabilityEngine.evaluateCapabilities({
  hasWebXR: false,
  hasCamera: true,
  hasGyroscope: true,
});
assert(trackedResult.recommendedMode === 'CAMERA_TRACKED', 'Fallback correcto a CAMERA_TRACKED con cámara y giroscopio');

const photoResult = ARCapabilityEngine.evaluateCapabilities({
  hasCamera: true,
});
assert(photoResult.recommendedMode === 'PHOTO_AR', 'Fallback correcto a PHOTO_AR con cámara estática');

const previewResult = ARCapabilityEngine.evaluateCapabilities({});
assert(previewResult.recommendedMode === 'AR_PREVIEW', 'Fallback a AR_PREVIEW cuando no hay sensores de hardware');
assert(previewResult.isSupported === false, 'isSupported es false en modo simulador');


// -------------------------------------------------------------
// 2. ARCalibrationEngine: Calibración métrica y marcadores
// -------------------------------------------------------------
console.log('\n--- 2. ARCalibrationEngine (Calibración Métrica de Escala) ---');

// Calibración con puerta estándar (2.03m)
const doorCal = ARCalibrationEngine.calibrateFromReference('DOOR_STANDARD', 406);
assert(doorCal.isValid === true, 'Calibración con puerta estándar válida');
assert(Math.abs(doorCal.scaleFactor - 0.005) < 0.0001, 'Factor de escala 1 px = 0.005 m (5 mm/px)');
assert(doorCal.quality === 'HIGH', 'Calidad de calibración de puerta es HIGH');
assert(doorCal.confidence >= 0.9, 'Confianza de puerta estándar >= 90%');

// Calibración con hoja A4 estándar (29.7cm)
const a4Cal = ARCalibrationEngine.calibrateFromReference('A4_PAPER_MARKER', 100);
assert(a4Cal.isValid === true, 'Calibración con marcador A4 válida');
assert(Math.abs(a4Cal.scaleFactor - 0.00297) < 0.00001, 'Factor de escala A4 exacto (0.00297 m/px)');

// Conversión bidireccional píxeles <-> metros
const scaleFactor = 0.01; // 1px = 1cm
assert(ARCalibrationEngine.pixelsToMeters(250, scaleFactor) === 2.5, '250 px a escala 0.01 = 2.5 m');
assert(ARCalibrationEngine.metersToPixels(2.5, scaleFactor) === 250, '2.5 m a escala 0.01 = 250 px');

// Creación de ítem de referencia
const refItem = ARCalibrationEngine.createReferenceItem('WINDOW_STANDARD', 1.2, 240, 'Ventana Salón');
assert(refItem.type === 'WINDOW_STANDARD', 'Tipo de referencia asignado correctamente');
assert(refItem.knownRealSizeMeters === 1.2, 'Dimensión real conocida guardada');
assert(refItem.calibrationRatioMetersPerPixel !== undefined, 'Ratio de calibración calculado y asignado');


// -------------------------------------------------------------
// 3. ARAnchorEngine: Anclaje 3D, ajuste a superficies y colisiones
// -------------------------------------------------------------
console.log('\n--- 3. ARAnchorEngine (Anclajes 3D & Detección de Colisiones) ---');

// Ajuste a suelo FLOOR (Y=0)
const floorSnap = ARAnchorEngine.snapToSurface({ x: 1.2, y: 0.8, z: -1.5 }, 'FLOOR');
assert(floorSnap.y === 0, 'Anclaje en FLOOR ajusta coordenada Y a 0');
assert(floorSnap.x === 1.2 && floorSnap.z === -1.5, 'Coordenadas X y Z se mantienen intactas');

// Ajuste a techo CEILING (Y >= 2.4)
const ceilingSnap = ARAnchorEngine.snapToSurface({ x: 0, y: 1.0, z: 0 }, 'CEILING');
assert(ceilingSnap.y >= 2.4, 'Anclaje en CEILING respeta altura mínima de techo');

// Cálculo de distancia euclidiana 3D
const dist = ARAnchorEngine.calculateDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 });
assert(dist === 5, 'Distancia euclidiana 3D (3, 4, 0) = 5.0 m');

// Detección de colisiones y superposiciones de cajas
const testAnchors: ARAnchorItem[] = [
  {
    id: 'anc_1',
    targetType: 'FURNITURE',
    name: 'Sofá KIVIK',
    surfaceType: 'FLOOR',
    position: { x: 0, y: 0, z: 0 },
    rotation: { pitch: 0, yaw: 0, roll: 0 },
    scale: { x: 2.2, y: 0.8, z: 1.0 },
    isConfirmed: true,
    provenance: 'RETAIL_IMPORTED_GLTF',
  },
  {
    id: 'anc_2',
    targetType: 'FURNITURE',
    name: 'Mesa Solapada',
    surfaceType: 'FLOOR',
    position: { x: 0.5, y: 0, z: 0 }, // Solapa con Sofá KIVIK
    rotation: { pitch: 0, yaw: 0, roll: 0 },
    scale: { x: 1.0, y: 0.5, z: 0.8 },
    isConfirmed: false,
    provenance: 'PARAMETRIC_GENERATED',
  },
  {
    id: 'anc_3',
    targetType: 'TECHNICAL_ELEMENT',
    name: 'Punto de Acceso WiFi',
    surfaceType: 'CEILING',
    position: { x: 4.0, y: 2.5, z: 4.0 }, // Libre de colisiones
    rotation: { pitch: 0, yaw: 0, roll: 0 },
    scale: { x: 0.2, y: 0.05, z: 0.2 },
    isConfirmed: true,
    provenance: 'PARAMETRIC_GENERATED',
  },
];

const colValidation = ARAnchorEngine.validateCollisions(testAnchors);
assert(colValidation.hasCollisions === true, 'Detecta colisión entre elementos superpuestos');
assert(colValidation.conflictingAnchors.includes('anc_1'), 'anc_1 marcado en colisión');
assert(colValidation.conflictingAnchors.includes('anc_2'), 'anc_2 marcado en colisión');
assert(!colValidation.conflictingAnchors.includes('anc_3'), 'anc_3 sin colisión');

// Violación de límites de habitación
const outAnchor: ARAnchorItem = {
  id: 'anc_out',
  targetType: 'FURNITURE',
  name: 'Armario Exterior',
  surfaceType: 'FLOOR',
  position: { x: 8.0, y: 0, z: 0 },
  rotation: { pitch: 0, yaw: 0, roll: 0 },
  scale: { x: 1.0, y: 2.0, z: 0.6 },
  isConfirmed: false,
  provenance: 'PARAMETRIC_GENERATED',
};
const roomBounds = { minX: -3, maxX: 3, minZ: -3, maxZ: 3, height: 2.6 };
const boundValidation = ARAnchorEngine.validateCollisions([outAnchor], roomBounds);
assert(boundValidation.hasCollisions === true, 'Detecta elemento fuera de los límites de la habitación');
assert(boundValidation.wallViolations.includes('anc_out'), 'anc_out marcado en wallViolations');


// -------------------------------------------------------------
// 4. ARMeasurementEngine: Mediciones en espacio real y holguras
// -------------------------------------------------------------
console.log('\n--- 4. ARMeasurementEngine (Mediciones en Espacio Real & Holguras) ---');

const meas = ARMeasurementEngine.createMeasurement(
  { x: 0, y: 0, z: 0 },
  { x: 2.6, y: 0, z: 0 },
  'FLOOR',
  0.9,
  'Hueco pared salón'
);
assert(meas.distanceMeters === 2.6, 'Distancia medida es 2.6 m');
assert(meas.quality === 'HIGH', 'Calidad de medición es HIGH (confianza >= 85%)');
assert(meas.label === 'Hueco pared salón', 'Etiqueta de medición asignada');

// Formato de unidades legibles
assert(ARMeasurementEngine.formatDistance(0.65) === '65 cm', 'Formato 0.65 m -> 65 cm');
assert(ARMeasurementEngine.formatDistance(2.40) === '2.40 m', 'Formato 2.40 m -> 2.40 m');

// Comprobación de cabida / holgura
const fitOk = ARMeasurementEngine.checkFitsInMeasuredSpace(2.6, 2.2);
assert(fitOk.fits === true, 'Mueble de 2.2m cabe holgadamente en espacio medido de 2.6m');
assert(fitOk.differenceMeters === 0.4, 'Diferencia de holgura positiva (+40 cm)');

const fitNo = ARMeasurementEngine.checkFitsInMeasuredSpace(1.8, 2.2);
assert(fitNo.fits === false, 'Mueble de 2.2m NO cabe en espacio medido de 1.8m');
assert(fitNo.differenceMeters === -0.4, 'Diferencia de holgura negativa (-40 cm)');


// -------------------------------------------------------------
// 5. ARComparisonEngine: Modos comparativos y deslizadores
// -------------------------------------------------------------
console.log('\n--- 5. ARComparisonEngine (Comparativa Antes / Después) ---');

const baseConfig = ARComparisonEngine.createDefaultConfig();
assert(baseConfig.mode === 'BEFORE_AFTER_SLIDER', 'Modo comparativo por defecto es BEFORE_AFTER_SLIDER');
assert(baseConfig.sliderPosition === 50, 'Posición inicial del deslizador es 50%');

const clampedSlider = ARComparisonEngine.updateSliderPosition(baseConfig, 140);
assert(clampedSlider.sliderPosition === 100, 'Deslizador acotado al máximo de 100%');

const clampedOpacity = ARComparisonEngine.updateOpacity(baseConfig, -0.5);
assert(clampedOpacity.overlayOpacity === 0.0, 'Opacidad acotada al mínimo de 0.0');

const checkIncomplete = ARComparisonEngine.validateComparisonReadiness(baseConfig);
assert(checkIncomplete.isReady === false, 'Comparativa no lista sin URLs de fotos');

const readyConfig = ARComparisonEngine.createDefaultConfig({
  realSpaceImageUrl: 'https://cdn.hbd.app/real.jpg',
  renderedSceneImageUrl: 'https://cdn.hbd.app/render.jpg',
});
const checkComplete = ARComparisonEngine.validateComparisonReadiness(readyConfig);
assert(checkComplete.isReady === true, 'Comparativa lista cuando ambas imágenes están disponibles');


// -------------------------------------------------------------
// 6. ARVisualizationEngine: Fachada Maestra
// -------------------------------------------------------------
console.log('\n--- 6. ARVisualizationEngine (Fachada Maestra de Escena AR) ---');

const scene = ARVisualizationEngine.createScene('proj_123', 'Escena AR Salón');
assert(scene.projectId === 'proj_123', 'Escena creada vinculada al proyecto');
assert(scene.name === 'Escena AR Salón', 'Nombre de escena asignado');
assert(scene.mode === 'AR_PREVIEW', 'Modo inicial asignado');

// Añadir anclaje con validación
const { scene: sceneWithAnchor, collisions } = ARVisualizationEngine.addAnchor(scene, testAnchors[0]);
assert(sceneWithAnchor.anchors.length === 1, 'Anclaje añadido a la escena');
assert(collisions.hasCollisions === false, 'Sin colisiones en primer anclaje');

// Calibrar escena y adjuntar medición
const { scene: calScene, calibration } = ARVisualizationEngine.calibrateScene(
  sceneWithAnchor,
  'DOOR_STANDARD',
  406
);
assert(calibration.isValid === true, 'Calibración ejecutada a través de la fachada');
assert(calScene.references.length === 1, 'Referencia de escala almacenada en la escena');

const { scene: finalScene, measurement } = ARVisualizationEngine.addMeasurement(
  calScene,
  { x: 0, y: 0, z: 0 },
  { x: 2.0, y: 0, z: 0 },
  'FLOOR',
  'Distancia frontal'
);
assert(finalScene.measurements.length === 1, 'Medición registrada en la escena');
assert(measurement.distanceMeters === 2.0, 'Distancia de medición verificada');

// Resumen final
console.log('\n============================================================');
console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
