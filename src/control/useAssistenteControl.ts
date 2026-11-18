import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { mensagemErroApi } from '../services/api';
import { obterOrientacao } from '../services/iaService';
import { useOcorrencias } from './useOcorrenciaControl';

/** Assistente com IA: o passageiro escolhe uma ocorrência e recebe orientação do Spring AI. */
export function useAssistenteControl(ocorrenciaInicial?: number) {
  const ocorrencias = useOcorrencias();
  const [selecionadaId, setSelecionadaId] = useState<number | null>(ocorrenciaInicial ?? null);

  const orientacao = useMutation({ mutationFn: obterOrientacao });

  useEffect(() => {
    if (ocorrenciaInicial) setSelecionadaId(ocorrenciaInicial); // eslint-disable-line react-hooks/set-state-in-effect
  }, [ocorrenciaInicial]);

  const selecionada = (ocorrencias.data ?? []).find((o) => o.id === selecionadaId) ?? null;

  function selecionar(id: number) {
    setSelecionadaId(id);
    orientacao.reset();
  }

  function perguntar() {
    if (selecionadaId) orientacao.mutate(selecionadaId);
  }

  return {
    ocorrencias,
    selecionada,
    selecionar,
    perguntar,
    resposta: orientacao.data?.orientacao ?? null,
    carregando: orientacao.isPending,
    erro: orientacao.isError ? mensagemErroApi(orientacao.error) : '',
  };
}
