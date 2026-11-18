export interface Ocorrencia {
  id: number;
  tipoProblema: string;
  mensagem: string;
  status: string;
  dataInicio: string;
  dataFim: string | null;
  estacaoId: number;
  estacao: string;
  funcionarioId: number;
  funcionario: string;
}

export interface OcorrenciaPayload {
  tipoProblema: string;
  mensagem: string;
  status: string;
  /** LocalDateTime sem fuso: 2026-11-17T14:00:00 */
  dataInicio: string;
  dataFim: string | null;
  estacaoId: number;
  funcionarioId: number;
}

export interface Orientacao {
  ocorrenciaId: number;
  orientacao: string;
}

export const STATUS_OCORRENCIA = [
  { valor: 'A', rotulo: 'Aberta', cor: '#C62828' },
  { valor: 'E', rotulo: 'Em atendimento', cor: '#B26A00' },
  { valor: 'R', rotulo: 'Resolvida', cor: '#0F8A5F' },
];

export function infoStatus(status: string) {
  return (
    STATUS_OCORRENCIA.find((item) => item.valor === status) ?? {
      valor: status,
      rotulo: `Status ${status}`,
      cor: '#5B6680',
    }
  );
}
