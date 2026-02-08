export interface User {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  tipo: 'A' | 'U';
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterResponse extends User {
  hash_contrasena?: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  tipo: 'A' | 'U';
  exp: number;
  iat: number;
}