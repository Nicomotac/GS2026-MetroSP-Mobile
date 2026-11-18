import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mensagemErroApi } from '../services/api';
import { funcionarioService } from '../services/funcionarioService';
import { usuarioService } from '../services/usuarioService';
import {
  ehErroValidacao,
  funcionarioSchema,
  passageiroSchema,
  primeiraMensagemYup,
} from '../validation/schemas';

/**
 * Perfil da conta logada.
 * USER → /api/usuarios/{id} (ver, editar e excluir a própria conta)
 * ADMIN → /api/funcionarios/{id} (ver e editar os próprios dados)
 */
export function usePerfilFormulario() {
  const { usuario, sair, atualizarSessao } = useAuth();
  const admin = usuario?.perfil === 'ADMIN';
  const id = usuario?.id ?? 0;

  const conta = useQuery({
    queryKey: ['perfil', usuario?.perfil, id],
    queryFn: async () =>
      admin
        ? { ...(await funcionarioService.buscar(id)) }
        : { ...(await usuarioService.buscar(id)), cargo: '' },
  });

  const [form, setForm] = useState({ nome: '', email: '', cargo: '', cpf: '', senha: '' });
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!conta.data) return;
    const { nome, email, cargo } = conta.data;
    // Preenche o formulário quando os dados da API chegam.
    setForm((atual) => ({ ...atual, nome, email, cargo })); // eslint-disable-line react-hooks/set-state-in-effect
  }, [conta.data]);

  const salvarConta = useMutation({
    mutationFn: async () => {
      const base = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        ...(form.senha ? { senha: form.senha } : {}),
      };
      await passageiroSchema.validate({ ...base, senha: form.senha });
      if (admin) {
        const dados = { ...base, cpf: form.cpf.replace(/\D/g, ''), cargo: form.cargo.trim() };
        await funcionarioSchema.validate(dados);
        return funcionarioService.atualizar({ id, dados });
      }
      return usuarioService.atualizar({ id, dados: base });
    },
    onSuccess: async (salvo) => {
      await atualizarSessao({ nome: salvo.nome, email: salvo.email });
      setForm((atual) => ({ ...atual, senha: '', cpf: '' }));
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos.');
    },
  });

  const excluirConta = useMutation({
    mutationFn: () => usuarioService.excluir(id),
    onSuccess: () => sair(),
  });

  async function salvar() {
    setErro('');
    try {
      await salvarConta.mutateAsync();
    } catch (error) {
      setErro(ehErroValidacao(error) ? primeiraMensagemYup(error) : mensagemErroApi(error));
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir minha conta?', 'Sua conta será removida e você será desconectado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirConta.mutateAsync();
          } catch (error) {
            Alert.alert('Não foi possível excluir', mensagemErroApi(error));
          }
        },
      },
    ]);
  }

  return {
    usuario,
    admin,
    conta,
    form,
    setForm,
    erro,
    salvando: salvarConta.isPending,
    salvar,
    confirmarExclusao,
    sair,
  };
}
