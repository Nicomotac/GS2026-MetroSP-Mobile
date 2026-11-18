export type Perfil = 'ADMIN' | 'USER';

/** Sessão autenticada retornada por POST /api/auth/login. */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  token: string;
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface CadastroUsuario {
  nome: string;
  email: string;
  senha: string;
}

/** Passageiro (T_USUARIO) como a API devolve. */
export interface Passageiro {
  id: number;
  nome: string;
  email: string;
}

export interface PassageiroPayload {
  nome: string;
  email: string;
  senha?: string;
}
