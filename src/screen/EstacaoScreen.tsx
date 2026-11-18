import React, { useRef } from 'react';
import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/ThemedText';
import { LINHAS, useEstacaoFormulario } from '../control/useEstacaoFormulario';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { corDaLinha, useTema } from '../Theme/themeContext';
import type { Estacao } from '../model/Estacao';

type ChaveTexto = 'nome' | 'ordem' | 'sentido';

export default function EstacaoScreen() {
  const { cores } = useTema();
  const styles = criarEstilosBase(cores);
  const {
    admin,
    estacoes,
    filtradas,
    busca,
    setBusca,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    salvar,
    confirmarExclusao,
  } = useEstacaoFormulario();
  const lista = useRef<FlatList<Estacao>>(null);

  function iniciarEdicao(estacao: Estacao) {
    editar(estacao);
    lista.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function campo(chave: ChaveTexto, placeholder: string, numerico = false) {
    return (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        value={form[chave]}
        keyboardType={numerico ? 'number-pad' : 'default'}
        autoCapitalize={chave === 'sentido' ? 'characters' : 'sentences'}
        accessibilityLabel={placeholder}
        onChangeText={(valor) => setForm((atual) => ({ ...atual, [chave]: valor }))}
      />
    );
  }

  // Formulário de cadastro/edição visível apenas para o ADMIN.
  const formulario = admin ? (
    <View style={styles.card}>
      <Text style={styles.subtitulo}>
        {editandoId !== null ? 'Editar estação' : 'Cadastrar estação'}
      </Text>
      {campo('nome', 'Nome da estação')}
      {campo('ordem', 'Ordem na linha (1 a 99)', true)}
      {campo('sentido', 'Sentido (sigla, ex.: JAB)')}
      <Text style={styles.rotulo}>Linha</Text>
      <View style={styles.linhaChips}>
        {LINHAS.map((linha) => (
          <TouchableOpacity
            key={linha}
            style={[
              styles.chip,
              form.linha === linha && {
                backgroundColor: corDaLinha(linha),
                borderColor: corDaLinha(linha),
              },
            ]}
            onPress={() => setForm((atual) => ({ ...atual, linha }))}
          >
            <Text style={form.linha === linha ? styles.chipTextoAtivo : undefined}>{linha}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.rotulo}>Situação</Text>
      <View style={styles.linhaChips}>
        {(['S', 'N'] as const).map((valor) => (
          <TouchableOpacity
            key={valor}
            style={[styles.chip, form.ativa === valor && styles.chipAtivo]}
            onPress={() => setForm((atual) => ({ ...atual, ativa: valor }))}
          >
            <Text style={form.ativa === valor ? styles.chipTextoAtivo : undefined}>
              {valor === 'S' ? 'Em operação' : 'Inativa'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
      <TouchableOpacity style={styles.primario} onPress={() => void salvar()} disabled={pendente}>
        <Text style={styles.botaoTexto}>
          {pendente ? 'Salvando...' : editandoId !== null ? 'Salvar alteração' : 'Cadastrar'}
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
      data={filtradas}
      keyExtractor={(item) => String(item.id)}
      refreshing={estacoes.isFetching}
      onRefresh={() => void estacoes.refetch()}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          {formulario}
          <TextInput
            style={styles.input}
            placeholder="Buscar estação"
            placeholderTextColor={cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
            accessibilityLabel="Buscar estação"
          />
          {estacoes.isLoading && <ActivityIndicator color={cores.primaria} />}
          {estacoes.isError && <Text style={styles.erro}>{mensagemErroApi(estacoes.error)}</Text>}
        </View>
      }
      ListEmptyComponent={
        !estacoes.isLoading && !estacoes.isError ? (
          <Text style={styles.vazio}>Nenhuma estação encontrada.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View
          style={[styles.card, { borderLeftWidth: 6, borderLeftColor: corDaLinha(item.linha) }]}
        >
          <Text style={styles.nome}>
            {item.ordem}. {item.nome}
          </Text>
          <Text style={styles.textoSecundario}>
            Linha {item.linha ?? '—'} • Sentido {item.sentido ?? '—'} •{' '}
            {item.ativa === 'N' ? 'Inativa' : 'Em operação'}
          </Text>
          {admin && (
            <View style={styles.acoes}>
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
                onPress={() => confirmarExclusao(item)}
              >
                <Text style={styles.botaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}
