import type { Funcionario, FuncionarioPayload } from '../model/Funcionario';
import type { Pagina } from '../model/Pagina';
import { api } from './api';

export const funcionarioService = {
  async listar(): Promise<Funcionario[]> {
    const response = await api.get<Pagina<Funcionario>>('/api/funcionarios', {
      params: { page: 0, size: 100, sort: 'nome' },
    });
    return response.data.content ?? [];
  },

  async buscar(id: number): Promise<Funcionario> {
    const response = await api.get<Funcionario>(`/api/funcionarios/${id}`);
    return response.data;
  },

  async criar(dados: FuncionarioPayload): Promise<Funcionario> {
    const response = await api.post<Funcionario>('/api/funcionarios', dados);
    return response.data;
  },

  async atualizar({ id, dados }: { id: number; dados: FuncionarioPayload }): Promise<Funcionario> {
    const response = await api.put<Funcionario>(`/api/funcionarios/${id}`, dados);
    return response.data;
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/api/funcionarios/${id}`);
  },
};
