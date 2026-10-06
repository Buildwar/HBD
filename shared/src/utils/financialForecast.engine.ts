/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Forecast Engine — Project Variance & Budget Projection
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  CostItemDto,
  FinancialForecastDto,
  BudgetVarianceStatus,
} from '../types/financial.types.js';

export class FinancialForecastEngine {
  /**
   * Calculate financial forecast and project health
   */
  public static calculateForecast(
    projectId: string,
    items: CostItemDto[],
    baselineBudget = 0
  ): FinancialForecastDto {
    const activeItems = items.filter((i) => i.status !== 'CANCELLED');

    const totalEstimated = activeItems.reduce(
      (sum, i) => sum + (i.estimatedTotalCost || 0),
      0
    );

    const actualSpent = activeItems.reduce(
      (sum, i) => sum + (i.paidAmount || 0),
      0
    );

    // Committed items: items that have been approved or committed or paid
    const committedItems = activeItems.filter(
      (i) => i.status === 'COMMITTED' || i.status === 'PAID' || i.status === 'APPROVED'
    );

    const committedTotal = committedItems.reduce((sum, i) => {
      const eff = typeof i.actualTotalCost === 'number' && i.actualTotalCost >= 0
        ? i.actualTotalCost
        : i.estimatedTotalCost;
      return sum + eff;
    }, 0);

    const committedRemaining = Math.max(
      0,
      committedTotal - committedItems.reduce((sum, i) => sum + (i.paidAmount || 0), 0)
    );

    // Uncommitted items: estimated or quoted
    const uncommittedItems = activeItems.filter(
      (i) => i.status === 'ESTIMATED' || i.status === 'QUOTED'
    );

    const uncommittedEstimatedRemaining = uncommittedItems.reduce(
      (sum, i) => sum + (i.estimatedTotalCost || 0),
      0
    );

    // Effective baseline
    const effectiveBaseline = baselineBudget > 0 ? baselineBudget : totalEstimated;

    // Projected final cost = actual spent + committed remaining + uncommitted estimated remaining
    const forecastFinalCost = actualSpent + committedRemaining + uncommittedEstimatedRemaining;

    const projectedVariance = forecastFinalCost - effectiveBaseline;
    const projectedVariancePercentage =
      effectiveBaseline > 0
        ? Number(((projectedVariance / effectiveBaseline) * 100).toFixed(2))
        : 0;

    let status: BudgetVarianceStatus = 'ON_BUDGET';
    if (projectedVariance > 0.01) {
      status = 'OVER_BUDGET';
    } else if (projectedVariance < -0.01) {
      status = 'UNDER_BUDGET';
    }

    // Suggested contingency buffer (e.g. 5% to 15% of uncommitted / remaining work depending on variance)
    const remainingWork = committedRemaining + uncommittedEstimatedRemaining;
    let contingencyRate = 0.08; // default 8%
    if (projectedVariancePercentage > 5) {
      contingencyRate = 0.12; // 12% if already deviating
    } else if (projectedVariancePercentage < 0) {
      contingencyRate = 0.05; // 5% if under budget
    }
    const suggestedContingencyBuffer = Number((remainingWork * contingencyRate).toFixed(2));

    // Confidence score based on % of committed/actual items vs estimated
    const totalItemsCount = activeItems.length;
    let confidenceScore = 50;
    if (totalItemsCount > 0) {
      const committedRatio = committedItems.length / totalItemsCount;
      confidenceScore = Math.min(100, Math.round(40 + committedRatio * 55));
    }

    // Risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (projectedVariancePercentage > 10 || (projectedVariancePercentage > 5 && confidenceScore < 70)) {
      riskLevel = 'HIGH';
    } else if (projectedVariancePercentage > 2 || confidenceScore < 60) {
      riskLevel = 'MEDIUM';
    }

    // Key drivers
    const keyDrivers: string[] = [];
    // Find items with biggest variance
    const itemsWithVariance = activeItems
      .filter((i) => typeof i.actualTotalCost === 'number' && i.actualTotalCost > (i.estimatedTotalCost || 0))
      .sort((a, b) => ((b.actualTotalCost || 0) - (b.estimatedTotalCost || 0)) - ((a.actualTotalCost || 0) - (a.estimatedTotalCost || 0)));

    for (const item of itemsWithVariance.slice(0, 3)) {
      const diff = (item.actualTotalCost || 0) - (item.estimatedTotalCost || 0);
      keyDrivers.push(`Desviación en "${item.name}": +${diff.toLocaleString()} €`);
    }

    if (keyDrivers.length === 0) {
      keyDrivers.push('Las partidas actuales se mantienen dentro de las estimaciones iniciales.');
    }

    // Recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'HIGH') {
      recommendations.push('Revisar partidas no contratadas para ajustar calidades o alcance antes de comprometer nuevos contratos.');
      recommendations.push(`Asegurar un colchón de contingencia mínimo de ${suggestedContingencyBuffer.toLocaleString()} €.`);
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Supervisar las certificaciones de obra y presupuestos de mobiliario pendientes de aprobación.');
    } else {
      recommendations.push('La salud financiera del proyecto es óptima. Mantener el ritmo de control de pagos.');
    }

    return {
      projectId,
      baselineBudget: effectiveBaseline,
      actualSpent,
      committedRemaining,
      uncommittedEstimatedRemaining,
      forecastFinalCost,
      projectedVariance,
      projectedVariancePercentage,
      suggestedContingencyBuffer,
      confidenceScore,
      riskLevel,
      status,
      keyDrivers,
      recommendations,
    };
  }
}
