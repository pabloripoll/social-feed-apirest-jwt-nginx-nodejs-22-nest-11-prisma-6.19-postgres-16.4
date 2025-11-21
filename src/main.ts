import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './features/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

// Solving - TypeError: Do not know how to serialize a BigInt
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// Use string serialization instead of Number for BigInt to avoid precision loss.
declare global {
  interface BigInt { toJSON(): string; }
}
BigInt.prototype.toJSON = function () { return this.toString(); }


async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.useGlobalFilters(new HttpExceptionFilter());

    const config = new DocumentBuilder()
        .setTitle('Social Feed')
        .setDescription('Demo NestJS API with JWT/Prisma')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Serve static assets from ./public
    // index: false so requests for non-file routes fall through to the SPA fallback below
    app.useStaticAssets(join(__dirname, '..', 'public'), {
        prefix: '/',
        index: false,
    });

    // SPA fallback: for any GET request that doesn't start with /api, return index.html
    // Place this after static assets registration so real files are served first.
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            res.sendFile(join(__dirname, '..', 'public', 'index.html'));
        } else {
            next();
        }
    });

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}

bootstrap();
