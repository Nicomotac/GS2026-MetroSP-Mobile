export interface Estacao {
  id: number;
  nome: string;
  ordem: number;
  linha: string | null;
  ativa: 'S' | 'N' | null;
  sentido: string | null;
}

export interface EstacaoPayload {
  nome: string;
  ordem: number;
  linha: string | null;
  ativa: 'S' | 'N';
  sentido: string | null;
}
