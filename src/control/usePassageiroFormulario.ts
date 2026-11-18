import { useState } from 'react';
import { Alert } from 'react-native';
import type { Passageiro, PassageiroPayload } from '../model/Usuario';
import { mensagemErroApi } from '../services/api';
import { ehErroValidacao, passageiroSchema, primeiraMensagemYup } from '../validation/schemas';
import { useOperacoesPassageiro, usePassageiros } from './usePassageiroControl';

const vazio = { nome: '', email: '', senha: '' };

/** CRUD de passageiros feito pelo ADMIN. */
export function usePassageiroFormulario() {
  const passageiros = usePassageiros();
  const { criar, atualizar, excluir } = useOperacoesPassageiro();
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const pendente = criar.isPending || atualizar.isPending || excluir.isPending;

  function limpar() {
    setForm({ ...vazio });
    setEditandoId(null);
    setErro('');
  }

  function editar(passageiro: Passageiro) {
    setForm({ nome: passageiro.nome, email: passageiro.email, senha: '' });
    setEditandoId(passageiro.id);
    setErro('');
  }

  async function salvar() {
    if (pendente) return;
    setErro('');
    const dados: PassageiroPayload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      ...(form.senha ? { senha: form.senha } : {}),
    };
    try {
      await passageiroSchema.validate({ ...dados, senha: form.senha });
      if (editandoId === null && !form.senha) throw new Error('Informe a senha do passageiro.');
      if (editandoId !== null) {
        await atualizar.mutateAsync({ id: editandoId, dados });
      } else {
        await criar.mutateAsync(dados);
      }
      Alert.alert(editandoId !== null ? 'Passageiro atualizado' : 'Passageiro cadastrado');
      limpar();
    } catch (error) {
      if (ehErroValidacao(error)) setErro(primeiraMensagemYup(error));
      else if (error instanceof Error && !('isAxiosError' in error)) setErro(error.message);
      else setErro(mensagemErroApi(error));
    }
  }

  function confirmarExclusao(passageiro: Passageiro) {
    if (pendente) return;
    Alert.alert('Excluir passageiro?', `A conta de ${passageiro.nome} será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluir.mutateAsync(passageiro.id);
          } catch (error) {
            Alert.alert('Não foi possível excluir', mensagemErroApi(error));
          }
        },
      },
    ]);
  }

  return {
    passageiros,
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
