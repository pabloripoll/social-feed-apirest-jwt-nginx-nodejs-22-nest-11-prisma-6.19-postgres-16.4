import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function notificationTypes() {
    return [
        {
            key: 'new-following-post',
            title: 'New following post',
            message_singular: 'New post from @<member>.',
            message_multiple: 'New posts from @<member> and others <count> members.',
        },
        {
            key: 'new-post-vote',
            title: 'New post vote',
            message_singular: 'New vote from @<member> on <post-title>.',
            message_multiple:
                'New votes from @<member> and others <count> members on <post-title>.',
        },
    ] as Array<{
        key: string;
        title: string;
        message_singular: string;
        message_multiple: string;
    }>;
}

/**
 * Seed member notification types into the DB.
 * - Idempotent: safe to run multiple times.
 * - Uses upsert by `key` to mirror Laravel's updateOrCreate.
 */
export async function seedMemberNotificationTypes() {
    const types = notificationTypes();
    console.log('Seeding member notification types...');

    for (const t of types) {
        await prisma.members_notification_types.upsert({
            where: { key: t.key },
            create: {
                key: t.key,
                title: t.title,
                message_singular: t.message_singular,
                message_multiple: t.message_multiple,
                created_at: new Date(),
                updated_at: new Date(),
            },
            update: {
                title: t.title,
                message_singular: t.message_singular,
                message_multiple: t.message_multiple,
                updated_at: new Date(),
            },
        });
        console.log(`  ensured: ${t.key}`);
    }

    console.log('Member notification types seeding complete.');
}

export default seedMemberNotificationTypes;

if (require.main === module) {
    seedMemberNotificationTypes()
        .catch((e) => {
            console.error('Seeder failed:', e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}