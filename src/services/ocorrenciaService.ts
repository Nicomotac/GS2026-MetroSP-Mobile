import type { Ocorrencia, OcorrenciaPayload } from '../model/Ocorrencia';
import type { Pagina } from '../model/Pagina';
import { api } from './api';

export const ocorrenciaService = {
  /** Lista as ocorrências mais recentes; filtra por estação quando informado. */
  async listar(estacaoId?: number | null): Promise<Ocorrencia[]> {
    const response = await api.get<Pagina<Ocorrencia>>('/api/ocorrencias', {
      params: { page: 0, size: 50, sort: 'dataInicio,desc', estacaoId: estacaoId ?? undefined },
    });
    return response.data.content ?? [];
  },

  async criar(dados: OcorrenciaPayload): Promise<Ocorrencia> {
    const response = await api.post<Ocorrencia>('/api/ocorrencias', dados);
    return response.data;
  },

  async atualizar({ id, dados }: { id: number; dados: OcorrenciaPayload }): Promise<Ocorrencia> {
    const response = await api.put<Ocorrencia>(`/api/ocorrencias/${id}`, dados);
    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/api/ocorrencias/${id}`);
  },
};
