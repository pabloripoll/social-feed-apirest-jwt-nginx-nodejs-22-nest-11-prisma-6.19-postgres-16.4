import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) { }

    // sign a token for a user with a role-specific TTL (in seconds)
    signToken(user: { id: number | bigint; role: string }, ttlSeconds: number) {
        const payload = {
            sub: user.id,
            role: user.role
        };

        return this.jwtService.sign(payload, { expiresIn: `${ttlSeconds}s` });
    }

    // convenience: issue member token with configured TTL
    async signMemberToken(user: { id: number | bigint; role: string }) {
        const minutes = Number(process.env.JWT_MEMBER_MINUTES ?? 60);
        const token = this.signToken(user, minutes * 60);

        await this.prisma.members_access_logs.create({
            data: {
                user_id: user.id,
                is_terminated: true,
                is_expired: true,
                expires_at: new Date(Date.now() + minutes * 60 * 1000),
                refresh_count: 0,
                created_at: new Date(),
                updated_at: new Date(),
                ip_address: '',
                user_agent: '',
                requests_count: 1,
                payload: {},
                token,
            },
        });

        return { token, expires_in: minutes * 60 };
    }

    async signAdminToken(user: { id: number | bigint; role: string }) {
        const minutes = Number(process.env.JWT_ADMIN_MINUTES ?? 120);
        const token = this.signToken(user, minutes * 60);

        await this.prisma.admins_access_logs.create({
            data: {
                user_id: user.id,
                is_terminated: true,
                is_expired: true,
                expires_at: new Date(Date.now() + minutes * 60 * 1000),
                refresh_count: 0,
                created_at: new Date(),
                updated_at: new Date(),
                ip_address: '',
                user_agent: '',
                requests_count: 1,
                payload: {},
                token,
            },
        });

        return { token, expires_in: minutes * 60 };
    }
}
