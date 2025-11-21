import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function moderationTypes() {
    return [
        {
            key: 'user-banned',
            title: 'User Banned',
            description: 'User access and its content forbidden.',
        },
        {
            key: 'user-suspension',
            title: 'User Suspension',
            description: 'User access suspension for a determined period of time.',
        },
        {
            key: 'post-banned',
            title: 'Post Banned',
            description: 'Post access forbidden.',
        },
        {
            key: 'post-suspension',
            title: 'Post Suspension',
            description:
                'Post suspended due to non-compliance with community standards and/or quality protocol.',
        },
    ] as Array<{ key: string; title: string; description: string }>;
}

/**
 * Seed member moderation types into the DB.
 * - Idempotent: safe to run multiple times.
 * - Uses upsert by `key` for update or create.
 */
export async function seedMemberModerationTypes() {
    const types = moderationTypes();
    console.log('Seeding member moderation types...');
    let pos = 0;

    for (const t of types) {
        pos++;
        await prisma.members_moderation_types.upsert({
            where: { key: t.key },
            create: {
                key: t.key,
                title: t.title,
                description: t.description,
                position: pos,
                created_at: new Date(),
                updated_at: new Date(),
            },
            update: {
                title: t.title,
                description: t.description,
                position: pos,
                updated_at: new Date(),
            },
        });
        console.log(`  ensured: ${t.key} (position=${pos})`);
    }

    console.log('Member moderation types seeding complete.');
}

export default seedMemberModerationTypes;

if (require.main === module) {
    seedMemberModerationTypes()
        .catch((e) => {
            console.error('Seeder failed:', e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
