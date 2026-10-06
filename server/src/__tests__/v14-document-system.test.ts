/**
 * HBD — HOME BOARD DESIGNER
 * SUITE DE PRUEBAS AUTOMATIZADAS — V14.0.0
 * PROFESSIONAL PROJECT DOCUMENTATION & PRESENTATION
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  APP_METADATA,
  DocumentEngine,
  DocumentTemplateEngine,
  DocumentBuilderEngine,
  DocumentExportEngine,
  ProjectDocumentDto,
  DocumentTemplateDto,
  CreateDocumentInput,
} from '@hbd/shared';

describe('🧪 HBD V14.0.0 — SUITE DE PRUEBAS DE DOCUMENTACIÓN Y PRESENTACIÓN', () => {
  // ============================================================
  // 1. Identidad Centralizada y Versión 14.0.0
  // ============================================================
  describe('--- 1. Identidad Centralizada, Autoría y Versión 14.0.0 ---', () => {
    it('Autor oficial debe ser "Adrián Palma"', () => {
      assert.strictEqual(APP_METADATA.author, 'Adrián Palma');
    });

    it('Versión global debe ser válida', () => {
      assert.ok(Boolean(APP_METADATA.version));
    });

    it('Año de copyright debe ser 2026', () => {
      assert.strictEqual(APP_METADATA.copyrightYear, 2026);
    });

    it('Copyright oficial debe incluir a Adrián Palma', () => {
      assert.ok(APP_METADATA.copyright.includes('Adrián Palma'));
      assert.ok(APP_METADATA.copyright.includes('2026'));
    });

    it('supportedLanguages debe ser exactamente [es, en]', () => {
      assert.deepStrictEqual(Array.from(APP_METADATA.supportedLanguages), ['es', 'en']);
    });
  });

  // ============================================================
  // 2. Motor de Plantillas de Documento (DocumentTemplateEngine)
  // ============================================================
  describe('--- 2. Motor de Plantillas de Documento (DocumentTemplateEngine) ---', () => {
    it('Dispone de las 6 plantillas oficiales del sistema con capítulos configurados', () => {
      const templates = DocumentTemplateEngine.getSystemTemplates();
      assert.strictEqual(templates.length, 6, 'Debe incluir exactamente 6 plantillas oficiales');

      const templateTypes = templates.map((t) => t.type);
      assert.ok(templateTypes.includes('PROJECT_DOSSIER'));
      assert.ok(templateTypes.includes('DESIGN_PRESENTATION'));
      assert.ok(templateTypes.includes('RENOVATION_REPORT'));
      assert.ok(templateTypes.includes('TECHNICAL_REPORT'));
      assert.ok(templateTypes.includes('CLIENT_PRESENTATION'));

      templates.forEach((tpl) => {
        assert.ok(tpl.id.length > 0);
        assert.ok(tpl.name.length > 0);
        assert.ok(tpl.sectionsConfig.length > 0, 'Toda plantilla debe incluir secciones');
        assert.ok(tpl.defaultOrientation === 'PORTRAIT' || tpl.defaultOrientation === 'LANDSCAPE');
        assert.ok(tpl.defaultPageSize === 'A4' || tpl.defaultPageSize === 'A3');
      });
    });

    it('Obtiene una plantilla por ID o tipo de forma robusta', () => {
      const renovationTpl = DocumentTemplateEngine.getTemplate('template-renovation');
      assert.strictEqual(renovationTpl.type, 'RENOVATION_REPORT');
      assert.ok(renovationTpl.sectionsConfig.some((s) => s.type === 'CONSTRUCTION'));
    });
  });

  // ============================================================
  // 3. Constructor de Contenido Documental (DocumentBuilderEngine)
  // ============================================================
  describe('--- 3. Constructor de Contenido Documental (DocumentBuilderEngine) ---', () => {
    const mockContext = {
      project: {
        id: 'proj-123',
        name: 'Vivienda Residencial Gran Vía',
        address: 'Calle Gran Vía 42, Madrid',
        description: 'Reforma integral y redistribución de espacios nobles.',
        floors: [
          {
            id: 'floor-1',
            name: 'Planta Principal',
            heightM: 2.6,
            rooms: [
              { id: 'r1', name: 'Salón Comedor', areaM2: 28.5 },
              { id: 'r2', name: 'Cocina Abierta', areaM2: 12.0 },
              { id: 'r3', name: 'Dormitorio Suite', areaM2: 16.0 },
            ],
            walls: [
              { id: 'w1', startX: 0, startY: 0, endX: 6, endY: 0, thickness: 0.2 },
              { id: 'w2', startX: 6, startY: 0, endX: 6, endY: 5, thickness: 0.2 },
            ],
            doors: [{ id: 'd1', widthM: 0.85, position: { x: 2, y: 0 } }],
            windows: [{ id: 'win1', widthM: 1.2, heightM: 1.4, position: { x: 4, y: 0 } }],
            furniturePlacements: [
              { id: 'fp1', name: 'Sofá Modular 3 Plazas', widthM: 2.4, depthM: 0.95, heightM: 0.85, price: 1200 },
            ],
          },
        ],
        constructionProject: {
          items: [
            { name: 'Demolición de tabique', category: 'DEMOLITION', materialCost: 200, laborCost: 400, otherCost: 50, totalCost: 650 },
            { name: 'Tarima flotante AC5', category: 'FLOORING', materialCost: 1200, laborCost: 800, otherCost: 0, totalCost: 2000 },
          ],
        },
      },
      renders: [{ id: 'ren-1', name: 'Vista Salón Luz Día', url: '/renders/salondia.png' }],
      metadata: { clientName: 'Familia Gómez', author: 'Adrián Palma' },
    };

    it('Construye secciones completas integrando superficies, presupuesto y portada', () => {
      const template = DocumentTemplateEngine.getTemplate('STANDARD_PROJECT');
      const sections = DocumentBuilderEngine.buildDocumentSections('doc-test-1', template.sectionsConfig, mockContext);

      assert.ok(sections.length > 0);

      // Portada
      const cover = sections.find((s) => s.type === 'COVER');
      assert.ok(cover);
      assert.strictEqual(cover.contentData.projectName, 'Vivienda Residencial Gran Vía');
      assert.strictEqual(cover.contentData.clientName, 'Familia Gómez');
      assert.strictEqual(cover.contentData.author, 'Adrián Palma');

      // Mediciones
      const measurements = sections.find((s) => s.type === 'MEASUREMENTS');
      assert.ok(measurements);
      assert.strictEqual(measurements.contentData.usableAreaM2, 56.5);
      assert.ok(measurements.contentData.tableByRoom.length === 3);

      // Presupuesto
      const budget = sections.find((s) => s.type === 'BUDGET');
      assert.ok(budget);
      assert.strictEqual(budget.contentData.totalEstimatedCostEur, 2650);

      // Disclaimer
      const disclaimer = sections.find((s) => s.type === 'DISCLAIMER');
      assert.ok(disclaimer);
      assert.ok(disclaimer.contentData.noticeText.includes('Home Board Designer'));
    });

    it('Maneja datos inexistentes o vacíos de forma segura con N/D o ESTIMATED', () => {
      const emptyContext = { project: { id: 'p-empty', name: 'Proyecto Vacío' } };
      const sections = DocumentBuilderEngine.buildDocumentSections(
        'doc-empty',
        [{ type: 'PROJECT_SUMMARY', title: 'Resumen', order: 1, isEnabled: true }],
        emptyContext
      );

      assert.strictEqual(sections[0].contentData.address, 'N/D');
      assert.strictEqual(sections[0].contentData.totalRooms, 0);
    });
  });

  // ============================================================
  // 4. Motor de Gestión Documental (DocumentEngine)
  // ============================================================
  describe('--- 4. Motor de Gestión Documental (DocumentEngine) ---', () => {
    it('Crea un ProjectDocument con versión 1.0 e historial inicial', () => {
      const input: CreateDocumentInput = {
        projectId: 'proj-100',
        name: 'Dossier Ejecutivo 2026',
        templateType: 'PROJECT_DOSSIER',
        language: 'es',
      };

      const doc = DocumentEngine.createDocument(input);

      assert.ok(doc.id.startsWith('doc-'));
      assert.strictEqual(doc.name, 'Dossier Ejecutivo 2026');
      assert.strictEqual(doc.version, '1.0');
      assert.strictEqual(doc.status, 'READY');
      assert.ok(doc.sections && doc.sections.length > 0);
      assert.strictEqual(doc.history?.length, 1);
      assert.strictEqual(doc.history[0].action, 'CREATED');
    });

    it('Regenera un documento incrementando su versión (1.0 -> 1.1) y registrando historial', () => {
      const input: CreateDocumentInput = {
        projectId: 'proj-100',
        name: 'Dossier Reforma',
        templateType: 'RENOVATION_REPORT',
      };

      const doc = DocumentEngine.createDocument(input);
      const regenerated = DocumentEngine.regenerateDocument(doc, {
        project: { name: 'Vivienda Actualizada' },
      });

      assert.strictEqual(regenerated.id, doc.id);
      assert.strictEqual(regenerated.version, '1.1');
      assert.strictEqual(regenerated.history?.length, 2);
      assert.strictEqual(regenerated.history[1].action, 'REGENERATED');
    });
  });

  // ============================================================
  // 5. Motor de Exportación (DocumentExportEngine)
  // ============================================================
  describe('--- 5. Motor de Exportación (DocumentExportEngine) ---', () => {
    const sampleDoc: ProjectDocumentDto = {
      id: 'doc-export-1',
      projectId: 'proj-1',
      name: 'Dossier de Presentación',
      type: 'PROJECT_DOSSIER',
      status: 'READY',
      language: 'es',
      version: '1.0',
      orientation: 'PORTRAIT',
      pageSize: 'A4',
      metadata: { author: 'Adrián Palma' },
      sections: [
        {
          id: 'sec-1',
          documentId: 'doc-export-1',
          type: 'COVER',
          title: 'Portada',
          order: 1,
          isEnabled: true,
          config: { type: 'COVER', title: 'Portada', order: 1, isEnabled: true },
          contentData: { projectName: 'Residencial Palma', clientName: 'Cliente VIP', generatedDate: '2026' },
          status: 'READY',
          warnings: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sec-2',
          documentId: 'doc-export-1',
          type: 'MEASUREMENTS',
          title: 'Mediciones',
          order: 2,
          isEnabled: true,
          config: { type: 'MEASUREMENTS', title: 'Mediciones', order: 2, isEnabled: true },
          contentData: {
            usableAreaM2: 85,
            builtAreaM2: 98,
            tableByRoom: [{ name: 'Salón', usableAreaM2: 30, heightM: 2.6, skirtingM: 22 }],
          },
          status: 'READY',
          warnings: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('Exporta a PDF (HTML con layout de impresión, @page A4 y CSS)', () => {
      const result = DocumentExportEngine.export(sampleDoc, { format: 'PDF' });
      assert.strictEqual(result.format, 'PDF');
      assert.strictEqual(result.contentType, 'application/pdf');
      assert.ok(result.filename.endsWith('.pdf'));
      assert.ok(result.content.length > 0);
    });

    it('Exporta a JSON estructurado', () => {
      const result = DocumentExportEngine.export(sampleDoc, { format: 'JSON' });
      assert.strictEqual(result.format, 'JSON');
      assert.strictEqual(result.contentType, 'application/json');
      const parsed = JSON.parse(result.content);
      assert.strictEqual(parsed.id, 'doc-export-1');
      assert.strictEqual(parsed.sections.length, 2);
    });

    it('Exporta mediciones a formato CSV', () => {
      const result = DocumentExportEngine.export(sampleDoc, { format: 'CSV' });
      assert.strictEqual(result.format, 'CSV');
      assert.ok(result.content.includes('Estancia,Superficie_Util_m2'));
      assert.ok(result.content.includes('"Salón",30,2.6,22'));
    });
  });

  // ============================================================
  // 6. Simetría de Internacionalización (es / en)
  // ============================================================
  describe('--- 6. Simetría de Internacionalización de Documentos (es.json vs en.json) ---', () => {
    it('Verifica simetría exacta en namespaces documents, templates, reports, presentation, exports y technicalReport', () => {
      const esPath = resolve(__dirname, '../../../client/src/i18n/locales/es.json');
      const enPath = resolve(__dirname, '../../../client/src/i18n/locales/en.json');

      assert.ok(existsSync(esPath), 'es.json debe existir');
      assert.ok(existsSync(enPath), 'en.json debe existir');

      const esData = JSON.parse(readFileSync(esPath, 'utf-8'));
      const enData = JSON.parse(readFileSync(enPath, 'utf-8'));

      const namespaces = ['documents', 'templates', 'reports', 'presentation', 'exports', 'technicalReport'];

      namespaces.forEach((ns) => {
        assert.ok(esData[ns], `es.json debe tener namespace "${ns}"`);
        assert.ok(enData[ns], `en.json debe tener namespace "${ns}"`);

        const esKeys = Object.keys(esData[ns]).sort();
        const enKeys = Object.keys(enData[ns]).sort();

        assert.deepStrictEqual(
          esKeys,
          enKeys,
          `Las claves de "${ns}" en es.json y en.json deben ser 100% simétricas`
        );
      });
    });
  });

  // ============================================================
  // 7. Auditoría de Centralización de Versión en "Acerca de"
  // ============================================================
  describe('--- 7. Auditoría de Centralización de Versión en "Acerca de" ---', () => {
    it('Sidebar y componentes NO contienen badges de versión V14 ni versiones históricas', () => {
      const sidebarPath = resolve(__dirname, '../../../client/src/components/layout/Sidebar.tsx');
      const sidebarContent = readFileSync(sidebarPath, 'utf-8');

      assert.ok(!sidebarContent.includes("badge: 'V14'"), 'Sidebar NO muestra badge V14');
      assert.ok(!sidebarContent.includes("badge: 'V13'"), 'Sidebar NO muestra badge V13');
      assert.ok(!sidebarContent.includes("badge: 'V12'"), 'Sidebar NO muestra badge V12');
      assert.ok(!sidebarContent.includes("badge: 'V11'"), 'Sidebar NO muestra badge V11');
      assert.ok(!sidebarContent.includes("badge: 'V10'"), 'Sidebar NO muestra badge V10');
    });
  });
});
