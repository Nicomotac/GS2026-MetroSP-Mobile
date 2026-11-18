import type { Orientacao } from '../model/Ocorrencia';
import { api } from './api';

/**
 * GET /api/ocorrencias/{id}/orientacao — a API (Spring AI) usa os dados reais
 * da ocorrência e da estação para gerar uma orientação ao passageiro.
 */
export async function obterOrientacao(ocorrenciaId: number): Promise<Orientacao> {
  const response = await api.get<Orientacao>(`/api/ocorrencias/${ocorrenciaId}/orientacao`, {
    timeout: 60000,
  });
  return response.data;
}
