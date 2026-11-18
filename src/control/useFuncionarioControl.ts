import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FuncionarioPayload } from '../model/Funcionario';
import { funcionarioService } from '../services/funcionarioService';

/** Somente ADMIN consulta funcionários (a API retorna 403 para USER). */
export function useFuncionarios(habilitado = true) {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: funcionarioService.listar,
    enabled: habilitado,
  });
}

export function useOperacoesFuncionario() {
  const queryClient = useQueryClient();
  const atualizarLista = () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] });

  const criar = useMutation({
    mutationFn: (dados: FuncionarioPayload) => funcionarioService.criar(dados),
    onSuccess: atualizarLista,
  });
  const atualizar = useMutation({
    mutationFn: funcionarioService.atualizar,
    onSuccess: atualizarLista,
  });
  const excluir = useMutation({
    mutationFn: (id: number) => funcionarioService.excluir(id),
    onSuccess: atualizarLista,
  });

  return { criar, atualizar, excluir };
}
