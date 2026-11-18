import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mensagemErroApi } from '../services/api';
import { ehErroValidacao, loginSchema, primeiraMensagemYup } from '../validation/schemas';

export function useLoginFormulario() {
  const { entrar, entrando } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function enviar() {
    if (entrando) return;
    setErro('');
    try {
      await loginSchema.validate({ email: email.trim(), senha });
      // O RootNavigator troca para a área do perfil (ADMIN ou USER) automaticamente.
      await entrar({ email, senha });
    } catch (error) {
      setErro(ehErroValidacao(error) ? primeiraMensagemYup(error) : mensagemErroApi(error));
    }
  }

  return { email, setEmail, senha, setSenha, erro, entrando, enviar };
}
