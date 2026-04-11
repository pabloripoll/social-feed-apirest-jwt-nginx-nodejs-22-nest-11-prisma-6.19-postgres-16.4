import { Module } from '@nestjs/common';
import { PrismaModule } from './../../prisma/prisma.module';
import { PrismaService } from './../../prisma/prisma.service';
import { MemberAuthController } from './controller/member-auth.controller';
import { FeatureAuthModule } from './../../features/auth/auth.module';
import { AuthService } from './../../features/auth/auth.service';

@Module({
    imports: [PrismaModule, FeatureAuthModule],
    controllers: [MemberAuthController],
    providers: [PrismaService, AuthService],
    exports: [],
})

export class MemberModule {}
