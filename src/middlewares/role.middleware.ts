import { FastifyReply, FastifyRequest } from "fastify";
import {
  Permission,
  Role,
  ROLES,
  ROLE_PERMISSIONS,
  ROLE_ALIASES,
  PERMISSION_ALIASES,
} from "../config/permissions";

/**
 * Resolves a role string — supports both full names and short codes.
 *   'O'  → 'STORE_OWNER'
 *   'ST' → 'STORE_OWNER'
 *   'A'  → 'ADMIN'
 *   'SA' → 'SUPERADMIN'
 */
function resolveRole(role: string): string {
  return ROLE_ALIASES[role] ?? role;
}

/**
 * Resolves a permission string — supports both full names and short codes.
 *   'R'   → 'product:read'
 *   'VTO' → 'order:read'
 *   'C'   → 'product:create'
 */
function resolvePermission(permission: string): string {
  return PERMISSION_ALIASES[permission] ?? permission;
}

/**
 * Fastify preHandler factory that enforces role-based access control.
 *
 * Usage:
 *   // Full strings
 *   preHandler: [authMiddleware, TokenService.checkPermission(['STORE_OWNER'], ['order:read'])]
 *
 *   // Short codes  ✅
 *   preHandler: [authMiddleware, TokenService.checkPermission(['O', 'ST'], ['R', 'VTO'])]
 *
 * Short code reference:
 *   Roles       → SA (SUPERADMIN), A (ADMIN), O (STORE_OWNER), ST (STORE_OWNER), U (USER)
 *   Permissions → R (read), C (create), U (update), D (delete),
 *                 SR (store:read), SC (store:create),
 *                 OR (order:read), OC (order:create), VTO (order:read),
 *                 UR (user:read), UM (user:manage)
 */
export function checkPermission(
  allowedRoles: (Role | string)[] = [],
  allowedPermissions: (Permission | string)[] = []
) {
  // Resolve short codes once at route registration time (not per request)
  const resolvedRoles = allowedRoles.map(resolveRole);
  const resolvedPermissions = allowedPermissions.map(resolvePermission);

  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user;

    if (!user) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const userRole: string = user.role;

    // 1. SUPERADMIN always passes — no further checks needed
    if (userRole === ROLES.SUPERADMIN) return;

    // 2. Check if user's role is in the allowed roles list
    if (resolvedRoles.includes(userRole)) return;

    // 3. Check if user's role has at least one of the required permissions
    const userPermissions = ROLE_PERMISSIONS[userRole as Role] ?? [];
    const hasPermission = resolvedPermissions.some((p) =>
      userPermissions.includes(p as Permission)
    );
    if (hasPermission) return;

    // ❌ Neither role nor permission matched
    return reply.status(403).send({
      message: `Forbidden: Your role '${userRole}' does not have access to this resource`,
    });
  };
}

export function requirePermission(permission: Permission | string) {
  return checkPermission([], [permission]);
}

/**
 * ✅ TokenService — use this in routes for a clean, readable API:
 *
 *   fastify.post('/orders/list', {
 *     preHandler: [authMiddleware, TokenService.checkPermission(['O', 'ST'], ['R', 'VTO'])]
 *   }, orderController.getAllOrders);
 */
export const TokenService = {
  checkPermission,
  requirePermission,
};
