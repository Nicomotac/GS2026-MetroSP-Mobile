import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemErro } from '../utils/erros';

interface Estado<T> {
  dados: T | undefined;
  carregando: boolean;
  erro: string | null;
}

/**
 * Busca dados na API sempre que a tela ganha foco (ex.: ao voltar do formulário),
 * com suporte a "puxar para atualizar" e "tentar de novo".
 */
export function useCarregamento<T>(buscar: () => Promise<T>, chave: string | number = '') {
  const [estado, setEstado] = useState<Estado<T>>({ dados: undefined, carregando: true, erro: null });
  const [atualizando, setAtualizando] = useState(false);
  const buscarAtual = useRef(buscar);
  const sequencia = useRef(0);

  useEffect(() => {
    buscarAtual.current = buscar;
  });

  const carregar = useCallback(async (puxou = false) => {
    const id = ++sequencia.current;
    if (puxou) setAtualizando(true);
    try {
      const dados = await buscarAtual.current();
      if (id === sequencia.current) setEstado({ dados, carregando: false, erro: null });
    } catch (error) {
      if (id === sequencia.current) {
        setEstado((atual) => ({ ...atual, carregando: false, erro: mensagemErro(error) }));
      }
    } finally {
      if (id === sequencia.current) setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar, chave]),
  );

  const tentarDeNovo = useCallback(() => {
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
    void carregar();
  }, [carregar]);

  return {
    ...estado,
    atualizando,
    atualizar: () => void carregar(true),
    tentarDeNovo,
  };
}
