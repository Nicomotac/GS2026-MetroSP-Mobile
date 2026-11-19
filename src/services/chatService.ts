import { TIMEOUT_IA_MS } from '../config';
import type { PerguntaChat, RespostaChat } from '../model/Chat';
import { api } from './api';

/**
 * POST /api/chat: a API Java repassa a pergunta para a OpenAI usando a chave
 * configurada no Azure (OPENAI_API_KEY). O app nunca recebe nem envia essa chave.
 */
export const chatService = {
  async perguntar(dados: PerguntaChat): Promise<RespostaChat> {
    const { data } = await api.post<RespostaChat>('/api/chat', dados, { timeout: TIMEOUT_IA_MS });
    return data;
  },
};
