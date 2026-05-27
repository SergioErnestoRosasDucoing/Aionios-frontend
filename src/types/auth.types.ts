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

export interface AuthResponse {
  user: User;
  token: string;
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
