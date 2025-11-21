export const USER_ROLES = {
    ADMIN: 'ROLE_ADMIN',
    MEMBER: 'ROLE_MEMBER',
} as const;

export type UserRoleString = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Map potentially different role representations to the explicit "ROLE_*" strings.
 * - Accepts either the Prisma enum value (if you use @prisma/client Role),
 *   or a plain string like "ADMIN" or "ROLE_ADMIN".
 */
export function normalizeRole(role: string): UserRoleString {
    const r = String(role).toUpperCase();
    if (r === 'ROLE_ADMIN' || r === 'ADMIN') return USER_ROLES.ADMIN;
    if (r === 'ROLE_MEMBER' || r === 'MEMBER') return USER_ROLES.MEMBER;

    // fallback to MEMBER
    return USER_ROLES.MEMBER;
}
