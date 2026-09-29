/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * Suite de Pruebas: AI Vision & Smart Recognition Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  APP_METADATA,
  AIVisionEngine,
  MockVisionProvider,
  ImageSourceType,
  VisionAnalysisStatus,
  VisionDiffStatus,
  FurnitureDetection,
  MaterialDetection,
  DimensionSource,
  AIDesignEngine,
  MockDesignAIProvider,
  DesignContext,
} from '@hbd/shared';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('============================================================');
  console.log('🧪 HBD V9.0.0 — SUITE DE PRUEBAS DE VISIÓN ARTIFICIAL (AI VISION)');
  console.log('============================================================\n');

  // --- 1. Identidad Centralizada, Autoría y Versión 9.0.0 ---
  console.log('--- 1. Identidad Centralizada, Autoría y Versión 9.0.0 ---');
  assert(APP_METADATA.author === 'Adrián Palma', 'Autor oficial es "Adrián Palma"');
  assert(APP_METADATA.version === '9.0.0', 'Versión del sistema es "9.0.0"');
  assert(APP_METADATA.copyrightYear === 2026, 'Año de copyright es 2026');
  assert(
    APP_METADATA.copyright === '© 2026 Adrián Palma — HBD (Home Board Designer)',
    'Cadena de copyright oficial completa y exacta'
  );

  // --- 2. Validación de Archivos e Imágenes ---
  console.log('\n--- 2. Validación de Archivos e Imágenes (AIVisionEngine.validateImageFile) ---');
  const validJpeg = AIVisionEngine.validateImageFile({
    originalFilename: 'living_room_photo.jpg',
    sizeBytes: 3 * 1024 * 1024,
    mimeType: 'image/jpeg',
  });
  assert(validJpeg.isValid, 'Acepta archivo JPG de 3MB');

  const validWebp = AIVisionEngine.validateImageFile({
    originalFilename: 'bedroom_inspiration.webp',
    sizeBytes: 1.5 * 1024 * 1024,
    mimeType: 'image/webp',
  });
  assert(validWebp.isValid, 'Acepta archivo WEBP válido');

  const invalidSize = AIVisionEngine.validateImageFile({
    originalFilename: 'huge_raw.png',
    sizeBytes: 60 * 1024 * 1024, // > 50MB limit
    mimeType: 'image/png',
  });
  assert(!invalidSize.isValid && Boolean(invalidSize.error), 'Rechaza archivo mayor a 50MB con error claro');

  const invalidMime = AIVisionEngine.validateImageFile({
    originalFilename: 'virus.exe',
    sizeBytes: 1024,
    mimeType: 'application/x-msdownload',
  });
  assert(!invalidMime.isValid, 'Rechaza MIME type no permitido');

  // --- 3. Motor de Visión Mock (MockVisionProvider) y Análisis de Imagen ---
  console.log('\n--- 3. MockVisionProvider: Análisis Integral de Imagen y Detección Semántica ---');
  const provider = new MockVisionProvider();
  const analysisResult = await provider.analyzeImage({
    imageId: 'img-test-01',
    filename: 'living_nordic_room.jpg',
    mimeType: 'image/jpeg',
    sourceType: ImageSourceType.ROOM_PHOTO,
    projectId: 'proj-v9-test',
  });

  assert(analysisResult.status === VisionAnalysisStatus.ANALYZED, 'Análisis de imagen completa con estado ANALYZED');
  assert(Boolean(analysisResult.roomDetection), 'Reconoce y clasifica la habitación');
  assert(analysisResult.roomDetection?.roomType === 'LIVING_ROOM', 'Tipo detectado coincide con salón');
  assert((analysisResult.roomDetection?.confidence || 0) > 0.8, 'Confianza de clasificación de habitación > 80%');
  assert(analysisResult.detectedObjects.length >= 2, 'Detecta al menos 2 piezas de mobiliario');
  assert(analysisResult.detectedMaterials.length >= 2, 'Detecta al menos 2 acabados/materiales');
  assert(Boolean(analysisResult.visualPalette), 'Extrae paleta cromática visual');
  assert(analysisResult.visualPalette.dominantColors.length >= 4, 'Paleta contiene al menos 4 colores dominantes');
  assert(Boolean(analysisResult.scaleReference), 'Genera al menos 1 referencia de escala métrica');
  assert(analysisResult.detectedRelations.length >= 1, 'Detecta relaciones espaciales entre objetos');

  // Verificar que las dimensiones detectadas son AI_ESTIMATED
  const sofaDetection = analysisResult.detectedObjects.find((f: FurnitureDetection) => f.category === 'sofas');
  assert(Boolean(sofaDetection), 'Detecta sofá en la escena');
  assert(
    sofaDetection?.estimatedDimensions.source === DimensionSource.AI_ESTIMATED,
    'Las dimensiones del objeto detectado están marcadas estrictamente como AI_ESTIMATED'
  );
  assert(sofaDetection!.boundingBox.width > 0 && sofaDetection!.boundingBox.height > 0, 'Bounding box contiene dimensiones válidas');

  // --- 4. Construcción de VisionContext y Estimación de Escala ---
  console.log('\n--- 4. Construcción de VisionContext y Estimación de Escala Métrica ---');
  const visionContext = AIVisionEngine.buildVisionContext(analysisResult, ImageSourceType.ROOM_PHOTO);
  assert(visionContext.imageId === analysisResult.imageId, 'VisionContext preserva imageId');
  assert(visionContext.sourceType === ImageSourceType.ROOM_PHOTO, 'VisionContext preserva sourceType');
  assert(visionContext.roomType === 'LIVING_ROOM', 'VisionContext preserva roomType detectado');
  assert(visionContext.detectedFurniture?.length === analysisResult.detectedObjects.length, 'VisionContext incluye muebles detectados');
  assert(visionContext.detectedMaterials?.length === analysisResult.detectedMaterials.length, 'VisionContext incluye materiales');

  if (analysisResult.scaleReference) {
    const scaleCalc = AIVisionEngine.estimateScaleFromReference(analysisResult.scaleReference, 420);
    assert(scaleCalc.pixelsPerMeter > 0, 'Calcula ratio pixelsPerMeter a partir de la cota calibrada');
    assert(scaleCalc.confidence > 0.8, 'Preserva alta confianza en calibración métrica');
  }

  // --- 5. Comparador Realidad vs Modelo (VisionDiffEngine / compareWithProject) ---
  console.log('\n--- 5. Comparador Realidad vs Modelo (Vision Diff) ---');
  const mockProjectContext = {
    rooms: [
      { id: 'room-1', name: 'Salón', type: 'LIVING_ROOM' },
    ],
    furniturePlacements: [
      {
        id: 'pl-existing-sofa',
        name: 'Sofá Modular 3 Plazas',
        categorySlug: 'sofas',
        posX: 300,
        posY: 150,
      },
    ],
    walls: [],
  };

  const diffResult = await provider.compareWithProject(
    {
      imageId: 'img-test-01',
      filename: 'living_nordic_room.jpg',
      mimeType: 'image/jpeg',
      projectId: 'proj-v9-test',
    },
    mockProjectContext
  );

  assert(diffResult.items.length > 0, 'Genera comparaciones entre imagen y modelo 3D');
  assert(diffResult.overallMatchScore >= 0 && diffResult.overallMatchScore <= 100, 'Score de coincidencia global normalizado [0, 100]');
  
  const matchItem = diffResult.items.find(c => c.status === VisionDiffStatus.MATCH);
  assert(Boolean(matchItem), 'Identifica pieza coincidente (MATCH) con el sofá existente');
  
  const newItem = diffResult.items.find(c => c.status === VisionDiffStatus.NEW);
  assert(Boolean(newItem), 'Identifica piezas nuevas (NEW) detectadas en la foto pero no en el plano');

  // --- 6. Perfil de Inspiración y Conexión con AI Design (V8) ---
  console.log('\n--- 6. Extracción de Inspiración y Conexión con AI Design (V8) ---');
  const inspiration = await provider.generateInspirationProfile({
    imageId: 'img-inspo-01',
    filename: 'nordic_living_inspiration.jpg',
    mimeType: 'image/jpeg',
  });

  assert(Boolean(inspiration.style), `Detecta estilo de inspiración: "${inspiration.style}"`);
  assert(Boolean(inspiration.atmosphere), `Detecta atmósfera: "${inspiration.atmosphere}"`);
  assert(inspiration.dominantColors.length > 0, 'Extrae paleta de colores de inspiración');
  assert(inspiration.materials.length > 0, 'Sugiere materiales acordes al estilo');

  const v8Preferences = AIVisionEngine.mapVisionContextToDesignPreferences(visionContext);
  assert(Boolean(v8Preferences.style), 'Mapea inspiración a estilo V8');
  assert(Boolean(v8Preferences.atmosphere), 'Mapea inspiración a atmósfera V8');

  // Probar ejecución del motor V8 a partir de la inspiración extraída por V9
  const mockFloor = {
    id: 'floor-v9-living',
    name: 'Planta Principal',
    heightM: 2.70,
    walls: [
      { id: 'w1', startX: 0, startY: 0, endX: 600, endY: 0, thicknessM: 0.20 },
      { id: 'w2', startX: 600, startY: 0, endX: 600, endY: 450, thicknessM: 0.15 },
      { id: 'w3', startX: 600, startY: 450, endX: 0, endY: 450, thicknessM: 0.15 },
      { id: 'w4', startX: 0, startY: 450, endX: 0, endY: 0, thicknessM: 0.20 },
    ],
    rooms: [
      {
        id: 'room-living-01',
        name: 'Salón Comedor',
        type: 'LIVING_ROOM',
        polygon: [
          { x: 0, y: 0 },
          { x: 600, y: 0 },
          { x: 600, y: 450 },
          { x: 0, y: 450 },
        ],
        areaM2: 27.0,
      },
    ],
    furniture: [],
  };

  const mockDesignProvider = new MockDesignAIProvider();
  const v8Context = AIDesignEngine.buildDesignContext({
    project: { id: 'proj-v9', name: 'Proyecto Visión V9' },
    floor: {
      id: 'floor-v9-living',
      name: 'Planta Principal',
      level: 0,
      walls: mockFloor.walls,
      rooms: mockFloor.rooms,
      furniturePlacements: [],
    },
    targetRoomId: 'room-living-01',
    userPreferences: {
      style: v8Preferences.style || 'NORDIC',
      atmosphere: v8Preferences.atmosphere || 'WARM',
      palette: 'NEUTRAL',
      goals: ['MORE_SPACE'],
      budgetLevel: 'MEDIUM',
      numberOfProposals: 2,
    },
  });

  const v8Proposals = await mockDesignProvider.generateDesignProposals(v8Context);
  assert(v8Proposals.length >= 1, 'Motor V8 genera propuestas exitosas a partir de la inspiración de V9');
  assert(Boolean(v8Proposals[0].style), 'Propuesta V8 refleja el estilo detectado por la visión IA');

  // --- 7. Conversión a Mobiliario y Jerarquía de Dimensiones Segura ---
  console.log('\n--- 7. Conversión de Detecciones a Mobiliario y Jerarquía de Dimensiones ---');
  const unconfirmedDetections: FurnitureDetection[] = [
    {
      ...analysisResult.detectedObjects[0],
      isCustomConfirmed: false,
    },
  ];

  const rawPlacements = AIVisionEngine.convertDetectionsToPlacements({
    detections: unconfirmedDetections,
    targetRoom: mockFloor.rooms[0],
  });
  assert(rawPlacements.length === 1, 'Convierte detección sin confirmación');
  assert(
    rawPlacements[0].furniture.dimensionSource === DimensionSource.AI_ESTIMATED,
    'Detección sin ajuste manual conserva estrictamente DimensionSource.AI_ESTIMATED'
  );

  const confirmedDetections: FurnitureDetection[] = [
    {
      ...analysisResult.detectedObjects[0],
      isCustomConfirmed: true,
      estimatedDimensions: {
        widthM: 2.40,
        depthM: 1.00,
        heightM: 0.85,
        source: DimensionSource.USER_CONFIRMED,
      },
    },
  ];

  const confirmedPlacements = AIVisionEngine.convertDetectionsToPlacements({
    detections: confirmedDetections,
    targetRoom: mockFloor.rooms[0],
  });
  assert(confirmedPlacements.length === 1, 'Convierte detección confirmada');
  assert(
    confirmedPlacements[0].furniture.dimensionSource === DimensionSource.USER_CONFIRMED,
    'Las dimensiones editadas y confirmadas por el usuario ascienden estrictamente a USER_CONFIRMED'
  );
  assert(confirmedPlacements[0].widthM === 2.40, 'Aplica la anchura ajustada por el usuario (2.40 m)');

  // --- 8. Resumen Final ---
  console.log('\n============================================================');
  console.log(`📊 RESULTADOS DE PRUEBAS V9: ${passed} PASADAS / ${failed} FALLIDAS`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de las pruebas V9:', err);
  process.exit(1);
});
