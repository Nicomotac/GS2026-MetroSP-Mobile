import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mensagemErroApi } from '../services/api';
import { cadastroSchema, ehErroValidacao, primeiraMensagemYup } from '../validation/schemas';

export function useCadastroFormulario() {
  const { cadastrar, cadastrando } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmacao: '' });
  const [erro, setErro] = useState('');

  async function enviar() {
    if (cadastrando) return;
    setErro('');
    try {
      await cadastroSchema.validate(form);
      await cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
      });
    } catch (error) {
      setErro(ehErroValidacao(error) ? primeiraMensagemYup(error) : mensagemErroApi(error));
    }
  }

  return { form, setForm, erro, cadastrando, enviar };
}
