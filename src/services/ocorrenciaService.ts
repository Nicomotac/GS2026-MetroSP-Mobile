import { TIMEOUT_IA_MS } from '../config';
import type { Pagina } from '../model/Cadastros';
import type { Ocorrencia, OcorrenciaPayload, Orientacao } from '../model/Ocorrencia';
import { api } from './api';

export const ocorrenciaService = {
  /** GET /api/ocorrencias (público), mais recentes primeiro. */
  async listar(): Promise<Ocorrencia[]> {
    const { data } = await api.get<Pagina<Ocorrencia>>('/api/ocorrencias', {
      params: { page: 0, size: 100, sort: 'dataInicio,desc' },
    });
    return data.content ?? [];
  },

  /** GET /api/ocorrencias/{id} (público). */
  async buscar(id: number): Promise<Ocorrencia> {
    const { data } = await api.get<Ocorrencia>(`/api/ocorrencias/${id}`);
    return data;
  },

  /** POST /api/ocorrencias → 201 com a ocorrência criada. */
  async criar(dados: OcorrenciaPayload): Promise<Ocorrencia> {
    const { data } = await api.post<Ocorrencia>('/api/ocorrencias', dados);
    return data;
  },

  /** PUT /api/ocorrencias/{id} → corpo completo, igual ao POST. */
  async atualizar(id: number, dados: OcorrenciaPayload): Promise<Ocorrencia> {
    const { data } = await api.put<Ocorrencia>(`/api/ocorrencias/${id}`, dados);
    return data;
  },

  /** DELETE /api/ocorrencias/{id} → 204. */
  async excluir(id: number): Promise<void> {
    await api.delete(`/api/ocorrencias/${id}`);
  },

  /** GET /api/ocorrencias/{id}/orientacao → orientação gerada pela IA no servidor. */
  async orientacao(id: number): Promise<Orientacao> {
    const { data } = await api.get<Orientacao>(`/api/ocorrencias/${id}/orientacao`, {
      timeout: TIMEOUT_IA_MS,
    });
    return data;
  },
};
