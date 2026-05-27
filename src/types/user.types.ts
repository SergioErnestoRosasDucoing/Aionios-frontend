export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  id_rol: number;
  rol?: Role;
}

export interface Role {
  id: number;
  nombre: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  id_rol: number;
}

export interface UpdateUserPayload {
  email?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  id_rol?: number;
}

export interface CreateRolePayload {
  nombre: string;
}
