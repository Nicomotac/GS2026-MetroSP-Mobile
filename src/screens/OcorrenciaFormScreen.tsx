import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { Chip } from '../components/Chip';
import { Carregando, ErroTela } from '../components/EstadoTela';
import { TelaComTeclado } from '../components/TelaComTeclado';
import { useAuth } from '../context/AuthContext';
import { useOcorrenciaForm } from '../hooks/useOcorrenciaForm';
import type { Sessao } from '../model/Sessao';
import { STATUS_OCORRENCIA, TIPOS_PROBLEMA } from '../model/Ocorrencia';
import type { TelaPilha } from '../navigation/tipos';
import { espaco, estilosBase } from '../theme/tema';
import { dataParaTexto, mascaraDataHora } from '../utils/datas';

export function OcorrenciaFormScreen(props: TelaPilha<'OcorrenciaForm'>) {
  const { sessao } = useAuth();
  if (!sessao) return null;
  return <Formulario {...props} sessao={sessao} />;
}

function Formulario({ navigation, route, sessao }: TelaPilha<'OcorrenciaForm'> & { sessao: Sessao }) {
  const id = route.params?.id;
  const insets = useSafeAreaInsets();
  const f = useOcorrenciaForm(id, sessao);
  const [buscaEstacao, setBuscaEstacao] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: id ? `Editar ocorrência #${id}` : 'Nova ocorrência' });
  }, [navigation, id]);

  const estacaoEscolhida = f.estacoes.find((e) => e.id === f.form.estacaoId);
  const estacoesFiltradas = useMemo(() => {
    const termo = buscaEstacao.trim().toLowerCase();
    const lista = termo ? f.estacoes.filter((e) => e.nome.toLowerCase().includes(termo)) : f.estacoes;
    return lista.slice(0, 60);
  }, [f.estacoes, buscaEstacao]);

  async function aoSalvar() {
    const salva = await f.salvar();
    if (!salva) return;
    if (id) {
      Alert.alert('Ocorrência atualizada', `A ocorrência #${salva.id} foi salva no banco.`);
      navigation.goBack();
    } else {
      Alert.alert('Ocorrência registrada', `A ocorrência #${salva.id} foi salva no banco.`);
      navigation.replace('OcorrenciaDetalhe', { id: salva.id });
    }
  }

  if (f.carregando) return <Carregando texto="Carregando estações e responsáveis..." />;
  if (f.erroCarga) return <ErroTela mensagem={f.erroCarga} aoTentarDeNovo={() => void f.recarregar()} />;

  return (
    <TelaComTeclado style={estilosBase.tela}>
      <ScrollView
        contentContainerStyle={[estilosBase.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Campo
          rotulo="Tipo do problema"
          value={f.form.tipoProblema}
          onChangeText={(v) => f.alterar('tipoProblema', v)}
          placeholder="Ex.: Escada rolante parada"
          maxLength={100}
        />
        <View style={estilos.chips}>
          {TIPOS_PROBLEMA.map((tipo) => (
            <Chip key={tipo} rotulo={tipo} ativo={f.form.tipoProblema === tipo} onPress={() => f.alterar('tipoProblema', tipo)} />
          ))}
        </View>

        <Campo
          rotulo="Descrição"
          value={f.form.mensagem}
          onChangeText={(v) => f.alterar('mensagem', v)}
          placeholder="O que está acontecendo? Onde exatamente?"
          multiline
        />

        <Text style={estilosBase.rotulo}>
          Estação {estacaoEscolhida ? `· ${estacaoEscolhida.nome}` : '(obrigatório)'}
        </Text>
        {f.estacoes.length === 0 ? (
          <Text style={estilosBase.aviso}>
            A tabela T_ESTACAO está vazia. Com o Flyway desligado, rode o arquivo V2__popular_estacoes_linha_azul.sql no
            Oracle (e dê COMMIT) para ter estações.
          </Text>
        ) : (
          <>
            <Campo rotulo="Buscar estação" value={buscaEstacao} onChangeText={setBuscaEstacao} placeholder="Digite parte do nome" />
            <View style={estilos.chips}>
              {estacoesFiltradas.map((e) => (
                <Chip
                  key={e.id}
                  rotulo={e.linha ? `${e.nome} (${e.linha})` : e.nome}
                  ativo={f.form.estacaoId === e.id}
                  onPress={() => f.alterar('estacaoId', e.id)}
                />
              ))}
            </View>
          </>
        )}

        <Text style={estilosBase.rotulo}>Responsável (funcionário)</Text>
        {f.origemResponsaveis === 'nenhuma' ? (
          <Text style={estilosBase.aviso}>
            Nenhum funcionário disponível. A API só lista funcionários para ADMIN e ainda não existe ocorrência para usar
            como referência. Entre com uma conta de funcionário ou ative APP_DEMO_ALL_USERS_ADMIN no Web App.
          </Text>
        ) : (
          <>
            {f.origemResponsaveis === 'ocorrencias' && (
              <Text style={estilosBase.aviso}>
                A API não liberou a lista de funcionários para a sua conta. Mostrando os responsáveis que já aparecem em
                ocorrências.
              </Text>
            )}
            <View style={estilos.chips}>
              {f.responsaveis.map((r) => (
                <Chip key={r.id} rotulo={r.nome} ativo={f.form.funcionarioId === r.id} onPress={() => f.alterar('funcionarioId', r.id)} />
              ))}
            </View>
          </>
        )}

        <Text style={estilosBase.rotulo}>Status</Text>
        <View style={estilos.chips}>
          {STATUS_OCORRENCIA.map((s) => (
            <Chip key={s.valor} rotulo={s.rotulo} cor={s.cor} ativo={f.form.status === s.valor} onPress={() => f.alterarStatus(s.valor)} />
          ))}
        </View>

        <View style={estilos.linhaData}>
          <View style={estilos.flex}>
            <Campo
              rotulo="Início"
              value={f.form.dataInicio}
              onChangeText={(v) => f.alterar('dataInicio', mascaraDataHora(v))}
              placeholder="DD/MM/AAAA HH:mm"
              keyboardType="number-pad"
            />
          </View>
          <Botao titulo="Agora" variante="texto" onPress={() => f.alterar('dataInicio', dataParaTexto(new Date()))} />
        </View>

        <View style={estilos.linhaData}>
          <View style={estilos.flex}>
            <Campo
              rotulo="Encerramento (opcional)"
              value={f.form.dataFim}
              onChangeText={(v) => f.alterar('dataFim', mascaraDataHora(v))}
              placeholder="DD/MM/AAAA HH:mm"
              keyboardType="number-pad"
            />
          </View>
          <Botao
            titulo={f.form.dataFim ? 'Limpar' : 'Agora'}
            variante="texto"
            onPress={() => f.alterar('dataFim', f.form.dataFim ? '' : dataParaTexto(new Date()))}
          />
        </View>

        {!!f.erro && <Text style={estilosBase.erro}>{f.erro}</Text>}
        <Botao
          titulo={id ? 'Salvar alterações' : 'Registrar ocorrência'}
          icone="save-outline"
          carregando={f.salvando}
          onPress={() => void aoSalvar()}
        />
      </ScrollView>
    </TelaComTeclado>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  linhaData: { flexDirection: 'row', alignItems: 'flex-end', gap: espaco.sm },
});
