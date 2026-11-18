import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import type { Funcionario, FuncionarioPayload } from '../model/Funcionario';
import { mensagemErroApi } from '../services/api';
import {
  ehErroValidacao,
  funcionarioSchema,
  passageiroSchema,
  primeiraMensagemYup,
} from '../validation/schemas';
import { useFuncionarios, useOperacoesFuncionario } from './useFuncionarioControl';

const vazio = { nome: '', email: '', cpf: '', cargo: '', senha: '' };

export function useFuncionarioFormulario() {
  const { usuario } = useAuth();
  const funcionarios = useFuncionarios();
  const { criar, atualizar, excluir } = useOperacoesFuncionario();
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const pendente = criar.isPending || atualizar.isPending || excluir.isPending;

  function limpar() {
    setForm({ ...vazio });
    setEditandoId(null);
    setErro('');
  }

  // A API não devolve o CPF, então ele precisa ser informado novamente ao editar.
  function editar(funcionario: Funcionario) {
    setForm({
      ...vazio,
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
    });
    setEditandoId(funcionario.id);
    setErro('');
  }

  async function salvar() {
    if (pendente) return;
    setErro('');
    const dados: FuncionarioPayload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      cpf: form.cpf.replace(/\D/g, ''),
      cargo: form.cargo.trim(),
      ...(form.senha ? { senha: form.senha } : {}),
    };
    try {
      await funcionarioSchema.validate(dados);
      await passageiroSchema.validate({ ...dados, senha: form.senha });
      if (editandoId === null && !form.senha) throw new Error('Informe a senha do funcionário.');
      if (editandoId !== null) {
        await atualizar.mutateAsync({ id: editandoId, dados });
      } else {
        await criar.mutateAsync(dados);
      }
      Alert.alert(editandoId !== null ? 'Funcionário atualizado' : 'Funcionário cadastrado');
      limpar();
    } catch (error) {
      if (ehErroValidacao(error)) setErro(primeiraMensagemYup(error));
      else if (error instanceof Error && !('isAxiosError' in error)) setErro(error.message);
      else setErro(mensagemErroApi(error));
    }
  }

  function confirmarExclusao(funcionario: Funcionario) {
    if (pendente) return;
    if (funcionario.id === usuario?.id) {
      Alert.alert('Ação não permitida', 'Você não pode excluir a própria conta de administrador.');
      return;
    }
    Alert.alert('Excluir funcionário?', `${funcionario.nome} perderá o acesso ao app.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluir.mutateAsync(funcionario.id);
          } catch (error) {
            Alert.alert('Não foi possível excluir', mensagemErroApi(error));
          }
        },
      },
    ]);
  }

  return {
    funcionarios,
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
