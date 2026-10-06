/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MOTOR DE EXPORTACIÓN DOCUMENTAL (PDF, PRINT, JSON, CSV)
 * DOCUMENT EXPORT ENGINE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import {
  ProjectDocumentDto,
  DocumentExportOptions,
  DocumentExportResult,
} from '../types/document.types.js';
import { APP_METADATA } from '../config/app.constants.js';

export class DocumentExportEngine {
  /**
   * Exporta un documento al formato solicitado
   */
  public static export(
    document: ProjectDocumentDto,
    options: DocumentExportOptions = { format: 'PDF' }
  ): DocumentExportResult {
    const timestamp = new Date().toISOString();
    const cleanDocName = (document.name || 'documento')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_');

    switch (options.format) {
      case 'JSON': {
        const jsonString = JSON.stringify(document, null, 2);
        return {
          format: 'JSON',
          filename: `HBD_${cleanDocName}_v${document.version}.json`,
          contentType: 'application/json',
          content: jsonString,
          exportedAt: timestamp,
          sizeBytes: Buffer.from(jsonString).length,
        };
      }

      case 'CSV': {
        const csvContent = this.generateCsvExport(document);
        return {
          format: 'CSV',
          filename: `HBD_${cleanDocName}_mediciones_v${document.version}.csv`,
          contentType: 'text/csv',
          content: csvContent,
          exportedAt: timestamp,
          sizeBytes: Buffer.from(csvContent).length,
        };
      }

      case 'PDF':
      case 'PRINT':
      default: {
        const htmlDoc = this.generateHtmlPrintableLayout(document, options);
        return {
          format: options.format || 'PDF',
          filename: `HBD_${cleanDocName}_v${document.version}.pdf`,
          contentType: 'application/pdf',
          content: Buffer.from(htmlDoc).toString('base64'),
          exportedAt: timestamp,
          sizeBytes: Buffer.from(htmlDoc).length,
        };
      }
    }
  }

