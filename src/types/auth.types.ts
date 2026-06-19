export const ROLES = {
  SUPERADMIN:     1,
  BUSINESS_OWNER: 2,
  CLIENT:         3,
  COLABORADOR:    4,
} as const;

export type RoleId = typeof ROLES[keyof typeof ROLES];

export const BUSINESS_ROLE_IDS: RoleId[] = [ROLES.SUPERADMIN, ROLES.BUSINESS_OWNER, ROLES.COLABORADOR];
export const CLIENT_ROLE_IDS:   RoleId[] = [ROLES.CLIENT];

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  id_rol: RoleId;
  rol?: Role;
}

export interface Role {
  id: number;
  nombre: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  id_rol: number;
}
