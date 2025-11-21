import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication, Logger } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private client: any = null;
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        try {
            // require here so the app doesn't crash at import time if client is not generated yet
            const { PrismaClient } = require('@prisma/client');
            this.client = new PrismaClient();

            await this.client.$connect();

            //this.logger.log('PrismaClient connected');

        } catch (err) {
            // Give a clear message and keep process alive for debugging
            this.logger.error('PrismaClient initialization failed. Did you run "npx prisma generate"?');
            this.logger.error(String(err));

            // Option A: exit so the container/process fails fast:
            // process.exit(1);

            // Option B: rethrow to keep previous behavior (app will crash)
            throw err;
        }
    }

    async onModuleDestroy() {
        if (this.client?.$disconnect) {
            await this.client.$disconnect();
        }
    }

    // expose the underlying client via getter
    get prisma() {
        if (!this.client) {
            throw new Error('Prisma client not initialized. Ensure "npx prisma generate" was run and service restarted.');
        }
        return this.client;
    }
}
