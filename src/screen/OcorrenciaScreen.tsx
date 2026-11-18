import React, { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import StatusBadge from '../components/StatusBadge';
import Text from '../components/ThemedText';
import { TIPOS_PROBLEMA, useOcorrenciaFormulario } from '../control/useOcorrenciaFormulario';
import { STATUS_OCORRENCIA, type Ocorrencia } from '../model/Ocorrencia';
import type { RootDrawerParamList } from '../navigation/navigation';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { useTema } from '../Theme/themeContext';
import { formatarDataHora, mascaraDataHora } from '../utils/datas';

type Props = DrawerScreenProps<RootDrawerParamList, 'Ocorrencias'>;

export default function OcorrenciaScreen({ navigation }: Props) {
  const { cores } = useTema();
  const styles = criarEstilosBase(cores);
  const lista = useRef<FlatList<Ocorrencia>>(null);
  const {
    admin,
    ocorrencias,
    estacoes,
    funcionarios,
    filtroEstacao,
    setFiltroEstacao,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    alterarStatus,
    salvar,
    confirmarExclusao,
  } = useOcorrenciaFormulario();

  function iniciarEdicao(ocorrencia: Ocorrencia) {
    editar(ocorrencia);
    lista.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function chip(rotulo: string, ativo: boolean, onPress: () => void, chave: string | number) {
    return (
      <TouchableOpacity
        key={chave}
        style={[styles.chip, ativo && styles.chipAtivo]}
        onPress={onPress}
      >
        <Text style={ativo ? styles.chipTextoAtivo : undefined}>{rotulo}</Text>
      </TouchableOpacity>
    );
  }

  // Registro/edição de ocorrências: somente funcionários (ADMIN).
  const formulario = admin ? (
    <View style={styles.card}>
      <Text style={styles.subtitulo}>
        {editandoId !== null ? 'Editar ocorrência' : 'Registrar ocorrência'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Tipo do problema"
        placeholderTextColor={cores.textoSecundario}
        value={form.tipoProblema}
        onChangeText={(tipoProblema) => setForm((atual) => ({ ...atual, tipoProblema }))}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {TIPOS_PROBLEMA.map((tipo) =>
          chip(
            tipo,
            form.tipoProblema === tipo,
            () => setForm((atual) => ({ ...atual, tipoProblema: tipo })),
            tipo,
          ),
        )}
      </ScrollView>
      <TextInput
        style={[styles.input, styles.inputMultilinha]}
        placeholder="Descrição para o passageiro"
        placeholderTextColor={cores.textoSecundario}
        multiline
        value={form.mensagem}
        onChangeText={(mensagem) => setForm((atual) => ({ ...atual, mensagem }))}
      />
      <Text style={styles.rotulo}>Estação</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {(estacoes.data ?? []).map((estacao) =>
          chip(
            estacao.nome,
            form.estacaoId === estacao.id,
            () => setForm((atual) => ({ ...atual, estacaoId: estacao.id })),
            estacao.id,
          ),
        )}
      </ScrollView>
      <Text style={styles.rotulo}>Responsável</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {(funcionarios.data ?? []).map((funcionario) =>
          chip(
            funcionario.nome,
            form.funcionarioId === funcionario.id,
            () => setForm((atual) => ({ ...atual, funcionarioId: funcionario.id })),
            funcionario.id,
          ),
        )}
      </ScrollView>
      <Text style={styles.rotulo}>Status</Text>
      <View style={styles.linhaChips}>
        {STATUS_OCORRENCIA.map((status) =>
          chip(
            status.rotulo,
            form.status === status.valor,
            () => alterarStatus(status.valor),
            status.valor,
          ),
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Início DD/MM/AAAA HH:mm"
        placeholderTextColor={cores.textoSecundario}
        keyboardType="number-pad"
        value={form.dataInicio}
        onChangeText={(valor) =>
          setForm((atual) => ({ ...atual, dataInicio: mascaraDataHora(valor) }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Encerramento DD/MM/AAAA HH:mm (opcional)"
        placeholderTextColor={cores.textoSecundario}
        keyboardType="number-pad"
        value={form.dataFim}
        onChangeText={(valor) =>
          setForm((atual) => ({ ...atual, dataFim: mascaraDataHora(valor) }))
        }
      />
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
      <TouchableOpacity style={styles.primario} onPress={() => void salvar()} disabled={pendente}>
        <Text style={styles.botaoTexto}>
          {pendente ? 'Salvando...' : editandoId !== null ? 'Salvar alteração' : 'Registrar'}
        </Text>
      </TouchableOpacity>
      {editandoId !== null && (
        <TouchableOpacity style={styles.botaoSecundario} onPress={limpar}>
          <Text>Cancelar edição</Text>
        </TouchableOpacity>
      )}
    </View>
  ) : null;

  return (
    <FlatList
      ref={lista}
      style={styles.pagina}
      contentContainerStyle={styles.conteudo}
      data={ocorrencias.data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshing={ocorrencias.isFetching}
      onRefresh={() => void ocorrencias.refetch()}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          {formulario}
          <Text style={styles.rotulo}>Filtrar por estação</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {chip('Todas', filtroEstacao === null, () => setFiltroEstacao(null), 'todas')}
            {(estacoes.data ?? []).map((estacao) =>
              chip(
                estacao.nome,
                filtroEstacao === estacao.id,
                () => setFiltroEstacao(estacao.id),
                estacao.id,
              ),
            )}
          </ScrollView>
          {ocorrencias.isLoading && <ActivityIndicator color={cores.primaria} />}
          {ocorrencias.isError && (
            <Text style={styles.erro}>{mensagemErroApi(ocorrencias.error)}</Text>
          )}
        </View>
      }
      ListEmptyComponent={
        !ocorrencias.isLoading && !ocorrencias.isError ? (
          <Text style={styles.vazio}>Nenhuma ocorrência registrada.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <StatusBadge status={item.status} />
          <Text style={[styles.nome, { marginTop: 6 }]}>{item.tipoProblema}</Text>
          <Text>{item.mensagem}</Text>
          <Text style={[styles.textoSecundario, { marginTop: 6 }]}>
            Estação {item.estacao} • Início {formatarDataHora(item.dataInicio)}
            {item.dataFim ? ` • Fim ${formatarDataHora(item.dataFim)}` : ''}
          </Text>
          <Text style={styles.textoSecundario}>Responsável: {item.funcionario}</Text>
          <View style={styles.acoes}>
            <TouchableOpacity
              style={styles.bordaBotao}
              onPress={() => navigation.navigate('AssistenteIA', { ocorrenciaId: item.id })}
            >
              <Text style={styles.editar}>Orientação IA</Text>
            </TouchableOpacity>
            {admin && (
              <>
                <TouchableOpacity
                  style={styles.bordaBotao}
                  disabled={pendente}
                  onPress={() => iniciarEdicao(item)}
                >
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.perigo}
                  disabled={pendente}
                  onPress={() => confirmarExclusao(item.id)}
                >
                  <Text style={styles.botaoTexto}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    />
  );
}
