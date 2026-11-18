import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EstacaoPayload } from '../model/Estacao';
import { estacaoService } from '../services/estacaoService';

export function useEstacoes() {
  return useQuery({ queryKey: ['estacoes'], queryFn: estacaoService.listar });
}

export function useOperacoesEstacao() {
  const queryClient = useQueryClient();
  const atualizarLista = () => queryClient.invalidateQueries({ queryKey: ['estacoes'] });

  const criar = useMutation({
    mutationFn: (dados: EstacaoPayload) => estacaoService.criar(dados),
    onSuccess: atualizarLista,
  });
  const atualizar = useMutation({
    mutationFn: estacaoService.atualizar,
    onSuccess: atualizarLista,
  });
  const excluir = useMutation({
    mutationFn: (id: number) => estacaoService.excluir(id),
    onSuccess: atualizarLista,
  });

  return { criar, atualizar, excluir };
}
