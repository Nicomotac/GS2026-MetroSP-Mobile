import type { Estacao, Funcionario, Pagina } from '../model/Cadastros';
import { api } from './api';

export const estacaoService = {
  /** GET /api/estacoes (público). */
  async listar(): Promise<Estacao[]> {
    const { data } = await api.get<Pagina<Estacao>>('/api/estacoes', {
      params: { page: 0, size: 200, sort: 'nome' },
    });
    return data.content ?? [];
  },
};

export const funcionarioService = {
  /** GET /api/funcionarios: a API só libera para ROLE_ADMIN. */
  async listar(): Promise<Funcionario[]> {
    const { data } = await api.get<Pagina<Funcionario>>('/api/funcionarios', {
      params: { page: 0, size: 200, sort: 'nome' },
    });
    return data.content ?? [];
  },
};
