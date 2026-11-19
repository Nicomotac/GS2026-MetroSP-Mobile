import { useCallback, useState } from 'react';
import {
  LIMITE_HISTORICO,
  LIMITE_MENSAGEM,
  type MensagemTela,
  type TurnoChat,
} from '../model/Chat';
import { chatService } from '../services/chatService';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { ehRotaInexistente, mensagemErro, statusHttp } from '../utils/erros';

const BOAS_VINDAS: MensagemTela = {
  id: 'boas-vindas',
  autor: 'assistente',
  texto:
    'Olá! Sou o assistente do MetroSP. Pergunte sobre mobilidade no metrô ou escolha uma ocorrência acima para eu responder com base nela.',
};

const AVISO_SEM_ROTA =
  'A API publicada não tem a rota POST /api/chat (o ChatService existe, mas falta o ChatController). ' +
  'Adicione o ChatController.java na API e publique de novo. Enquanto isso, escolha uma ocorrência: ' +
  'eu uso a orientação de IA que a API já oferece.';

let contador = 0;
const novoId = () => `${Date.now()}-${++contador}`;

export function useChat(ocorrenciaInicial: number | null) {
  const [mensagens, setMensagens] = useState<MensagemTela[]>([BOAS_VINDAS]);
  const [ocorrenciaId, setOcorrenciaId] = useState<number | null>(ocorrenciaInicial);
  const [enviando, setEnviando] = useState(false);
  const [chatLivreIndisponivel, setChatLivreIndisponivel] = useState(false);

  function adicionar(autor: MensagemTela['autor'], texto: string) {
    setMensagens((atual) => [...atual, { id: novoId(), autor, texto }]);
  }

  /** Últimos turnos reais da conversa, no formato ChatRequest.Turno (máx. 8). */
  function montarHistorico(): TurnoChat[] {
    return mensagens
      .filter((m) => m.id !== BOAS_VINDAS.id && m.autor !== 'sistema')
      .slice(-LIMITE_HISTORICO)
      .map((m) => ({
        papel: m.autor === 'usuario' ? 'usuario' : 'assistente',
        conteudo: m.texto.slice(0, LIMITE_MENSAGEM),
      }));
  }

  async function usarOrientacao(id: number) {
    try {
      const resposta = await ocorrenciaService.orientacao(id);
      adicionar('assistente', resposta.orientacao);
      adicionar('sistema', `Resposta gerada pela orientação da ocorrência #${id} (GET /api/ocorrencias/${id}/orientacao).`);
    } catch (error) {
      adicionar('sistema', mensagemErro(error));
    }
  }

  async function enviar(texto: string): Promise<boolean> {
    const pergunta = texto.trim().slice(0, LIMITE_MENSAGEM);
    if (!pergunta || enviando) return false;

    const historico = montarHistorico();
    adicionar('usuario', pergunta);
    setEnviando(true);
    try {
      if (chatLivreIndisponivel && ocorrenciaId) {
        await usarOrientacao(ocorrenciaId);
        return true;
      }
      const resposta = await chatService.perguntar({ mensagem: pergunta, ocorrenciaId, historico });
      setChatLivreIndisponivel(false);
      adicionar('assistente', resposta.resposta);
    } catch (error) {
      if (ehRotaInexistente(error)) {
        setChatLivreIndisponivel(true);
        adicionar('sistema', AVISO_SEM_ROTA);
        if (ocorrenciaId) await usarOrientacao(ocorrenciaId);
      } else if (statusHttp(error) === 401) {
        adicionar('sistema', 'A API recusou o seu login (401). Saia e entre novamente; se continuar, a rota /api/chat pode não estar publicada.');
      } else {
        adicionar('sistema', mensagemErro(error));
      }
    } finally {
      setEnviando(false);
    }
    return true;
  }

  const limpar = useCallback(() => {
    setMensagens([BOAS_VINDAS]);
    setChatLivreIndisponivel(false);
  }, []);

  return {
    mensagens,
    enviando,
    enviar,
    limpar,
    ocorrenciaId,
    setOcorrenciaId,
    chatLivreIndisponivel,
  };
}
