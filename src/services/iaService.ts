import type { Orientacao } from '../model/Ocorrencia';
import { api } from './api';

/** Orientação contextual da API existente (sem perguntas livres). */
export async function obterOrientacao(ocorrenciaId: number): Promise<Orientacao> {
  const response = await api.get<Orientacao>(`/api/ocorrencias/${ocorrenciaId}/orientacao`, {
    timeout: 60000,
  });
  return response.data;
}

export type TurnoChat = {
  papel: 'usuario' | 'assistente';
  conteudo: string;
};

export type PerguntaChat = {
  mensagem: string;
  ocorrenciaId: number | null;
  historico: TurnoChat[];
};

export type RespostaChat = { ocorrenciaId: number | null; resposta: string };

/**
 * Chat com perguntas livres. POST /api/chat foi adicionado à versão da API Java
 * entregue separadamente. A chave OpenAI existe SOMENTE no backend.
 */
export async function enviarMensagemChat(dados: PerguntaChat): Promise<RespostaChat> {
  const response = await api.post<RespostaChat>('/api/chat', dados, { timeout: 60000 });
  return response.data;
}
