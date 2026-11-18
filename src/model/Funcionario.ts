export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export interface FuncionarioPayload {
  nome: string;
  cpf: string;
  email: string;
  senha?: string;
  cargo: string;
}
