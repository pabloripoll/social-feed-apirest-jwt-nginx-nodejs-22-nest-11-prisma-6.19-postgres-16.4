import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Response } from 'express';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { FeatureAuthModule } from './features/auth/auth.module';

import { GeoModule } from './domain/geo/geo.module';
import { UserModule } from './domain/user/user.module';
import { AdminModule } from './domain/admin/admin.module';
import { MemberModule } from './domain/member/member.module';
import { FeedModule } from './domain/feed/feed.module';
import { HealthModule } from './features/health/health.module';

import { join } from 'path';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        FeatureAuthModule,
        GeoModule,
        UserModule,
        AdminModule,
        MemberModule,
        FeedModule,
        HealthModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'), // dist after build: dist/../public -> projectRoot/public
            serveRoot: '/public', // URL prefix (change to '/' to serve at root)
            exclude: ['/api*'], // don't serve API routes
            serveStaticOptions: {
                index: false, // don't automatically send index.html (useful for SPA fallback)
                maxAge: '1d', // caching (or number in ms)
                setHeaders: (res: Response) => {
                    // example security headers
                    res.setHeader('X-Content-Type-Options', 'nosniff');
                },
            },
        }),
    ],
    providers: [PrismaService],
    controllers: [AppController],
})

export class AppModule { }
