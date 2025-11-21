import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../prisma/prisma.service';

@Injectable()
export class HealthService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Performs a lightweight DB check. Returns an object describing success/failure and elapsed time.
     */
    async checkDatabaseConnection(): Promise<{ connected: true; timeMs: number } | { connected: false; error: string }> {
        const start = Date.now();

        try {
            // Simple, safe query to check DB connectivity (Postgres)
            await this.prisma.$queryRaw`SELECT 1`;

            const timeMs = Date.now() - start;

            return { connected: true, timeMs };

        } catch (err: any) {
            return { connected: false, error: err?.message ?? String(err) };
        }
    }
}
