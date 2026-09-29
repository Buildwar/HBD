/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * Mock Vision Provider — Motor de Visión Artificial Determinista y Heurístico
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  VisionProvider,
  VisionProviderConfig,
  ImageInputData,
  VisionAnalysisResult,
  FurnitureDetection,
  MaterialDetection,
  VisualPalette,
  RoomDetection,
  SpatialRelation,
  VisionDiffResult,
  VisionDiffItem,
  InspirationProfile,
} from '../types/aiVision.types.js';
import { DimensionSource } from '../types/furniture.types.js';

export class MockVisionProvider implements VisionProvider {
  getProviderConfig(): VisionProviderConfig {
    return {
      providerName: 'mock',
      isConfigured: true,
      isMockMode: true,
      availableModels: ['hbd-vision-heuristics-v9', 'hbd-semantic-segmentation-v1'],
      activeModel: 'hbd-vision-heuristics-v9',
      supportsImageVision: true,
      rateLimitPerMinute: 120,
    };
  }

  async analyzeImage(input: ImageInputData): Promise<VisionAnalysisResult> {
    const filename = (input.filename || '').toLowerCase();
    const isKitchen = filename.includes('cocina') || filename.includes('kitchen');
    const isBedroom = filename.includes('dormitorio') || filename.includes('bed') || filename.includes('habitacion');
    const isBathroom = filename.includes('baño') || filename.includes('bath');

    // 1. Detección de Tipo de Habitación
    const roomDetection: RoomDetection = isKitchen
      ? { roomType: 'KITCHEN', label: 'Cocina Residencial', confidence: 0.94, architecturalFeatures: ['Encimera lineal', 'Campana extractora', 'Vano de ventilación'] }
      : isBedroom
      ? { roomType: 'BEDROOM', label: 'Dormitorio Principal', confidence: 0.92, architecturalFeatures: ['Paramento para cabecero', 'Ventana lateral orientada a luz natural'] }
      : isBathroom
      ? { roomType: 'BATHROOM', label: 'Baño Completo', confidence: 0.89, architecturalFeatures: ['Zona húmeda alicatada', 'Sanitarios compactos'] }
      : { roomType: 'LIVING_ROOM', label: 'Salón Comedor Principal', confidence: 0.96, architecturalFeatures: ['Gran ventanal frontal', 'Paramento principal de TV', 'Distribución abierta'] };

    // 2. Detección de Objetos y Mobiliario
    const detectedObjects: FurnitureDetection[] = isKitchen
      ? [
          {
            id: 'det-kit-island',
            category: 'kitchen_islands',
            label: 'Isla de Cocina con Barra',
            confidence: 0.93,
            boundingBox: { x: 0.25, y: 0.40, width: 0.50, height: 0.35 },
            estimatedDimensions: { widthM: 1.80, depthM: 0.90, heightM: 0.90, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#e5e7eb', colorName: 'Blanco perla', materialType: 'Cuarzo y Madera', style: 'Moderno' },
            isNewFurniture: true,
          },
          {
            id: 'det-kit-stools',
            category: 'stools',
            label: 'Taburetes Altos (Set 2)',
            confidence: 0.88,
            boundingBox: { x: 0.28, y: 0.55, width: 0.20, height: 0.25 },
            estimatedDimensions: { widthM: 0.45, depthM: 0.45, heightM: 0.75, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#1f2937', colorName: 'Negro antracita', materialType: 'Metal y Cuero' },
            isNewFurniture: true,
          },
        ]
      : isBedroom
      ? [
          {
            id: 'det-bed-double',
            category: 'beds',
            label: 'Cama Doble Queen Size',
            confidence: 0.95,
            boundingBox: { x: 0.20, y: 0.30, width: 0.60, height: 0.50 },
            estimatedDimensions: { widthM: 1.60, depthM: 2.00, heightM: 1.05, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#f3f4f6', colorName: 'Gris perla suave', materialType: 'Tejido tapizado y Roble', style: 'Nórdico' },
            isNewFurniture: true,
          },
          {
            id: 'det-nightstand-left',
            category: 'nightstands',
            label: 'Mesita de Noche Izquierda',
            confidence: 0.89,
            boundingBox: { x: 0.10, y: 0.50, width: 0.15, height: 0.25 },
            estimatedDimensions: { widthM: 0.45, depthM: 0.40, heightM: 0.50, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#d97706', colorName: 'Madera de roble natural', materialType: 'Madera maciza' },
            isNewFurniture: true,
          },
          {
            id: 'det-nightstand-right',
            category: 'nightstands',
            label: 'Mesita de Noche Derecha',
            confidence: 0.87,
            boundingBox: { x: 0.75, y: 0.50, width: 0.15, height: 0.25 },
            estimatedDimensions: { widthM: 0.45, depthM: 0.40, heightM: 0.50, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#d97706', colorName: 'Madera de roble natural', materialType: 'Madera maciza' },
            isNewFurniture: true,
          },
        ]
      : [
          {
            id: 'det-sofa-main',
            category: 'sofas',
            label: 'Sofá Modular 3 Plazas',
            confidence: 0.96,
            boundingBox: { x: 0.15, y: 0.35, width: 0.55, height: 0.40 },
            estimatedDimensions: { widthM: 2.30, depthM: 0.95, heightM: 0.85, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#4b5563', colorName: 'Gris marengo', materialType: 'Lino texturado', style: 'Contemporáneo' },
            isNewFurniture: true,
          },
          {
            id: 'det-coffee-table',
            category: 'coffee_tables',
            label: 'Mesa de Centro Orgánica',
            confidence: 0.91,
            boundingBox: { x: 0.35, y: 0.60, width: 0.30, height: 0.20 },
            estimatedDimensions: { widthM: 1.10, depthM: 0.60, heightM: 0.42, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#b45309', colorName: 'Roble aceitado', materialType: 'Madera y Metal negro' },
            isNewFurniture: true,
          },
          {
            id: 'det-tv-stand',
            category: 'tv_units',
            label: 'Mueble Bajo de TV Flotante',
            confidence: 0.93,
            boundingBox: { x: 0.15, y: 0.10, width: 0.70, height: 0.20 },
            estimatedDimensions: { widthM: 2.00, depthM: 0.40, heightM: 0.45, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#1f2937', colorName: 'Negro mate con listones', materialType: 'DM lacado y Roble' },
            isNewFurniture: true,
          },
          {
            id: 'det-rug-living',
            category: 'rugs',
            label: 'Alfombra de Lana de Pelo Corto',
            confidence: 0.89,
            boundingBox: { x: 0.10, y: 0.45, width: 0.80, height: 0.45 },
            estimatedDimensions: { widthM: 2.80, depthM: 2.00, heightM: 0.02, source: DimensionSource.AI_ESTIMATED },
            visualProperties: { colorHex: '#e5e7eb', colorName: 'Beige arena con trazos geométricos', materialType: 'Lana natural' },
            isNewFurniture: true,
          },
        ];

    // 3. Detección de Materiales Predominantes
    const detectedMaterials: MaterialDetection[] = [
      { id: 'mat-wood-oak', materialType: 'Madera Natural', label: 'Roble Claro Tratado', confidence: 0.92, region: 'Suelo y carpinterías', dominantColorHex: '#d97706', roughness: 0.4, metalness: 0.0 },
      { id: 'mat-fabric-linen', materialType: 'Tejido Tapicería', label: 'Lino y Algodón Neutro', confidence: 0.90, region: 'Mobiliario tapizado', dominantColorHex: '#6b7280', roughness: 0.9, metalness: 0.0 },
      { id: 'mat-glass-clear', materialType: 'Vidrio / Cristal', label: 'Vidrio Laminado Transparente', confidence: 0.95, region: 'Vanos exteriores', dominantColorHex: '#f9fafb', roughness: 0.1, metalness: 0.1 },
      { id: 'mat-metal-black', materialType: 'Metal Lacado', label: 'Aluminio Negro Mate', confidence: 0.88, region: 'Perfilerías y luminarias', dominantColorHex: '#111827', roughness: 0.3, metalness: 0.8 },
      { id: 'mat-paint-walls', materialType: 'Pintura Mineral', label: 'Blanco Roto Satinado', confidence: 0.96, region: 'Paramentos verticales', dominantColorHex: '#fcfbf7', roughness: 0.7, metalness: 0.0 },
    ];

    // 4. Paleta Cromática Extraída
    const visualPalette: VisualPalette = {
      dominantColors: ['#fcfbf7', '#d97706', '#4b5563', '#111827', '#e5e7eb'],
      primary: '#fcfbf7',
      secondary: '#4b5563',
      accent: '#d97706',
      neutral: '#e5e7eb',
      dark: '#111827',
      light: '#ffffff',
      wallColors: ['#fcfbf7', '#f3f4f6'],
      furnitureColors: ['#4b5563', '#b45309', '#1f2937'],
      floorColors: ['#d97706', '#92400e'],
      accentColors: ['#f59e0b', '#10b981'],
    };

    // 5. Relaciones Espaciales Estructuradas
    const detectedRelations: SpatialRelation[] = isBedroom
      ? [
          { id: 'rel-1', sourceEntityId: 'det-bed-double', sourceLabel: 'Cama Doble', relation: 'AGAINST_WALL', targetEntityId: 'wall-north', targetLabel: 'Pared Cabecero', confidence: 0.94 },
          { id: 'rel-2', sourceEntityId: 'det-nightstand-left', sourceLabel: 'Mesita Izquierda', relation: 'NEXT_TO', targetEntityId: 'det-bed-double', targetLabel: 'Cama Doble', confidence: 0.91 },
          { id: 'rel-3', sourceEntityId: 'det-nightstand-right', sourceLabel: 'Mesita Derecha', relation: 'NEXT_TO', targetEntityId: 'det-bed-double', targetLabel: 'Cama Doble', confidence: 0.90 },
        ]
      : [
          { id: 'rel-1', sourceEntityId: 'det-coffee-table', sourceLabel: 'Mesa de Centro', relation: 'IN_FRONT_OF', targetEntityId: 'det-sofa-main', targetLabel: 'Sofá Modular', confidence: 0.95 },
          { id: 'rel-2', sourceEntityId: 'det-sofa-main', sourceLabel: 'Sofá Modular', relation: 'IN_FRONT_OF', targetEntityId: 'det-tv-stand', targetLabel: 'Mueble de TV', confidence: 0.92 },
          { id: 'rel-3', sourceEntityId: 'det-rug-living', sourceLabel: 'Alfombra', relation: 'UNDER', targetEntityId: 'det-coffee-table', targetLabel: 'Mesa de Centro', confidence: 0.96 },
        ];

    // 6. Perfil de Inspiración para alimentar V8
    const inspirationProfile: InspirationProfile = {
      style: isBedroom ? 'Nórdico Cálido' : 'Contemporáneo Mediterráneo',
      styleConfidence: 0.91,
      atmosphere: 'Luminosa y Serenidad Orgánica',
      dominantColors: visualPalette.dominantColors,
      visualPalette,
      materials: detectedMaterials,
      lightingMood: 'Luz natural rasante potenciada con iluminación cálida indirecta a 3000K',
      generalVibe: 'Ambiente espacioso, depurado y con calidez material equilibrada',
      keyHighlights: [
        'Excelente aprovechamiento de la luz natural mediante paramentos reflectivos claros.',
        'Contraste armónico entre madera cálida y detalles metálicos oscuros.',
        'Zonas de circulación despejadas con mobiliario dimensionado ergonómicamente.',
      ],
    };

    const aiRoomBrief = `Análisis visual completado con éxito para ${roomDetection.label}. Se detectaron ${detectedObjects.length} elementos de mobiliario clave, ${detectedMaterials.length} materiales estructurados y una paleta cromática equilibrada de base ${visualPalette.primary} con acentos en ${visualPalette.accent}.`;

    return {
      id: `vis-ana-${Date.now()}`,
      imageId: input.imageId || `img-${Date.now()}`,
      provider: 'mock-vision',
      isMock: true,
      status: 'ANALYZED',
      confidenceScore: 0.93,
      roomDetection,
      detectedObjects,
      detectedMaterials,
      visualPalette,
      detectedRelations,
      scaleReference: {
        id: 'scale-ref-1',
        objectLabel: isBedroom ? 'Cama Doble Queen (Ancho 1.60m)' : 'Sofá Modular 3 Plazas (Ancho 2.30m)',
        realDimensionM: isBedroom ? 1.60 : 2.30,
        dimensionType: 'WIDTH',
        confidence: 0.94,
        pixelSpan: 420,
      },
      inspirationProfile,
      aiRoomBrief,
      summary: aiRoomBrief,
      createdAt: new Date().toISOString(),
      analyzedAt: new Date().toISOString(),
    };
  }

  async detectObjects(input: ImageInputData): Promise<FurnitureDetection[]> {
    const analysis = await this.analyzeImage(input);
    return analysis.detectedObjects;
  }

  async detectMaterials(input: ImageInputData): Promise<MaterialDetection[]> {
    const analysis = await this.analyzeImage(input);
    return analysis.detectedMaterials;
  }

  async compareWithProject(
    input: ImageInputData,
    projectContext: {
      rooms: any[];
      furniturePlacements: any[];
      walls: any[];
    }
  ): Promise<VisionDiffResult> {
    const analysis = await this.analyzeImage(input);
    const diffItems: VisionDiffItem[] = [];

    const existingPlacements = projectContext.furniturePlacements || [];

    // 1. Comparar detecciones visuales contra elementos del modelo del proyecto
    for (const det of analysis.detectedObjects) {
      const match = existingPlacements.find((p: any) => {
        const pName = (p.furniture?.name || p.name || '').toLowerCase();
        const detName = det.label.toLowerCase();
        const pCat = (p.furniture?.category?.slug || p.categorySlug || '').toLowerCase();
        const detCat = det.category.toLowerCase();
        return pCat === detCat || pName.includes(detCat) || detName.includes(pCat);
      });

      if (match) {
        diffItems.push({
          category: det.category,
          name: det.label,
          status: 'MATCH',
          matchConfidence: 0.92,
          projectPlacementId: match.id,
          visionDetectionId: det.id,
          message: `Coincidencia visual confirmada con el objeto del proyecto "${match.furniture?.name || match.name}".`,
        });
      } else {
        diffItems.push({
          category: det.category,
          name: det.label,
          status: 'NEW',
          matchConfidence: 0.88,
          visionDetectionId: det.id,
          message: `Elemento detectado en la imagen pero no presente en el modelo 2D/3D actual.`,
        });
      }
    }

    // 2. Comprobar muebles del proyecto que no se han detectado en la foto
    for (const p of existingPlacements) {
      const pCat = (p.furniture?.category?.slug || p.categorySlug || '').toLowerCase();
      const matched = diffItems.some((d) => d.projectPlacementId === p.id);
      if (!matched) {
        diffItems.push({
          category: pCat || 'general',
          name: p.furniture?.name || p.name || 'Mueble del Proyecto',
          status: 'MISSING',
          projectPlacementId: p.id,
          message: `Presente en el plano/modelo 3D pero no visible o identificado en la fotografía.`,
        });
      }
    }

    const matchCount = diffItems.filter((i) => i.status === 'MATCH').length;
    const totalCount = Math.max(diffItems.length, 1);
    const overallMatchScore = Math.round((matchCount / totalCount) * 100);

    return {
      projectId: input.projectId || 'proj-default',
      floorId: input.floorId,
      roomId: input.roomId,
      imageId: input.imageId || `img-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: diffItems,
      overallMatchScore,
      summary: `Comparativa completada: ${matchCount} elementos coincidentes, ${diffItems.filter((i) => i.status === 'NEW').length} elementos nuevos en foto y ${diffItems.filter((i) => i.status === 'MISSING').length} elementos no visibles.`,
    };
  }

  async generateInspirationProfile(input: ImageInputData): Promise<InspirationProfile> {
    const analysis = await this.analyzeImage(input);
    return (
      analysis.inspirationProfile || {
        style: 'Moderno Neutro',
        styleConfidence: 0.85,
        atmosphere: 'Luminosa',
        dominantColors: ['#ffffff', '#e5e7eb', '#1f2937'],
        visualPalette: analysis.visualPalette,
        materials: analysis.detectedMaterials,
        lightingMood: 'Luz diurna',
        generalVibe: 'Ambiente confortable',
        keyHighlights: ['Paleta neutra', 'Espacio despejado'],
      }
    );
  }
}
