import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from './../../../user/model/roles';
import { randomAlphaNum, generateUniqueUid } from '../../../../features/utils/random';

const prisma = new PrismaClient();


export async function seedAdmin() {
    const email = 'admin@example.com';
    const plainPassword = '12345678aZ!';

    console.log('Seeding admin user...');

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
            where: { name: 'Western' },
        });
        regionId = region ? region.id : null;
    }

    if (!regionId) {
        console.warn('  warning: region "Western" (Europe) not found — admin.region_id will be null.');
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
                role: USER_ROLES.ADMIN,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created user ${email} (id=${user.id})`);
    } else {
        // Optionally ensure role/password are set/updated; here we keep as-is to avoid resetting password on each seed
        console.log(`  found existing user ${email} (id=${user.id})`);
    }

    // 3) Create or update Admin record for this user (match by user_id)
    // Use findFirst to avoid requiring a unique constraint on user_id; update if found, create if not.
    const existingAdmin = await prisma.admins.findFirst({
        where: {
            user_id: user.id
        },
    });

    if (existingAdmin) {
        await prisma.admins.update({
            where: {
                id: existingAdmin.id
            },
            data: {
                region_id: regionId,
                updated_at: new Date(),
            },
        });
        console.log(`  updated admin record for user_id=${user.id}`);

    } else {
        const uid = await generateUniqueUid(6, 1000,
            async (uid: number) => Boolean(await prisma.admins.findFirst({ where: { uid } }))
        );

        await prisma.admins.create({
            data: {
                user_id: user.id,
                uid: uid,
                region_id: regionId,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created admin record for user_id=${user.id}`);
    }

    // 4) Admin profile: updateOrCreate by nickname 'admin'
    const existingProfile = await prisma.admins_profile.findFirst({
        where: { nickname: 'admin' },
    });

    if (existingProfile) {
        await prisma.admins_profile.update({
            where: { id: existingProfile.id },
            data: { user_id: user.id },
        });
        console.log(`  updated profile (nickname=admin) -> user_id=${user.id}`);
    } else {
        await prisma.admins_profile.create({
            data: {
                nickname: 'admin',
                user_id: user.id,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  created profile (nickname=admin) -> user_id=${user.id}`);
    }

    console.log('Admin seeding complete.');
}

export default seedAdmin;

if (require.main === module) {
    seedAdmin()
        .catch((e) => {
            console.error('Seed failed:', e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
