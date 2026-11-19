export type Perfil = 'ADMIN' | 'USER';

/** Resposta de POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  tipo: string;
  perfil: Perfil;
  id: number;
  nome: string;
}

export interface Sessao {
  token: string;
  id: number;
  nome: string;
  email: string;
  /** Perfil que a API devolveu no login (em modo demonstração, passageiros voltam como ADMIN). */
  perfil: Perfil;
  /** Tipo real da conta, lido do JWT (sub = "USER:id" ou "ADMIN:id"). */
  conta: Perfil;
  /** Expiração do token em milissegundos. */
  expiraEm: number;
}
