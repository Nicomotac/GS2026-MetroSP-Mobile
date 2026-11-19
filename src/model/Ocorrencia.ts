/** Espelha OcorrenciaResponse da API Java. */
export interface Ocorrencia {
  id: number;
  tipoProblema: string;
  mensagem: string;
  status: string;
  /** LocalDateTime: "2026-11-19T14:00:00" (ou array, dependendo do Jackson). */
  dataInicio: DataApi;
  dataFim: DataApi | null;
  estacaoId: number;
  estacao: string;
  funcionarioId: number;
  funcionario: string;
}

/** Espelha OcorrenciaRequest da API Java (todos os campos são enviados no POST e no PUT). */
export interface OcorrenciaPayload {
  tipoProblema: string; // obrigatório, até 100 caracteres
  mensagem: string; // obrigatório
  status: string; // uma letra maiúscula: A, E ou R
  dataInicio: string; // "AAAA-MM-DDTHH:mm:ss", sem fuso
  dataFim: string | null; // opcional, não pode ser antes do início
  estacaoId: number; // id real de T_ESTACAO
  funcionarioId: number; // id real de T_FUNCIONARIO
}

export interface Orientacao {
  ocorrenciaId: number;
  orientacao: string;
}

export type DataApi = string | number[];

export const STATUS_OCORRENCIA = [
  { valor: 'A', rotulo: 'Aberta', cor: '#C62828' },
  { valor: 'E', rotulo: 'Em atendimento', cor: '#B26A00' },
  { valor: 'R', rotulo: 'Resolvida', cor: '#0F8A5F' },
] as const;

export function infoStatus(status: string) {
  return (
    STATUS_OCORRENCIA.find((item) => item.valor === status) ?? {
      valor: status,
      rotulo: `Status ${status}`,
      cor: '#5B6680',
    }
  );
}

export const TIPOS_PROBLEMA = [
  'Escada rolante parada',
  'Elevador fora de operação',
  'Superlotação',
  'Falha de energia',
  'Trem com velocidade reduzida',
  'Acessibilidade',
  'Segurança',
  'Limpeza',
];
