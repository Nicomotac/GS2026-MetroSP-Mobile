import type { Pagina } from '../model/Pagina';
import type { Passageiro, PassageiroPayload } from '../model/Usuario';
import { api } from './api';

export const usuarioService = {
  /** ADMIN */
  async listar(): Promise<Passageiro[]> {
    const response = await api.get<Pagina<Passageiro>>('/api/usuarios', {
      params: { page: 0, size: 100, sort: 'nome' },
    });
    return response.data.content ?? [];
  },

  /** Próprio USER ou ADMIN */
  async buscar(id: number): Promise<Passageiro> {
    const response = await api.get<Passageiro>(`/api/usuarios/${id}`);
    return response.data;
  },

  /** ADMIN */
  async criar(dados: PassageiroPayload): Promise<Passageiro> {
    const response = await api.post<Passageiro>('/api/usuarios', dados);
    return response.data;
  },

  /** Próprio USER ou ADMIN */
  async atualizar({ id, dados }: { id: number; dados: PassageiroPayload }): Promise<Passageiro> {
    const response = await api.put<Passageiro>(`/api/usuarios/${id}`, dados);
    return response.data;
  },

  /** Próprio USER ou ADMIN */
  async excluir(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },
};
