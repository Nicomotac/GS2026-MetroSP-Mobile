import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OcorrenciaPayload } from '../model/Ocorrencia';
import { ocorrenciaService } from '../services/ocorrenciaService';

export function useOcorrencias(estacaoId?: number | null) {
  return useQuery({
    queryKey: ['ocorrencias', estacaoId ?? 'todas'],
    queryFn: () => ocorrenciaService.listar(estacaoId),
  });
}

export function useOperacoesOcorrencia() {
  const queryClient = useQueryClient();
  const atualizarLista = () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });

  const criar = useMutation({
    mutationFn: (dados: OcorrenciaPayload) => ocorrenciaService.criar(dados),
    onSuccess: atualizarLista,
  });
  const atualizar = useMutation({
    mutationFn: ocorrenciaService.atualizar,
    onSuccess: atualizarLista,
  });
  const excluir = useMutation({
    mutationFn: (id: number) => ocorrenciaService.excluir(id),
    onSuccess: atualizarLista,
  });

  return { criar, atualizar, excluir };
}
