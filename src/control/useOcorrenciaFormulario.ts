import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import type { Ocorrencia, OcorrenciaPayload } from '../model/Ocorrencia';
import { mensagemErroApi } from '../services/api';
import { agoraFormatado, formatarDataHora, paraDataApi } from '../utils/datas';
import { ehErroValidacao, ocorrenciaSchema, primeiraMensagemYup } from '../validation/schemas';
import { useEstacoes } from './useEstacaoControl';
import { useFuncionarios } from './useFuncionarioControl';
import { useOcorrencias, useOperacoesOcorrencia } from './useOcorrenciaControl';

export const TIPOS_PROBLEMA = [
  'Escada rolante parada',
  'Elevador fora de operação',
  'Superlotação',
  'Falha de energia',
  'Trem com velocidade reduzida',
  'Acessibilidade',
  'Segurança',
];

function formularioVazio(funcionarioId: number) {
  return {
    tipoProblema: '',
    mensagem: '',
    status: 'A',
    dataInicio: agoraFormatado(),
    dataFim: '',
    estacaoId: 0,
    funcionarioId,
  };
}

export function useOcorrenciaFormulario() {
  const { usuario } = useAuth();
  const admin = usuario?.perfil === 'ADMIN';
  const [filtroEstacao, setFiltroEstacao] = useState<number | null>(null);
  const ocorrencias = useOcorrencias(filtroEstacao);
  const estacoes = useEstacoes();
  const funcionarios = useFuncionarios(admin);
  const { criar, atualizar, excluir } = useOperacoesOcorrencia();
  // O responsável padrão é o próprio funcionário logado.
  const [form, setForm] = useState(formularioVazio(admin ? (usuario?.id ?? 0) : 0));
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const pendente = criar.isPending || atualizar.isPending || excluir.isPending;

  function limpar() {
    setForm(formularioVazio(usuario?.id ?? 0));
    setEditandoId(null);
    setErro('');
  }

  function editar(ocorrencia: Ocorrencia) {
    setForm({
      tipoProblema: ocorrencia.tipoProblema,
      mensagem: ocorrencia.mensagem,
      status: ocorrencia.status,
      dataInicio: formatarDataHora(ocorrencia.dataInicio),
      dataFim: ocorrencia.dataFim ? formatarDataHora(ocorrencia.dataFim) : '',
      estacaoId: ocorrencia.estacaoId,
      funcionarioId: ocorrencia.funcionarioId,
    });
    setEditandoId(ocorrencia.id);
    setErro('');
  }

  function alterarStatus(status: string) {
    // Ao marcar como resolvida, sugere a data de encerramento.
    setForm((atual) => ({
      ...atual,
      status,
      dataFim: status === 'R' && !atual.dataFim ? agoraFormatado() : atual.dataFim,
    }));
  }

  async function salvar() {
    if (!admin || pendente) return;
    setErro('');
    const dataInicio = paraDataApi(form.dataInicio);
    const dataFim = form.dataFim.trim() ? paraDataApi(form.dataFim) : null;
    try {
      if (form.dataFim.trim() && !dataFim) {
        throw new Error('Informe o encerramento no formato DD/MM/AAAA HH:mm.');
      }
      if (dataInicio && dataFim && dataFim < dataInicio) {
        throw new Error('O encerramento deve ser depois do início.');
      }
      const dados: OcorrenciaPayload = {
        tipoProblema: form.tipoProblema.trim(),
        mensagem: form.mensagem.trim(),
        status: form.status,
        dataInicio: dataInicio ?? '',
        dataFim,
        estacaoId: form.estacaoId,
        funcionarioId: form.funcionarioId,
      };
      await ocorrenciaSchema.validate({ ...dados, dataInicio });
      if (editandoId !== null) {
        await atualizar.mutateAsync({ id: editandoId, dados });
        Alert.alert('Ocorrência atualizada');
      } else {
        await criar.mutateAsync(dados);
        Alert.alert('Ocorrência registrada', 'Os passageiros já podem consultá-la no app.');
      }
      limpar();
    } catch (error) {
      if (ehErroValidacao(error)) setErro(primeiraMensagemYup(error));
      else if (error instanceof Error && !('isAxiosError' in error)) setErro(error.message);
      else setErro(mensagemErroApi(error));
    }
  }

  function confirmarExclusao(id: number) {
    if (!admin || pendente) return;
    Alert.alert('Excluir ocorrência?', 'O registro será removido permanentemente.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluir.mutateAsync(id);
            Alert.alert('Ocorrência excluída', 'O registro foi removido da API.');
          } catch (error) {
            Alert.alert('Não foi possível excluir', mensagemErroApi(error));
          }
        },
      },
    ]);
  }

  return {
    admin,
    ocorrencias,
    estacoes,
    funcionarios,
    filtroEstacao,
    setFiltroEstacao,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    alterarStatus,
    salvar,
    confirmarExclusao,
  };
}
