import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { mensagemErroApi } from '../services/api';
import { enviarMensagemChat, obterOrientacao, type TurnoChat } from '../services/iaService';
import { useOcorrencias } from './useOcorrenciaControl';

export type MensagemVisual = { id: number; papel: 'usuario' | 'assistente'; texto: string };

/** Chat contextual: histórico curto só em memória, sem enviar senha ou chave OpenAI. */
export function useAssistenteControl(ocorrenciaInicial?: number) {
  const ocorrencias = useOcorrencias();
  const [selecionadaId, setSelecionadaId] = useState<number | null>(ocorrenciaInicial ?? null);
  const [entrada, setEntrada] = useState('');
  const [mensagens, setMensagens] = useState<MensagemVisual[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const sequencia = useRef(0);
  const travado = useRef(false);

  useEffect(() => {
    if (ocorrenciaInicial !== undefined) {
      setSelecionadaId(ocorrenciaInicial);
      setMensagens([]);
      setErro('');
    }
  }, [ocorrenciaInicial]);

  const selecionada = (ocorrencias.data ?? []).find((o) => o.id === selecionadaId) ?? null;
  const nova = (papel: MensagemVisual['papel'], texto: string): MensagemVisual => ({
    id: ++sequencia.current,
    papel,
    texto,
  });

  function selecionar(id: number | null) {
    if (travado.current) return;
    setSelecionadaId(id);
    setMensagens([]);
    setErro('');
  }

  async function enviar() {
    const pergunta = entrada.trim();
    if (!pergunta || travado.current) return;
    if (pergunta.length > 1000) {
      setErro('A pergunta deve ter até 1000 caracteres.');
      return;
    }
    travado.current = true;
    setCarregando(true);
    setErro('');
    const historico: TurnoChat[] = mensagens.slice(-8).map((m) => ({
      papel: m.papel,
      conteudo: m.texto,
    }));
    setMensagens((lista) => [...lista, nova('usuario', pergunta)]);
    setEntrada('');
    try {
      const dados = await enviarMensagemChat({
        mensagem: pergunta,
        ocorrenciaId: selecionadaId,
        historico,
      });
      setMensagens((lista) => [...lista, nova('assistente', dados.resposta)]);
    } catch (e) {
      setErro(
        isAxiosError(e) && e.response?.status === 404
          ? 'O chat ainda não está publicado na API. Publique a versão Java com POST /api/chat (incluída no pacote).'
          : mensagemErroApi(e),
      );
    } finally {
      travado.current = false;
      setCarregando(false);
    }
  }

  async function perguntarOrientacao() {
    if (selecionadaId === null || travado.current) return;
    travado.current = true;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await obterOrientacao(selecionadaId);
      setMensagens((lista) => [
        ...lista,
        nova('usuario', 'Como devo proceder com esta ocorrência?'),
        nova('assistente', resultado.orientacao),
      ]);
    } catch (e) {
      setErro(mensagemErroApi(e));
    } finally {
      travado.current = false;
      setCarregando(false);
    }
  }

  function limparConversa() {
    if (travado.current) return;
    setMensagens([]);
    setErro('');
  }

  return {
    ocorrencias,
    selecionada,
    selecionadaId,
    selecionar,
    entrada,
    setEntrada,
    mensagens,
    carregando,
    erro,
    enviar,
    perguntarOrientacao,
    limparConversa,
  };
}
