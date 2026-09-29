/**
 * HBD — HOME BOARD DESIGNER V4.0.0
 * Master Floorplan Pipeline Engine
 * 
 * Pipeline Flow:
 * Document Import -> Preprocess -> Scale Detection -> Walls -> Rooms -> Doors/Windows -> Validation -> Model
 */

import { PlanParserService, ParsedDocumentMeta } from './planParser.service.js';
import { ScaleDetectorService, ScaleDetectionResult } from './scaleDetector.service.js';
import { TextDetectorService, DetectedTextItem } from './textDetector.service.js';
import { WallDetectorService, DetectedWall } from './wallDetector.service.js';
import { RoomDetectorService, DetectedRoom } from './roomDetector.service.js';
import { DoorDetectorService, DetectedDoor } from './doorDetector.service.js';
import { WindowDetectorService, DetectedWindow } from './windowDetector.service.js';
import { AnalysisValidatorService, ValidationReport } from './analysisValidator.service.js';

export interface FloorplanAnalysisResult {
  meta: ParsedDocumentMeta;
  scale: ScaleDetectionResult;
  textAnnotations: DetectedTextItem[];
  walls: DetectedWall[];
  rooms: DetectedRoom[];
  doors: DetectedDoor[];
  windows: DetectedWindow[];
  validation: ValidationReport;
  timestamp: string;
}

export class FloorplanEngineService {
  /**
   * Runs the complete end-to-end architectural plan analysis pipeline.
   */
  static async analyzePlan(
    filePath: string,
    originalFileName: string,
    mimeType: string,
    manualScale?: { p1: { x: number; y: number }; p2: { x: number; y: number }; meters: number }
  ): Promise<FloorplanAnalysisResult> {
    // 1. Ingest & Parse Document
    const meta = await PlanParserService.parseDocument(filePath, originalFileName, mimeType);

    // 2. Extract Text & OCR Labels
    const textAnnotations = TextDetectorService.extractTextAnnotations(meta.widthPx, meta.heightPx);
    const rawTexts = textAnnotations.map((t) => t.text);

    // 3. Detect / Calibrate Scale
    let scale: ScaleDetectionResult;
    if (manualScale && manualScale.meters > 0) {
      scale = ScaleDetectorService.calibrateByTwoPoints(manualScale.p1, manualScale.p2, manualScale.meters);
    } else {
      scale = ScaleDetectorService.detectScale(rawTexts, meta.widthPx);
    }

    // 4. Detect Walls
    const walls = WallDetectorService.detectWalls(meta.widthPx, meta.heightPx, scale.scaleFactor);

    // 5. Detect Rooms & Compute Surfaces (Shoelace formula via GeometryEngine)
    const rooms = RoomDetectorService.detectRooms(meta.widthPx, meta.heightPx, scale.scaleFactor, textAnnotations);

    // 6. Detect Openings (Doors & Windows)
    const doors = DoorDetectorService.detectDoors(walls, meta.widthPx, meta.heightPx);
    const windows = WindowDetectorService.detectWindows(walls, meta.widthPx, meta.heightPx);

    // 7. Validate & Score Results
    const validation = AnalysisValidatorService.validateAnalysis(
      walls,
      rooms,
      doors,
      windows,
      scale.method !== 'DEFAULT_ESTIMATE'
    );

    return {
      meta,
      scale,
      textAnnotations,
      walls,
      rooms,
      doors,
      windows,
      validation,
      timestamp: new Date().toISOString(),
    };
  }
}