  /**
   * Genera el layout HTML listo para imprimir / PDF con numeración, portada, encabezados y pies de página
   */
  public static generateHtmlPrintableLayout(
    document: ProjectDocumentDto,
    options: DocumentExportOptions
  ): string {
    const orientation = options.orientation || document.orientation || 'PORTRAIT';
    const pageSize = options.pageSize || document.pageSize || 'A4';
    const isLandscape = orientation === 'LANDSCAPE';

    const enabledSections = (document.sections || [])
      .filter((s) => s.isEnabled)
      .sort((a, b) => a.order - b.order);

    const sectionsHtml = enabledSections
      .map((section, idx) => {
        return `
        <div class="document-page ${section.type === 'COVER' ? 'cover-page' : 'standard-page'}">
          ${
            section.type !== 'COVER'
              ? `
              <header class="page-header">
                <span class="header-doc">${document.name}</span>
                <span class="header-ver">v${document.version}</span>
              </header>
            `
              : ''
          }
          
          <main class="page-content">
            <h2 class="section-title">${section.title}</h2>
            <div class="section-body">
              ${this.renderSectionContentHtml(section)}
            </div>
          </main>

          ${
            section.type !== 'COVER'
              ? `
              <footer class="page-footer">
                <span class="footer-copy">${APP_METADATA.copyright}</span>
                <span class="footer-page">Página ${idx + 1} de ${enabledSections.length}</span>
              </footer>
            `
              : ''
          }
        </div>
      `;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="${document.language || 'es'}">
<head>
  <meta charset="utf-8" />
  <title>${document.name} — ${APP_METADATA.displayName}</title>
  <style>
    @page {
      size: ${pageSize} ${isLandscape ? 'landscape' : 'portrait'};
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #1f2937;
      background-color: #ffffff;
      font-size: 11pt;
      line-height: 1.5;
    }
    .document-page {
      page-break-after: always;
      min-height: ${isLandscape ? '180mm' : '260mm'};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cover-page {
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .page-footer {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 20px;
    }
    .section-title {
      font-size: 18pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
      border-left: 4px solid #10b981;
      padding-left: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .notice-box {
      background-color: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 16px;
      font-size: 9pt;
      color: #854d0e;
    }
  </style>
</head>
<body>
  ${sectionsHtml}
</body>
</html>`;
  }

  private static renderSectionContentHtml(section: any): string {
    const data = section.contentData || {};

    if (section.type === 'COVER') {
      return `
        <div style="margin-top: 60px;">
          <h1 style="font-size: 28pt; font-weight: 800; color: #111827; margin-bottom: 8px;">${data.projectName}</h1>
          <p style="font-size: 14pt; color: #4b5563; margin-bottom: 24px;">${data.scenarioName}</p>
          <div style="margin: 40px auto; width: 120px; height: 4px; background: #10b981; border-radius: 2px;"></div>
          <p style="font-size: 11pt; color: #6b7280;">Cliente: <strong>${data.clientName}</strong></p>
          <p style="font-size: 11pt; color: #6b7280;">Fecha de emisión: <strong>${data.generatedDate}</strong></p>
          <p style="font-size: 11pt; color: #6b7280;">Autor: <strong>${data.author}</strong></p>
        </div>
      `;
    }

    if (section.type === 'MEASUREMENTS' && data.tableByRoom) {
      const rows = data.tableByRoom
        .map(
          (r: any) => `
          <tr>
            <td>${r.name}</td>
            <td>${r.usableAreaM2} m²</td>
            <td>${r.heightM} m</td>
            <td>${r.skirtingM} m</td>
          </tr>
        `
        )
        .join('');

      return `
        <p><strong>Superficie Útil Total:</strong> ${data.usableAreaM2} m² | <strong>Superficie Construida:</strong> ${data.builtAreaM2} m²</p>
        <table>
          <thead>
            <tr>
              <th>Estancia</th>
              <th>Superficie Útil</th>
              <th>Altura Libre</th>
              <th>Rodapié / Perímetro</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    if (section.type === 'BUDGET') {
      return `
        <p><strong>Total Estimado de Ejecución Material:</strong> ${typeof data.totalEstimatedCostEur === 'number' ? data.totalEstimatedCostEur.toLocaleString('es-ES') + ' €' : data.totalEstimatedCostEur}</p>
        <table>
          <tbody>
            <tr><td>Materiales</td><td>${data.materialsCostEur} €</td></tr>
            <tr><td>Mano de Obra</td><td>${data.laborCostEur} €</td></tr>
            <tr><td>Otros y Gestión de Residuos</td><td>${data.otherCostEur} €</td></tr>
          </tbody>
        </table>
        <div class="notice-box">${data.notice}</div>
      `;
    }

    if (section.type === 'VALIDATIONS' && data.rulesSummary) {
      const rows = data.rulesSummary
        .map(
          (r: any) => `
          <tr>
            <td>${r.rule}</td>
            <td><span class="badge">${r.status}</span></td>
            <td>${r.details}</td>
          </tr>
        `
        )
        .join('');

      return `
        <p><strong>Puntuación de Cumplimiento:</strong> ${data.complianceScore} / 100</p>
        <table>
          <thead>
            <tr><th>Regla / Normativa</th><th>Estado</th><th>Detalle</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="notice-box">${data.proValidationNotice}</div>
      `;
    }

    if (section.type === 'DISCLAIMER') {
      return `
        <div class="notice-box" style="margin-top: 30px; font-size: 10pt; line-height: 1.6;">
          <strong>${data.title}</strong><br/>
          ${data.noticeText}
        </div>
      `;
    }

    return `<p>${JSON.stringify(data, null, 2)}</p>`;
  }

  private static generateCsvExport(document: ProjectDocumentDto): string {
    const measurementsSec = (document.sections || []).find((s) => s.type === 'MEASUREMENTS');
    const rooms = measurementsSec?.contentData?.tableByRoom || [];

    let csv = 'Estancia,Superficie_Util_m2,Altura_m,Rodapie_m\n';
    rooms.forEach((r: any) => {
      csv += `"${r.name}",${r.usableAreaM2},${r.heightM},${r.skirtingM}\n`;
    });

    return csv;
  }
}
