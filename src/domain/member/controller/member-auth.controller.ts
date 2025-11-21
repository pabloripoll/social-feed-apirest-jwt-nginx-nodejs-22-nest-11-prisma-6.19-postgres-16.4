import { Prisma } from '@prisma/client';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';

import { MemberActivationDto } from './../dto/member-activation.dto';
import { MemberLoginDto } from './../dto/member-login.dto';
import { MemberRegisterDto } from './../dto/member-register.dto';

import { FeatureAuthService } from './../../../features/auth/feature-auth.service';
import { PrismaService } from './../../../prisma/prisma.service';

import { MemberAuthGuard } from '../../../features/auth/auth.guard';
import { randomAlphaNum, generateUniqueUid } from './../../../features/utils/random';


@Controller('api/v1/auth')
export class MemberAuthController {

    constructor(
        private readonly prisma: PrismaService,
        private readonly auth: FeatureAuthService,
    ) { }

    // POST /api/v1/auth/register - (public)
    @Post('register')
    async register(@Body() req: MemberRegisterDto) {

        const exists = await this.prisma.users.findUnique({
            where: {
                email: req.email
            }
        });

        if (exists) return {
            status: 400,
            message: 'Email already registered.'
        };

        const hashedPassword = await bcrypt.hash(req.password, 10);
        const user = await this.prisma.users.create({
            data: {
                email: req.email,
                password: hashedPassword,
                role: process.env.ROLE_MEMBER_VALUE ?? 'ROLE_MEMBER',
                created_at: new Date(),
                updated_at: new Date()
            },
        });

        const uid = await generateUniqueUid(6, 1000,
            async (uid: number) => Boolean(await this.prisma.members.findFirst({ where: { uid } }))
        );

        const memberRegistryData: any = {
            user_id: user.id,
            uid,
            region_id: req.region_id != null ? BigInt(req.region_id as any) : undefined,
            created_at: new Date(),
            updated_at: new Date()
        };
        const member = await this.prisma.members.create({
            data: memberRegistryData
        });

        const activationCode = randomAlphaNum(32);
        const requiresActivation = process.env.LOGIN_ACTIVATION_CODE === 'true';
        const activation = await this.prisma.members_activation_codes.create({
            data: {
                user_id: user.id,
                code: activationCode,
                is_active: !requiresActivation,
                created_at: new Date(),
                updated_at: new Date()
            },
        });

        const profile = await this.prisma.members_profile.create({
            data: {
                user_id: user.id,
                nickname: req.nickname,
                created_at: new Date(),
                updated_at: new Date()
            },
        });

        // (Optional) send mail/queue here

        return {
            uid: member.uid,
            email: user.email,
            nickname: profile.nickname,
            activation_code: activation.code
        };
    }

    // POST /api/v1/auth/activation (public)
    @Post('activation')
    async activation(@Body() req: MemberActivationDto) {
        const activation = await this.prisma.members_activation_codes.findFirst({
            where: {
                users: {
                    email: req.email
                },
            },
            include: {
                users: true
            },
        });

        if (!activation) throw {
            status: 400,
            message: 'Invalid activation request.'
        };

        if (activation.code !== req.code) throw {
            status: 400,
            message: 'Invalid activation code.'
        };

        await this.prisma.members_activation_codes.update({
            where: {
                id: activation.id
            },
            data: {
                is_active: true,
                updated_at: new Date()
            },
        });

        return {
            email: req.email,
            status: 'Account has been activated.'
        };
    }

    // POST /api/v1/auth/login (public)
    @Post('login')
    async login(@Body() req: MemberLoginDto, @Req() request: Request) {
        const user = await this.prisma.users.findUnique({
            where: {
                email: req.email
            }
        });

        if (!user) throw {
            status: 400,
            message: 'Invalid credentials.'
        };

        const passwordCheck = await bcrypt.compare(req.password, user.password);
        if (!passwordCheck) throw {
            status: 400,
            message: 'Invalid credentials.'
        };

        if (user.role !== (process.env.ROLE_MEMBER_VALUE ?? 'ROLE_MEMBER')) throw {
            status: 403,
            message: 'Invalid role.'
        };

        // check activation if needed
        if (process.env.LOGIN_ACTIVATION_CODE === 'true') {
            const activation = await this.prisma.members_activation_codes.findFirst({
                where: {
                    user_id: user.id,
                    is_active: true
                }
            });

            if (!activation) throw {
                status: 403,
                message: 'Access requires activation'
            };
        }

        const tokenData = await this.auth.signMemberToken(
            {
                id: user.id,
                role: user.role
            },
            request.ip,
            request.get('user-agent') ?? ''
        );

        return tokenData;
    }

    // POST /api/v1/auth/refresh (public)
    @Post('refresh')
    async refresh(@Req() req: Request) {
        const oldToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || '';
        if (!oldToken) throw { status: 401, message: 'Token missing' };

        const access = await this.prisma.members_access_logs.findFirst({ where: { token: oldToken } });
        if (!access || access.is_terminated) throw { status: 401, message: 'Token invalid or expired' };

        const user = await this.prisma.users.findUnique({ where: { id: access.user_id } });
        if (!user) throw { status: 401, message: 'Token user not found' };

        const refreshed = await this.auth.signMemberToken({ id: user.id, role: user.role }, req.ip, req.get('user-agent') ?? '');

        await this.prisma.members_access_logs.update({
            where: { id: access.id },
            data: { token: refreshed.token, refresh_count: (access.refresh_count ?? 0) + 1, expires_at: new Date(Date.now() + Number(process.env.JWT_MEMBER_MINUTES ?? 60) * 60 * 1000), updated_at: new Date() },
        });

        return { token: refreshed.token, token_expired: oldToken, expires_in: refreshed.expires_in };
    }

    // POST /api/v1/auth/logout (public)
    @Post('logout')
    async logout(@Req() req: Request) {
        const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || '';
        if (!token) return { status: 401, message: 'Token missing' };

        const access = await this.prisma.members_access_logs.findFirst({ where: { token } });
        if (!access) return { status: 401, message: 'Token invalid or expired' };

        await this.prisma.members_access_logs.update({ where: { id: access.id }, data: { is_terminated: true, updated_at: new Date() } });

        return { token_expired: access.token };
    }

    // GET /api/v1/auth/whoami (authenticated member-only)
    @Get('whoami')
    @UseGuards(MemberAuthGuard)
    async whoami(@Req() req: any) {
        const user = await this.prisma.users.findUnique({
            where: {
                id: req.user.id
            },
            include: {
                members: true,
                members_profile: true
            }
        });

        if (!user) return { status: 401, message: 'Token invalid or expired ???' };

        // if members is an array, take the first member (adjust logic if needed)
        const member = Array.isArray(user.members) ? user.members[0] : (user.members as any);
        const member_profile = Array.isArray(user.members_profile) ? user.members_profile[0] : (user.members_profile as any);

        return {
            email: user.email,
            uid: member.uid.toString(),
            nickname: member_profile?.nickname,
            avatar: member_profile?.avatar,
            token: req.access?.token,
        };
    }
}
