import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './../../../prisma/prisma.service';
import { MemberAuthGuard } from '../../../features/auth/auth.guard';

@Controller('api/v1/account')
export class MemberAccountController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @UseGuards(MemberAuthGuard)
    async account(@Req() req: any) {
        const user = await this.prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            email: user.email,
            role: user.role
        };
    }

    @Get('profile')
    @UseGuards(MemberAuthGuard)
    async profile(@Req() req: any) {
        const profile = await this.prisma.members_profile.findFirst({ where: { user_id: req.user.id } });

        return profile;
    }
}
