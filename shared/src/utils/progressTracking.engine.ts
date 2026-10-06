/**
 * HBD — HOME BOARD DESIGNER (V15.0.0)
 * Progress Tracking Engine
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import {
  ExecutionTaskDto,
  WorkPackageDto,
  ExecutionMilestoneDto,
  ScheduleVariance,
  HealthStatus,
} from '../types/execution.types.js';

export type ProgressCalculationMethod =
  | 'MANUAL_PERCENT'
  | 'TASK_COMPLETION'
  | 'WEIGHTED_DURATION'
  | 'MILESTONE_BASED';

export class ProgressTrackingEngine {
  /**
   * Calcula el progreso individual de una tarea asegurando límites 0-100.
   */
  public static calculateTaskProgress(task: ExecutionTaskDto): number {
    if (task.status === 'COMPLETED') return 100;
    if (task.status === 'NOT_STARTED') return 0;
    if (task.status === 'CANCELLED') return 0;
    const p = Math.max(0, Math.min(100, task.progress || 0));
    return p;
  }

  /**
   * Calcula el progreso de un WorkPackage a partir de sus tareas.
   * Si no tiene tareas, usa su progreso directo si fue establecido.
   */
  public static calculateWorkPackageProgress(
    workPackage: WorkPackageDto,
    method: ProgressCalculationMethod = 'WEIGHTED_DURATION'
  ): number {
    if (!workPackage.tasks || workPackage.tasks.length === 0) {
      if (workPackage.status === 'COMPLETED') return 100;
      return Math.max(0, Math.min(100, workPackage.progress || 0));
    }

    if (method === 'TASK_COMPLETION') {
      const completed = workPackage.tasks.filter((t) => t.status === 'COMPLETED').length;
      return Math.round((completed / workPackage.tasks.length) * 100);
    }

    if (method === 'WEIGHTED_DURATION') {
      let totalDuration = 0;
      let completedDuration = 0;

      for (const t of workPackage.tasks) {
        const dur = Math.max(1, t.plannedDurationDays || 1);
        const taskProg = this.calculateTaskProgress(t);
        totalDuration += dur;
        completedDuration += (taskProg / 100) * dur;
      }

      if (totalDuration === 0) return 0;
      return Math.round((completedDuration / totalDuration) * 100);
    }

    // Default simple average
    const sum = workPackage.tasks.reduce((acc, t) => acc + this.calculateTaskProgress(t), 0);
    return Math.round(sum / workPackage.tasks.length);
  }

  /**
   * Calcula el progreso global de la obra.
   */
  public static calculateGlobalProgress(params: {
    tasks: ExecutionTaskDto[];
    workPackages?: WorkPackageDto[];
    milestones?: ExecutionMilestoneDto[];
    method?: ProgressCalculationMethod;
  }): number {
    const { tasks, workPackages, milestones, method = 'WEIGHTED_DURATION' } = params;

    if (tasks.length === 0 && (!workPackages || workPackages.length === 0)) {
      if (milestones && milestones.length > 0) {
        const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
        return Math.round((completedMilestones / milestones.length) * 100);
      }
      return 0;
    }

    if (workPackages && workPackages.length > 0) {
      let totalWeight = 0;
      let weightedSum = 0;

      for (const wp of workPackages) {
        const wpProg = this.calculateWorkPackageProgress(wp, method);
        const weight = Math.max(1, wp.tasks.reduce((a, b) => a + (b.plannedDurationDays || 1), 0));
        totalWeight += weight;
        weightedSum += (wpProg / 100) * weight;
      }

      if (totalWeight === 0) return 0;
      return Math.round((weightedSum / totalWeight) * 100);
    }

    if (method === 'TASK_COMPLETION') {
      const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
      return Math.round((completed / tasks.length) * 100);
    }

    let totalDuration = 0;
    let completedDuration = 0;

    for (const t of tasks) {
      const dur = Math.max(1, t.plannedDurationDays || 1);
      const prog = this.calculateTaskProgress(t);
      totalDuration += dur;
      completedDuration += (prog / 100) * dur;
    }

    if (totalDuration === 0) return 0;
    return Math.round((completedDuration / totalDuration) * 100);
  }

  /**
   * Calcula las desviaciones temporales (Schedule Variance).
   */
  public static calculateScheduleVariance(params: {
    startDate?: string | null;
    plannedEndDate?: string | null;
    actualEndDate?: string | null;
    tasks: ExecutionTaskDto[];
    phases?: Array<{
      id: string;
      name: string;
      estimatedDurationDays: number;
      startDate?: string | null;
      endDate?: string | null;
    }>;
  }): ScheduleVariance {
    const { startDate, plannedEndDate, actualEndDate, tasks, phases = [] } = params;

    let plannedDurationDays = 0;
    if (startDate && plannedEndDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(plannedEndDate).getTime();
      plannedDurationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    } else {
      plannedDurationDays = tasks.reduce((sum, t) => sum + (t.plannedDurationDays || 1), 0) || 30;
    }

    let actualDurationDays = 0;
    if (startDate) {
      const start = new Date(startDate).getTime();
      const currentOrEnd = actualEndDate ? new Date(actualEndDate).getTime() : Date.now();
      actualDurationDays = Math.max(0, Math.round((currentOrEnd - start) / (1000 * 60 * 60 * 24)));
    } else {
      actualDurationDays = tasks.reduce((sum, t) => sum + (t.actualDurationDays || 0), 0);
    }

    const completedProg = tasks.length > 0
      ? this.calculateGlobalProgress({ tasks })
      : 0;

    const remainingDurationDays = Math.max(
      0,
      Math.round(plannedDurationDays * (1 - completedProg / 100))
    );

    const projectedTotalDays = actualDurationDays + remainingDurationDays;
    const delayDays = Math.max(0, projectedTotalDays - plannedDurationDays);
    const delayPercent = plannedDurationDays > 0
      ? Math.round((delayDays / plannedDurationDays) * 100)
      : 0;

    let status: HealthStatus = 'ON_TRACK';
    if (!startDate || !plannedEndDate) {
      status = 'UNKNOWN';
    } else if (delayPercent > 20 || delayDays > 14) {
      status = 'DELAYED';
    } else if (delayPercent > 5 || delayDays > 3) {
      status = 'AT_RISK';
    }

    const phaseVariances = phases.map((p) => {
      const planned = p.estimatedDurationDays || 7;
      let actual = planned;
      if (p.startDate && p.endDate) {
        const s = new Date(p.startDate).getTime();
        const e = new Date(p.endDate).getTime();
        actual = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
      }
      const diff = actual - planned;
      return {
        phaseId: p.id,
        phaseName: p.name,
        plannedDays: planned,
        actualDays: actual,
        delayDays: Math.max(0, diff),
      };
    });

    return {
      plannedDurationDays,
      actualDurationDays,
      remainingDurationDays,
      delayDays,
      delayPercent,
      status,
      phaseVariances,
    };
  }
}
