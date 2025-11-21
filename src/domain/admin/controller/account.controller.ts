import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from './../../../features/auth/admin-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('api/v1/admin/account')
export class AdminAccountController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @UseGuards(AdminAuthGuard)
    async account(@Req() req: any) {
        const user = await this.prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { email: user.email, role: user.role };
    }

    @Get('profile')
    @UseGuards(AdminAuthGuard)
    async profile(@Req() req: any) {
        // adjust to your admin profile table if exists
        return { message: 'admin profile endpoint' };
    }
}
