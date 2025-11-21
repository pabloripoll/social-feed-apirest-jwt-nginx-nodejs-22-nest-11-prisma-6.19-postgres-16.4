import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = (req.headers.authorization || '') as string;
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (!token) {
            throw new UnauthorizedException('Token missing.');
        }

        let payload: any;
        try {
            // Use the same secret and signing algorithm as used by JwtService
            payload = this.jwtService.verify(token);
        } catch (err) {
            throw new UnauthorizedException('Token invalid or expired.');
        }

        // Role coming from token payload
        const role: string = payload.role ?? (process.env.ROLE_MEMBER_VALUE ?? 'ROLE_MEMBER');

        // Find the exact token in the access log (we store the exact token string on login)
        // Choose access log table explicitly based on role
        let access: any | null = null;
        if (role === 'ROLE_ADMIN') {
            access = await this.prisma.admins_access_logs.findFirst({ where: { token } });
        } else {
            access = await this.prisma.members_access_logs.findFirst({ where: { token } });
        }

        if (!access) {
            throw new UnauthorizedException('Token not found in access log.');
        }

        if (access.is_terminated) {
            throw new UnauthorizedException('Token invalid or terminated.');
        }

        if (access.is_expired) {
            throw new UnauthorizedException('Token expired.');
        }

        if (access.expires_at && new Date(access.expires_at) <= new Date()) {
            throw new UnauthorizedException('Token expired.');
        }

        // Payload.sub was stringified when signed. Convert back to BigInt for DB usage.
        const sub = payload.sub;
        try {
            const userId = typeof sub === 'string' ? BigInt(sub) : BigInt(Number(sub));
            req.user = { id: userId, role: payload.role };
            req.access = access;

            return true;

        } catch (error) {
            throw new UnauthorizedException('Invalid token subject.');
        }
    }
}
