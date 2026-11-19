import { useCallback, useEffect, useState } from 'react';
import type { Estacao, Funcionario } from '../model/Cadastros';
import type { Ocorrencia, OcorrenciaPayload } from '../model/Ocorrencia';
import type { Sessao } from '../model/Sessao';
import { estacaoService, funcionarioService } from '../services/cadastroService';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { dataParaApi, dataParaTexto, formatarDataApi, lerDataApi, textoParaData } from '../utils/datas';
import { mensagemErro, statusHttp } from '../utils/erros';

export interface FormOcorrencia {
  tipoProblema: string;
  mensagem: string;
  status: string;
  dataInicio: string; // DD/MM/AAAA HH:mm
  dataFim: string; // DD/MM/AAAA HH:mm ou vazio
  estacaoId: number;
  funcionarioId: number;
}

/** De onde veio a lista de responsáveis (T_FUNCIONARIO). */
export type OrigemResponsaveis = 'api' | 'ocorrencias' | 'nenhuma';

export const MENSAGEM_SEM_PERMISSAO =
  'A API só deixa ADMIN cadastrar, editar ou excluir ocorrências. Para um passageiro conseguir, ' +
  'o Web App precisa de APP_DEMO_ALL_USERS_ADMIN=true ou a regra precisa mudar no SecurityConfig da API.';

function formularioVazio(): FormOcorrencia {
  return {
    tipoProblema: '',
    mensagem: '',
    status: 'A',
    dataInicio: dataParaTexto(new Date()),
    dataFim: '',
    estacaoId: 0,
    funcionarioId: 0,
  };
}

function paraFormulario(o: Ocorrencia): FormOcorrencia {
  return {
    tipoProblema: o.tipoProblema,
    mensagem: o.mensagem,
    status: o.status,
    dataInicio: lerDataApi(o.dataInicio) ? formatarDataApi(o.dataInicio) : dataParaTexto(new Date()),
    dataFim: o.dataFim && lerDataApi(o.dataFim) ? formatarDataApi(o.dataFim) : '',
    estacaoId: o.estacaoId,
    funcionarioId: o.funcionarioId,
  };
}

/**
 * Funcionários vêm de GET /api/funcionarios (só ADMIN).
 * Se a API negar (403), usa os responsáveis que já aparecem nas ocorrências.
 */
export async function carregarResponsaveis(): Promise<{ lista: Funcionario[]; origem: OrigemResponsaveis }> {
  try {
    return { lista: await funcionarioService.listar(), origem: 'api' };
  } catch (error) {
    if (statusHttp(error) !== 403) throw error;
    const ocorrencias = await ocorrenciaService.listar();
    const mapa = new Map<number, Funcionario>();
    ocorrencias.forEach((o) => mapa.set(o.funcionarioId, { id: o.funcionarioId, nome: o.funcionario }));
    const lista = [...mapa.values()];
    return { lista, origem: lista.length ? 'ocorrencias' : 'nenhuma' };
  }
}

function responsavelPadrao(lista: Funcionario[], sessao: Sessao): number {
  // Funcionário logado = responsável padrão. Passageiro: primeiro da lista.
  if (sessao.conta === 'ADMIN' && lista.some((f) => f.id === sessao.id)) return sessao.id;
  return lista[0]?.id ?? 0;
}

export function validarFormulario(form: FormOcorrencia): { payload: OcorrenciaPayload } | { erro: string } {
  const tipoProblema = form.tipoProblema.trim();
  const mensagem = form.mensagem.trim();
  if (!tipoProblema) return { erro: 'Informe o tipo do problema.' };
  if (tipoProblema.length > 100) return { erro: 'O tipo do problema pode ter no máximo 100 caracteres.' };
  if (!mensagem) return { erro: 'Descreva a ocorrência.' };
  if (!form.estacaoId) return { erro: 'Escolha a estação.' };
  if (!form.funcionarioId) return { erro: 'Escolha o responsável.' };
  if (!/^[A-Z]$/.test(form.status)) return { erro: 'Escolha o status.' };

  const inicio = textoParaData(form.dataInicio);
  if (!inicio) return { erro: 'Início inválido. Use DD/MM/AAAA HH:mm.' };

  let fim: Date | null = null;
  if (form.dataFim.trim()) {
    fim = textoParaData(form.dataFim);
    if (!fim) return { erro: 'Encerramento inválido. Use DD/MM/AAAA HH:mm ou deixe vazio.' };
    if (fim.getTime() < inicio.getTime()) return { erro: 'O encerramento não pode ser antes do início.' };
  }

  return {
    payload: {
      tipoProblema,
      mensagem,
      status: form.status,
      dataInicio: dataParaApi(inicio),
      dataFim: fim ? dataParaApi(fim) : null,
      estacaoId: form.estacaoId,
      funcionarioId: form.funcionarioId,
    },
  };
}

export function useOcorrenciaForm(id: number | undefined, sessao: Sessao) {
  const [form, setForm] = useState<FormOcorrencia>(formularioVazio);
  const [estacoes, setEstacoes] = useState<Estacao[]>([]);
  const [responsaveis, setResponsaveis] = useState<Funcionario[]>([]);
  const [origemResponsaveis, setOrigemResponsaveis] = useState<OrigemResponsaveis>('api');
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [listaEstacoes, atual, { lista, origem }] = await Promise.all([
        estacaoService.listar(),
        id ? ocorrenciaService.buscar(id) : Promise.resolve(null),
        carregarResponsaveis(),
      ]);
      // Na edição, garante que o responsável atual aparece mesmo que não venha na lista.
      const listaFinal =
        atual && !lista.some((f) => f.id === atual.funcionarioId)
          ? [...lista, { id: atual.funcionarioId, nome: atual.funcionario }]
          : lista;
      setEstacoes(listaEstacoes);
      setResponsaveis(listaFinal);
      setOrigemResponsaveis(atual && origem === 'nenhuma' ? 'ocorrencias' : origem);
      setForm(atual ? paraFormulario(atual) : { ...formularioVazio(), funcionarioId: responsavelPadrao(lista, sessao) });
    } catch (error) {
      setErroCarga(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [id, sessao]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function alterar<K extends keyof FormOcorrencia>(campo: K, valor: FormOcorrencia[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alterarStatus(status: string) {
    // Ao marcar como resolvida, sugere o encerramento agora.
    setForm((atual) => ({
      ...atual,
      status,
      dataFim: status === 'R' && !atual.dataFim ? dataParaTexto(new Date()) : atual.dataFim,
    }));
  }

  /** Valida, envia para a API e devolve a ocorrência salva (ou null se falhou). */
  async function salvar(): Promise<Ocorrencia | null> {
    if (salvando) return null;
    const resultado = validarFormulario(form);
    if ('erro' in resultado) {
      setErro(resultado.erro);
      return null;
    }
    setSalvando(true);
    setErro(null);
    try {
      return id
        ? await ocorrenciaService.atualizar(id, resultado.payload)
        : await ocorrenciaService.criar(resultado.payload);
    } catch (error) {
      setErro(statusHttp(error) === 403 ? MENSAGEM_SEM_PERMISSAO : mensagemErro(error));
      return null;
    } finally {
      setSalvando(false);
    }
  }

  return {
    form,
    alterar,
    alterarStatus,
    estacoes,
    responsaveis,
    origemResponsaveis,
    carregando,
    erroCarga,
    recarregar: carregar,
    salvando,
    erro,
    salvar,
  };
}
