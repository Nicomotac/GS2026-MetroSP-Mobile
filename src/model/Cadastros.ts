/** Espelha EstacaoResponse da API Java. */
export interface Estacao {
  id: number;
  nome: string;
  ordem: number;
  linha: string | null;
  ativa: string | null;
  sentido: string | null;
}

/** Espelha FuncionarioResponse da API Java. */
export interface Funcionario {
  id: number;
  nome: string;
  email?: string;
  cargo?: string;
}

/** Formato Page do Spring Data: o app só usa `content`. */
export interface Pagina<T> {
  content: T[];
}
