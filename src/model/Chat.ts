/** Espelha ChatRequest.Turno da API Java. */
export interface TurnoChat {
  papel: 'usuario' | 'assistente';
  conteudo: string;
}

/** Espelha ChatRequest: mensagem até 1000 caracteres, histórico com no máximo 8 turnos. */
export interface PerguntaChat {
  mensagem: string;
  ocorrenciaId: number | null;
  historico: TurnoChat[];
}

/** Espelha ChatResponse. */
export interface RespostaChat {
  ocorrenciaId: number | null;
  resposta: string;
}

export interface MensagemTela {
  id: string;
  autor: 'usuario' | 'assistente' | 'sistema';
  texto: string;
}

export const LIMITE_MENSAGEM = 1000;
export const LIMITE_HISTORICO = 8;
