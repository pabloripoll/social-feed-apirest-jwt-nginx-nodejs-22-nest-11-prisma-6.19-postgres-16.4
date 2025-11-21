import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from './../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // Fail fast: JWT secret must be provided
            throw new Error('JWT_SECRET environment variable is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });

        // Note: Do not access this.prisma here because constructor runs before Nest injection completes.
        // We keep prisma on the instance for use in validate().
    }

    async validate(payload: any) {
        if (!payload || !payload.sub) throw new UnauthorizedException('Invalid token payload');

        // payload.sub was serialized as string when token was issued.
        // Convert back to BigInt (or Number) according to your Prisma schema.
        let id: number | bigint;
        try {
            // If you stored id as stringified bigint, parse as BigInt
            if (typeof payload.sub === 'string' && /^[0-9]+$/.test(payload.sub)) {
                id = BigInt(payload.sub);
            } else {
                // fallback for numeric strings or numbers
                id = Number(payload.sub);
            }
        } catch (e) {
            throw new UnauthorizedException('Invalid token subject');
        }

        // If your Prisma schema uses BigInt for the id column, pass BigInt; otherwise use Number.
        const user = await this.prisma.users.findUnique({
            where: { id: id as any }, // Prisma will accept BigInt if schema uses BigInt
        });

        if (!user) throw new UnauthorizedException('User not found');

        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }
}
