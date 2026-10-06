/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Comprehensive System & Geometry Engine Test Suite
 */

import { APP_METADATA, GeometryEngine, WallType } from '@hbd/shared';
import { PlanParserService } from '../services/floorplan/planParser.service.js';
import { ScaleDetectorService } from '../services/floorplan/scaleDetector.service.js';
import { TextDetectorService } from '../services/floorplan/textDetector.service.js';
import { WallDetectorService } from '../services/floorplan/wallDetector.service.js';
import { RoomDetectorService } from '../services/floorplan/roomDetector.service.js';
import { DoorDetectorService } from '../services/floorplan/doorDetector.service.js';
import { WindowDetectorService } from '../services/floorplan/windowDetector.service.js';
import { AnalysisValidatorService } from '../services/floorplan/analysisValidator.service.js';
import { FloorplanEngineService } from '../services/floorplan/floorplanEngine.service.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('🧪 HBD V4.0.0 — SUITE DE PRUEBAS DE SISTEMA & MOTOR DE PLANOS');
  console.log('============================================================\n');

  // --- BLOQUE 1: IDENTIDAD Y AUTORÍA OFICIAL ---
  console.log('--- 1. Identidad Centralizada, Autoría y Versión ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(Boolean(APP_METADATA.version), `Versión del sistema es válida: "${APP_METADATA.version}"`);
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(
    APP_METADATA.copyright.includes('© 2026 Adrián Palma — HBD (Home Board Designer)'),
    'Cadena de copyright oficial completa y exacta'
  );
  assert(
    !APP_METADATA.author.includes('apalma') && !APP_METADATA.author.includes('TCTC'),
    'Sin alias informales en autor del producto'
  );

  // --- BLOQUE 2: MOTOR DE GEOMETRÍA PURO (GeometryEngine) ---
  console.log('\n--- 2. Motor de Geometría & Conversión Métrica ---');

  // Calibración de escala
  // 1000 píxeles = 2.00 metros => 500 px/m
  const scale500 = GeometryEngine.calculateScaleFactor(1000, 2.0);
  assert(scale500 === 500, 'Cálculo de factor de escala: 1000px / 2.0m = 500 px/m');

  // Conversión píxeles a metros
  // 500 píxeles a 500 px/m = 1.00 metro
  const meters1 = GeometryEngine.pixelsToMeters(500, 500);
  assert(meters1 === 1, 'Conversión de píxeles a metros: 500px @ 500px/m = 1.00m');

  // Conversión metros a píxeles
  // 3.5 metros a 100 px/m = 350 píxeles
  const px350 = GeometryEngine.metersToPixels(3.5, 100);
  assert(px350 === 350, 'Conversión de metros a píxeles: 3.5m @ 100px/m = 350px');

  // Distancia Euclidiana
  // Triángulo 3-4-5: (0,0) a (300, 400) => 500px => a 100px/m = 5.00 metros
  const distance = GeometryEngine.calculateDistance({ x: 0, y: 0 }, { x: 300, y: 400 }, 100);
  assert(distance === 5, 'Distancia euclidiana 2D en metros: (0,0) a (300,400) @ 100px/m = 5.00m');

  // Superficie de Polígono (Fórmula de Gauss / Shoelace)
  // Rectángulo 400px x 300px @ 100 px/m (4.0m x 3.0m) = 12.00 m²
  const rectPoly = [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 300 },
    { x: 0, y: 300 },
  ];
  const areaM2 = GeometryEngine.calculatePolygonArea(rectPoly, 100);
  assert(areaM2 === 12, `Cálculo de superficie (Shoelace): 4m x 3m = 12.00 m² (obtenido: ${areaM2} m²)`);

  // Polígono en L (Habitación irregular)
  // Rectángulo base 4m x 4m (16m²) menos muesca de 2m x 2m (4m²) = 12m²
  const lPoly = [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 400 },
    { x: 0, y: 400 },
  ];
  const areaL = GeometryEngine.calculatePolygonArea(lPoly, 100);
  assert(areaL === 12, `Cálculo superficie polígono irregular en L = 12.00 m² (obtenido: ${areaL} m²)`);

  // Ángulos y Snapping
  const angle0 = GeometryEngine.calculateAngle({ x: 0, y: 0 }, { x: 100, y: 0 });
  const angle90 = GeometryEngine.calculateAngle({ x: 0, y: 0 }, { x: 0, y: 100 });
  assert(angle0 === 0, 'Cálculo de ángulo horizontal = 0°');
  assert(angle90 === 90, 'Cálculo de ángulo vertical = 90°');

  const snappedGrid = GeometryEngine.snapPointToGrid({ x: 14, y: 28 }, 10, true);
  assert(snappedGrid.x === 10 && snappedGrid.y === 30, 'Ajuste a rejilla (Grid snap): (14, 28) -> (10, 30)');

  const snappedAngle = GeometryEngine.snapPointToAngle({ x: 0, y: 0 }, { x: 1, y: 99 });
  assert(snappedAngle.x === 0, 'Ajuste angular ortogonal: ~89.4° ajusta a 90° exactos');

  // Intersección de líneas
  const inter = GeometryEngine.checkIntersection(
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
    { x: 100, y: 0 }
  );
  assert(inter.intersects && inter.point?.x === 50 && inter.point?.y === 50, 'Intersección de segmentos en punto (50, 50)');

  // Inclusión de punto en polígono (Ray Casting)
  const isInside = GeometryEngine.isPointInsidePolygon({ x: 200, y: 150 }, rectPoly);
  const isOutside = GeometryEngine.isPointInsidePolygon({ x: 500, y: 500 }, rectPoly);
  assert(isInside && !isOutside, 'Comprobación de punto dentro y fuera de polígono');

  // --- BLOQUE 3: SERVICIOS MODULARES DE ANÁLISIS DE PLANOS ---
  console.log('\n--- 3. Módulos del Pipeline de Interpretación Arquitectónica ---');

  // 1. Parser de documentos
  const parsedDoc = await PlanParserService.parseDocument('sample-plan.pdf', 'plano-vivienda.pdf', 'application/pdf');
  assert(parsedDoc.widthPx > 0 && parsedDoc.heightPx > 0, 'PlanParserService extrae dimensiones y metadatos de PDF');

  // 2. Detector de escala
  const scaleDetectRatio = ScaleDetectorService.detectScale(['Escala 1:50', 'Planta Baja']);
  assert(scaleDetectRatio.method === 'TEXT_RATIO', 'ScaleDetectorService detecta escala textual "1:50"');

  const manualCalib = ScaleDetectorService.calibrateByTwoPoints({ x: 0, y: 0 }, { x: 500, y: 0 }, 2.5);
  assert(manualCalib.scaleFactor === 200, 'Calibración de escala por 2 puntos de referencia (500px = 2.5m => 200 px/m)');

  // 3. Detector de texto / OCR
  const texts = TextDetectorService.extractTextAnnotations(2000, 1500);
  assert(texts.length > 5, `TextDetectorService extrae ${texts.length} anotaciones arquitectónicas`);
  const roomLabels = texts.filter((t) => t.category === 'ROOM_LABEL');
  assert(roomLabels.length >= 4, `Reconoce ${roomLabels.length} etiquetas de estancias (Salón, Cocina, Dormitorio, Baño)`);

  // 4. Detector de paredes
  const walls = WallDetectorService.detectWalls(2000, 1500, 100);
  assert(walls.length >= 8, `WallDetectorService detecta ${walls.length} paredes`);
  const extWalls = walls.filter((w) => w.wallType === WallType.EXTERIOR);
  assert(extWalls.length === 4, 'Clasifica 4 muros perimetrales exteriores');

  // 5. Detector de habitaciones
  const rooms = RoomDetectorService.detectRooms(2000, 1500, 100, texts);
  assert(rooms.length >= 5, `RoomDetectorService genera ${rooms.length} habitaciones cerradas`);
  const totalArea = rooms.reduce((acc, r) => acc + r.areaM2, 0);
  assert(totalArea > 30, `Superficie total residencial calculada: ${totalArea.toFixed(1)} m²`);

  // 6. Detector de puertas y ventanas
  const doors = DoorDetectorService.detectDoors(walls, 2000, 1500);
  assert(doors.length >= 5, `DoorDetectorService detecta ${doors.length} puertas con abatimiento`);

  const windows = WindowDetectorService.detectWindows(walls, 2000, 1500);
  assert(windows.length >= 4, `WindowDetectorService detecta ${windows.length} ventanas exteriores`);

  // 7. Validador y Niveles de Confianza
  const validation = AnalysisValidatorService.validateAnalysis(walls, rooms, doors, windows, true);
  assert(validation.isValid, 'AnalysisValidatorService declara el plano como geométricamente válido');
  assert(
    validation.confidenceBreakdown.high > 0 && validation.confidenceBreakdown.total > 20,
    `Desglose de confianza: ${validation.confidenceBreakdown.high} Alta, ${validation.confidenceBreakdown.medium} Media, ${validation.confidenceBreakdown.low} Baja (Total: ${validation.confidenceBreakdown.total})`
  );

  // 8. Pipeline Maestro End-to-End
  const fullAnalysis = await FloorplanEngineService.analyzePlan(
    'test-plan.png',
    'plano-vivienda.png',
    'image/png'
  );
  assert(fullAnalysis.walls.length > 0, 'FloorplanEngineService pipeline completo genera paredes');
  assert(fullAnalysis.rooms.length > 0, 'FloorplanEngineService pipeline completo genera habitaciones');
  assert(fullAnalysis.validation.score >= 80, `Puntuación de validación del pipeline: ${fullAnalysis.validation.score}%`);

  // --- RESUMEN FINAL ---
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS: ${passed} pruebas superadas, ${failed} fallos.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
