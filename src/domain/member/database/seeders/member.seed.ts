import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from './../../../user/model/roles';
import { randomAlphaNum, generateUniqueUid } from './../../../../features/utils/random';

const prisma = new PrismaClient();


export async function seedMember() {
    const email = 'member@example.com';
    const plainPassword = '12345678aZ!';

    console.log('Seeding member user...');

    // 1) Find the region id for Western / Europe.
    // We first get the continent by name (safe if geo_continents exists)
    const continent = await prisma.geo_continents.findUnique({
        where: { name: 'Europe' },
    });

    let regionId: number | bigint | null = null;
    if (continent) {
        const region = await prisma.geo_regions.findFirst({
            where: {
                name: 'Western',
                continent_id: continent.id,
            },
        });
        regionId = region ? region.id : null;

    } else {
        // fallback: try to find region by name only
        const region = await prisma.geo_regions.findFirst({
            where: {
                name: 'Western'
            },
        });
        regionId = region ? region.id : null;
    }

    if (!regionId) {
        console.warn('  warning: region "Western" (Europe) not found — member.region_id will be null.');
        return
    } else {
        console.log(`  resolved region id = ${regionId}`);
    }

    // 2) Ensure user exists (find or create)
    let user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) {
        const hashed = await bcrypt.hash(plainPassword, 10);
        user = await prisma.users.create({
            data: {
                email,
                password: hashed,
                role: USER_ROLES.MEMBER,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created user ${email} (id=${user.id})`);
    } else {
        // Optionally ensure role/password are set/updated; here we keep as-is to avoid resetting password on each seed
        console.log(`  found existing user ${email} (id=${user.id})`);
    }

    // 3) Create or update Member record for this user (match by user_id)
    // Use findFirst to avoid requiring a unique constraint on user_id; update if found, create if not.
    const existingMember = await prisma.members.findFirst({
        where: { user_id: user.id },
    });

    if (existingMember) {
        await prisma.members.update({
            where: { id: existingMember.id },
            data: {
                region_id: regionId,
                updated_at: new Date(),
            },
        });
        console.log(`  updated member record for user_id=${user.id}`);
    } else {
        const uid = await generateUniqueUid(6, 1000,
            async (uid: number) => Boolean(await prisma.admins.findFirst({ where: { uid } }))
        );

        await prisma.members.create({
            data: {
                user_id: user.id,
                uid: uid,
                region_id: regionId,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created member record for user_id=${user.id}`);
    }

    // 4) Member activation code: upsert by user_id (findFirst & update/create to avoid unique constraint assumptions)
    const existingActivation = await prisma.members_activation_codes.findFirst({
        where: { user_id: user.id },
    });

    if (existingActivation) {
        await prisma.members_activation_codes.update({
            where: { id: existingActivation.id },
            data: { is_active: true },
        });
        console.log(`  updated activation for user_id=${user.id}`);
    } else {
        const activationCode = randomAlphaNum(32);

        await prisma.members_activation_codes.create({
            data: {
                code: activationCode,
                user_id: user.id,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created activation for user_id=${user.id}`);
    }

    // 5) Member profile: updateOrCreate by nickname 'member'
    const existingProfile = await prisma.members_profile.findFirst({
        where: { nickname: 'member' },
    });

    if (existingProfile) {
        await prisma.members_profile.update({
            where: { id: existingProfile.id },
            data: { user_id: user.id },
        });
        console.log(`  updated profile (nickname=member) -> user_id=${user.id}`);
    } else {
        await prisma.members_profile.create({
            data: {
                nickname: 'member',
                user_id: user.id,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created profile (nickname=member) -> user_id=${user.id}`);
    }

    console.log('Member seeding complete.');
}

export default seedMember;

if (require.main === module) {
    seedMember()
        .catch((e) => {
            console.error('Seed failed:', e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
