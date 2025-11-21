import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function geoData() {
    return {
        Europe: ['Eastern', 'Northern', 'Southern', 'Western'],
        Africa: ['Eastern', 'Middle', 'Northern', 'Southern', 'Western'],
        Americas: ['Caribbean', 'Central', 'Northern', 'South'],
        Asia: ['Central', 'Eastern', 'South-Eastern', 'Southern', 'Western'],
        Oceania: ['Australia and New Zealand', 'Melanesia', 'Micronesia', 'Polynesia'],
    } as Record<string, string[]>;
}

export async function seedGeo() {
    const data = geoData();

    console.log('Seeding geo continents and regions...');

    for (const [continentName, regions] of Object.entries(data)) {
        // Upsert continent by unique name
        const continent = await prisma.geo_continents.upsert({
            where: { name: continentName },
            create: {
                name: continentName,
                created_at: new Date(),
                updated_at: new Date(),
            },
            update: {
                updated_at: new Date(),
            },
        });

        // Ensure regions are present PER-CONTINENT
        for (const regionName of regions) {
            // Find region that belongs to this continent
            const region = await prisma.geo_regions.findFirst({
                where: {
                    name: regionName,
                    continent_id: continent.id,
                },
            });

            if (region) {
                // Optionally update timestamps
                await prisma.geo_regions.update({
                    where: {
                        id: region.id
                    },
                    data: {
                        updated_at: new Date()
                    },
                });
            } else {
                // Create a new region row for this continent
                await prisma.geo_regions.create({
                    data: {
                        name: regionName,
                        continent_id: continent.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });
            }
        }

        console.log(`  processed continent: ${continentName} (${regions.length} regions)`);
    }

    console.log('Geo seeding complete.');
}

export default seedGeo;

if (require.main === module) {
    seedGeo()
        .catch((e) => {
            console.error('Seed failed:', e);
            process.exitCode = 1;
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
