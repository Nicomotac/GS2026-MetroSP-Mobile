import { isAxiosError } from 'axios';
import { API_URL } from '../config';

const NOMES_CAMPOS: Record<string, string> = {
  tipoProblema: 'Tipo do problema',
  mensagem: 'Mensagem',
  status: 'Status',
  dataInicio: 'Início',
  dataFim: 'Encerramento',
  estacaoId: 'Estação',
  funcionarioId: 'Responsável',
  nome: 'Nome',
  email: 'E-mail',
  senha: 'Senha',
  historico: 'Histórico',
};

type CorpoErro = { mensagem?: unknown; campos?: unknown };

function corpoJson(error: unknown): CorpoErro | null {
  if (!isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  return data && typeof data === 'object' ? (data as CorpoErro) : null;
}

export function statusHttp(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * 404 sem o corpo ErroApi = a rota não existe na versão publicada da API
 * (diferente de "Ocorrência não encontrada", que vem com `mensagem`).
 */
export function ehRotaInexistente(error: unknown): boolean {
  const status = statusHttp(error);
  if (status !== 404 && status !== 405) return false;
  return typeof corpoJson(error)?.mensagem !== 'string';
}

/** Converte qualquer falha (ErroApi do Spring, erro do Azure ou de rede) em texto para o usuário. */
export function mensagemErro(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Erro inesperado.';
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'A API demorou demais para responder. No plano F1 do Azure o primeiro acesso pode levar até 1 minuto: tente de novo.';
  }

  const resposta = error.response;
  if (!resposta) {
    return `Não foi possível conectar à API (${API_URL}). Confira a internet do celular e se o Web App está ligado no Azure.`;
  }

  // ErroApi da API Java: { status, erro, mensagem, campos }
  const corpo = corpoJson(error);
  if (corpo?.campos && typeof corpo.campos === 'object') {
    const campos = Object.entries(corpo.campos as Record<string, unknown>);
    if (campos.length) {
      return campos
        .map(([campo, msg]) => `${NOMES_CAMPOS[campo] ?? campo}: ${String(msg)}`)
        .join('\n');
    }
  }
  if (typeof corpo?.mensagem === 'string' && corpo.mensagem.trim()) return corpo.mensagem;

  const status = resposta.status;
  const html = typeof resposta.data === 'string' && /<html/i.test(resposta.data);
  if (html && status === 403) {
    return 'O Azure recusou a requisição: o Web App pode estar parado ou sem cota do plano F1.';
  }
  if (html && status >= 500) {
    return `O Azure respondeu ${status}: a API pode estar iniciando ou com erro. Veja o Fluxo de log do Web App.`;
  }

  switch (status) {
    case 400:
      return 'A API recusou os dados enviados.';
    case 401:
      return 'Sessão expirada ou e-mail/senha inválidos.';
    case 403:
      return 'A API não permite essa operação para o seu perfil.';
    case 404:
      return 'Registro ou rota não encontrada na API.';
    case 409:
      return 'Conflito com dados já existentes.';
    case 500:
      return 'Erro interno na API (500). Veja o Fluxo de log do Web App no Azure.';
    case 502:
    case 503:
    case 504:
      return `A API está indisponível no momento (${status}). Tente de novo em instantes.`;
    default:
      return `A API respondeu com erro ${status}.`;
  }
}
