import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'change-me',
            signOptions: { expiresIn: `${(Number(process.env.JWT_MEMBER_MINUTES ?? 60)) * 60}s` },
        }),
    ],
    providers: [PrismaService, AuthService, JwtStrategy, AuthGuard],
    exports: [AuthService, AuthGuard, JwtModule],
})

export class FeatureAuthModule { }
