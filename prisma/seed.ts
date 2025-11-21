import { PrismaClient } from '@prisma/client';
import { seedGeo } from './../src/domain/geo/database/seeders/geo.seed';
import { seedAdmin } from './../src/domain/admin/database/seeders/admin.seed';
import { seedMember } from './../src/domain/member/database/seeders/member.seed';
import { seedMemberModerationTypes } from './../src/domain/member/database/seeders/member_moderation_types.seed';
import { seedMemberNotificationTypes } from './../src/domain/member/database/seeders/member_notification_types.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeds...');

    await seedGeo();
    await seedAdmin();
    await seedMember();
    await seedMemberModerationTypes();
    await seedMemberNotificationTypes();

    console.log('Seed completed.');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
