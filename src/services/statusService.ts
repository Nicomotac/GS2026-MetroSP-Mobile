import { api } from './api';

export interface StatusApi {
  status: string;
  milissegundos: number;
}

/** GET /actuator/health (público): confirma se o Web App está no ar e quanto demora. */
export async function verificarApi(): Promise<StatusApi> {
  const inicio = Date.now();
  const { data } = await api.get<{ status?: string }>('/actuator/health');
  return { status: data?.status ?? 'desconhecido', milissegundos: Date.now() - inicio };
}
