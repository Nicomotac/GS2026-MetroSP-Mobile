import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import type { Estacao, EstacaoPayload } from '../model/Estacao';
import { mensagemErroApi } from '../services/api';
import { ehErroValidacao, estacaoSchema, primeiraMensagemYup } from '../validation/schemas';
import { useEstacoes, useOperacoesEstacao } from './useEstacaoControl';

export const LINHAS = ['Azul', 'Verde', 'Vermelha', 'Amarela', 'Lilás', 'Prata'];
const vazio = { nome: '', ordem: '', linha: 'Azul', ativa: 'S' as 'S' | 'N', sentido: '' };

export function useEstacaoFormulario() {
  const { usuario } = useAuth();
  const admin = usuario?.perfil === 'ADMIN';
  const estacoes = useEstacoes();
  const { criar, atualizar, excluir } = useOperacoesEstacao();
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const pendente = criar.isPending || atualizar.isPending || excluir.isPending;

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = estacoes.data ?? [];
    return termo ? lista.filter((e) => e.nome.toLowerCase().includes(termo)) : lista;
  }, [estacoes.data, busca]);

  function limpar() {
    setForm({ ...vazio });
    setEditandoId(null);
    setErro('');
  }

  function editar(estacao: Estacao) {
    setForm({
      nome: estacao.nome,
      ordem: String(estacao.ordem),
      linha: estacao.linha ?? 'Azul',
      ativa: estacao.ativa === 'N' ? 'N' : 'S',
      sentido: estacao.sentido ?? '',
    });
    setEditandoId(estacao.id);
    setErro('');
  }

  async function salvar() {
    if (!admin || pendente) return;
    setErro('');
    const dados: EstacaoPayload = {
      nome: form.nome.trim(),
      ordem: Number(form.ordem),
      linha: form.linha,
      ativa: form.ativa,
      sentido: form.sentido.trim().toUpperCase() || null,
    };
    try {
      await estacaoSchema.validate({ ...dados, ordem: form.ordem.trim() || undefined });
      if (editandoId !== null) {
        await atualizar.mutateAsync({ id: editandoId, dados });
        Alert.alert('Estação atualizada', dados.nome);
      } else {
        await criar.mutateAsync(dados);
        Alert.alert('Estação cadastrada', dados.nome);
      }
      limpar();
    } catch (error) {
      setErro(ehErroValidacao(error) ? primeiraMensagemYup(error) : mensagemErroApi(error));
    }
  }

  function confirmarExclusao(estacao: Estacao) {
    if (!admin || pendente) return;
    Alert.alert('Excluir estação?', `${estacao.nome} será removida permanentemente.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluir.mutateAsync(estacao.id);
          } catch (error) {
            Alert.alert('Não foi possível excluir', mensagemErroApi(error));
          }
        },
      },
    ]);
  }

  return {
    admin,
    estacoes,
    filtradas,
    busca,
    setBusca,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    salvar,
    confirmarExclusao,
  };
}
