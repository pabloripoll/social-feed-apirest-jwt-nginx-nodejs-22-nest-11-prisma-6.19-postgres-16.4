import crypto from 'crypto';

/**
 * Random alphanumeric string generator (cryptographically strong).
 */
export function randomAlphaNum(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) {
        out += chars[bytes[i] % chars.length];
    }
    return out;
}

/**
 * Generate a unique numeric UID with the specified number of digits.
 * - existsFn should return true if the uid already exists in the DB.
 * - This keeps the function independent of Prisma and reusable across models.
 *
 * Example existsFn: async (uid) => Boolean(await prisma.members.findFirst({ where: { uid } }))
 */
export async function generateUniqueUid(
    digits = 6,
    maxAttempts = 1000,
    existsFn: (uid: number) => Promise<boolean>,
): Promise<number> {
    const min = 10 ** (digits - 1); // 100000 for 6 digits
    const max = 10 ** digits - 1;   // 999999 for 6 digits

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const uid = crypto.randomInt(min, max + 1);
        const exists = await existsFn(uid);

        if (!exists) return uid;
    }

    throw new Error(`Failed to generate unique ${digits}-digit uid after ${maxAttempts} attempts`);
}
