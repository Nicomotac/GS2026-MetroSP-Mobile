import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PassageiroPayload } from '../model/Usuario';
import { usuarioService } from '../services/usuarioService';

export function usePassageiros() {
  return useQuery({ queryKey: ['passageiros'], queryFn: usuarioService.listar });
}

export function useOperacoesPassageiro() {
  const queryClient = useQueryClient();
  const atualizarLista = () => queryClient.invalidateQueries({ queryKey: ['passageiros'] });

  const criar = useMutation({
    mutationFn: (dados: PassageiroPayload) => usuarioService.criar(dados),
    onSuccess: atualizarLista,
  });
  const atualizar = useMutation({
    mutationFn: usuarioService.atualizar,
    onSuccess: atualizarLista,
  });
  const excluir = useMutation({
    mutationFn: (id: number) => usuarioService.excluir(id),
    onSuccess: atualizarLista,
  });

  return { criar, atualizar, excluir };
}
