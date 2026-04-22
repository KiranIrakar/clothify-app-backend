/**
 * PERMISSION SYSTEM
 * -----------------
 * Each role is assigned a list of permissions.
 * SUPERADMIN gets all permissions automatically.
 *
 * When a user signs up, they are assigned a role.
 * That role determines what they can do in the app.
 */

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  STORE_OWNER: "STORE_OWNER",
  USER: "ROLE_USER",
} as const;

/**
 * Short code aliases for roles — use in checkPermission(['SA'], ['R'])
 *   SA  → SUPERADMIN
 *   A   → ADMIN
 *   O   → STORE_OWNER
 *   ST  → STORE_OWNER  (Store Staff / Store Team)
 *   U   → ROLE_USER
 */
export const ROLE_ALIASES: Record<string, string> = {
  SA:  ROLES.SUPERADMIN,
  A:   ROLES.ADMIN,
  O:   ROLES.STORE_OWNER,
  ST:  ROLES.STORE_OWNER,
  U:   ROLES.USER,
};

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Define all possible permissions ─────────────────────────────────────────
export const PERMISSIONS = {
  // Products
  PRODUCT_READ:   "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",

  // Stores
  STORE_READ:   "store:read",
  STORE_CREATE: "store:create",

  // Orders
  ORDER_READ:   "order:read",
  ORDER_CREATE: "order:create",
  ORDER_UPDATE: "order:update",

  // Users
  USER_READ:       "user:read",
  USER_MANAGE:     "user:manage",    // assign roles, deactivate users etc.
} as const;

/**
 * Short code aliases for permissions — use in checkPermission(['O'], ['R', 'VTO'])
 *   R   → product:read
 *   C   → product:create
 *   U   → product:update
 *   D   → product:delete
 *   SR  → store:read
 *   SC  → store:create
 *   OR  → order:read
 *   OC  → order:create
 *   VTO → order:read   (View To Order)
 *   UR  → user:read
 *   UM  → user:manage
 */
export const PERMISSION_ALIASES: Record<string, string> = {
  R:   PERMISSIONS.PRODUCT_READ,
  C:   PERMISSIONS.PRODUCT_CREATE,
  U:   PERMISSIONS.PRODUCT_UPDATE,
  D:   PERMISSIONS.PRODUCT_DELETE,
  SR:  PERMISSIONS.STORE_READ,
  SC:  PERMISSIONS.STORE_CREATE,
  OR:  PERMISSIONS.ORDER_READ,
  OC:  PERMISSIONS.ORDER_CREATE,
  VTO: PERMISSIONS.ORDER_READ,   // View To Order
  UR:  PERMISSIONS.USER_READ,
  UM:  PERMISSIONS.USER_MANAGE,
};

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Map: Role → Permissions ──────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // SUPERADMIN gets every permission
  SUPERADMIN: Object.values(PERMISSIONS) as Permission[],

  // ADMIN can manage products, view stores/users, and manage orders
  ADMIN: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.USER_READ,
  ],

  // STORE_OWNER can manage their own store, products and orders
  STORE_OWNER: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.STORE_CREATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
  ],

  // Normal customer — read only
  ROLE_USER: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.STORE_READ,
    PERMISSIONS.ORDER_READ,
  ],
};

/**
 * Check if a role has a given permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return false;
  return perms.includes(permission);
}
