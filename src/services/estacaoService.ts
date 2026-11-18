import type { Estacao, EstacaoPayload } from '../model/Estacao';
import type { Pagina } from '../model/Pagina';
import { api } from './api';

export const estacaoService = {
  async listar(): Promise<Estacao[]> {
    const response = await api.get<Pagina<Estacao>>('/api/estacoes', {
      params: { page: 0, size: 100, sort: 'ordem' },
    });
    return response.data.content ?? [];
  },

  async criar(dados: EstacaoPayload): Promise<Estacao> {
    const response = await api.post<Estacao>('/api/estacoes', dados);
    return response.data;
  },

  async atualizar({ id, dados }: { id: number; dados: EstacaoPayload }): Promise<Estacao> {
    const response = await api.put<Estacao>(`/api/estacoes/${id}`, dados);
    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/api/estacoes/${id}`);
  },
};
