import * as Yup from 'yup';

// Regras alinhadas ao Bean Validation dos DTOs da API Java.
const senha = Yup.string()
  .min(3, 'A senha deve ter pelo menos 3 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.');
const senhaOpcional = Yup.string()
  .transform((valor) => (valor ? valor : undefined))
  .min(3, 'A nova senha deve ter pelo menos 3 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .optional();

export const loginSchema = Yup.object({
  email: Yup.string().email('Informe um e-mail válido.').required('Informe o e-mail.'),
  senha: Yup.string().required('Informe a senha.'),
});

export const cadastroSchema = Yup.object({
  nome: Yup.string().trim().max(200).required('Informe o nome.'),
  email: Yup.string().email('Informe um e-mail válido.').required('Informe o e-mail.'),
  senha: senha.required('Informe a senha.'),
  confirmacao: Yup.string().oneOf([Yup.ref('senha')], 'As senhas não conferem.'),
});

export const passageiroSchema = Yup.object({
  nome: Yup.string().trim().max(200).required('Informe o nome.'),
  email: Yup.string().email('Informe um e-mail válido.').required('Informe o e-mail.'),
  senha: senhaOpcional,
});

export const estacaoSchema = Yup.object({
  nome: Yup.string().trim().max(200).required('Informe o nome da estação.'),
  ordem: Yup.number()
    .typeError('A ordem deve ser um número.')
    .integer('A ordem deve ser um número inteiro.')
    .min(1, 'A ordem deve ser entre 1 e 99.')
    .max(99, 'A ordem deve ser entre 1 e 99.')
    .required('Informe a ordem.'),
  linha: Yup.string().max(30).nullable(),
  sentido: Yup.string().max(3, 'O sentido deve ter no máximo 3 letras.').nullable(),
});

export const ocorrenciaSchema = Yup.object({
  tipoProblema: Yup.string().trim().max(100).required('Informe o tipo do problema.'),
  mensagem: Yup.string().trim().required('Descreva a ocorrência.'),
  status: Yup.string()
    .matches(/^[A-Z]$/)
    .required('Selecione o status.'),
  dataInicio: Yup.string().nullable().required('Informe o início no formato DD/MM/AAAA HH:mm.'),
  estacaoId: Yup.number().positive('Selecione a estação.').required('Selecione a estação.'),
  funcionarioId: Yup.number()
    .positive('Selecione o responsável.')
    .required('Selecione o responsável.'),
});

export const funcionarioSchema = Yup.object({
  nome: Yup.string().trim().max(200).required('Informe o nome.'),
  email: Yup.string().email('Informe um e-mail válido.').required('Informe o e-mail.'),
  cpf: Yup.string()
    .matches(/^\d{11}$/, 'O CPF deve ter 11 dígitos.')
    .required('Informe o CPF.'),
  cargo: Yup.string().trim().max(60).required('Informe o cargo.'),
});

export function primeiraMensagemYup(erro: unknown): string {
  if (erro instanceof Yup.ValidationError) {
    return erro.errors[0] || 'Confira os campos informados.';
  }
  return 'Confira os campos informados.';
}

export function ehErroValidacao(erro: unknown): boolean {
  return erro instanceof Yup.ValidationError;
}
