import { prisma } from '../config/prisma.js';

export type LogModule = 'AUTH' | 'PROJECT' | 'PLAN' | 'GEOMETRY' | 'FURNITURE' | 'AI' | 'SYSTEM';

class Logger {
  private format(module: LogModule, level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${module}]: ${message}`;
  }

  info(module: LogModule, message: string, meta?: unknown) {
    console.log(this.format(module, 'INFO', message), meta ? JSON.stringify(meta) : '');
  }

  warn(module: LogModule, message: string, meta?: unknown) {
    console.warn(this.format(module, 'WARN', message), meta ? JSON.stringify(meta) : '');
  }

  error(module: LogModule, message: string, error?: unknown) {
    console.error(this.format(module, 'ERROR', message), error || '');
  }

  async audit(module: LogModule, message: string, userId?: string, metadata?: Record<string, unknown>) {
    this.info(module, message, metadata);
    try {
      if (prisma.systemLog) {
        await prisma.systemLog.create({
          data: {
            module,
            message,
            level: 'INFO',
            userId: userId || null,
            metadata: metadata ? (metadata as any) : undefined,
          },
        });
      }
    } catch {
      // Ignorar fallos de logging persistente si la BD no está lista aún
    }
  }
}

export const logger = new Logger();
