import React, { useRef } from 'react';
import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/ThemedText';
import { usePassageiroFormulario } from '../control/usePassageiroFormulario';
import type { Passageiro } from '../model/Usuario';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { useTema } from '../Theme/themeContext';

type ChaveTexto = 'nome' | 'email' | 'senha';

/** CRUD de passageiros (contas USER) feito pelo ADMIN. */
export default function PassageiroScreen() {
  const { cores } = useTema();
  const styles = criarEstilosBase(cores);
  const lista = useRef<FlatList<Passageiro>>(null);
  const {
    passageiros,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    salvar,
    confirmarExclusao,
  } = usePassageiroFormulario();

  function campo(
    chave: ChaveTexto,
    placeholder: string,
    opcoes: Partial<React.ComponentProps<typeof TextInput>> = {},
  ) {
    return (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        value={form[chave]}
        accessibilityLabel={placeholder}
        onChangeText={(valor) => setForm((atual) => ({ ...atual, [chave]: valor }))}
        {...opcoes}
      />
    );
  }

  return (
    <FlatList
      ref={lista}
      style={styles.pagina}
      contentContainerStyle={styles.conteudo}
      data={passageiros.data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshing={passageiros.isFetching}
      onRefresh={() => void passageiros.refetch()}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <Text style={styles.subtitulo}>
              {editandoId !== null ? 'Editar passageiro' : 'Cadastrar passageiro'}
            </Text>
            {campo('nome', 'Nome')}
            {campo('email', 'E-mail', { autoCapitalize: 'none', keyboardType: 'email-address' })}
            {campo('senha', editandoId !== null ? 'Nova senha (opcional)' : 'Senha', {
              secureTextEntry: true,
            })}
            {!!erro && <Text style={styles.erro}>{erro}</Text>}
            <TouchableOpacity
              style={styles.primario}
              onPress={() => void salvar()}
              disabled={pendente}
            >
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
          {passageiros.isLoading && <ActivityIndicator color={cores.primaria} />}
          {passageiros.isError && (
            <Text style={styles.erro}>{mensagemErroApi(passageiros.error)}</Text>
          )}
        </View>
      }
      ListEmptyComponent={
        !passageiros.isLoading ? (
          <Text style={styles.vazio}>Nenhum passageiro cadastrado.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.textoSecundario}>{item.email}</Text>
          <View style={styles.acoes}>
            <TouchableOpacity
              style={styles.bordaBotao}
              disabled={pendente}
              onPress={() => {
                editar(item);
                lista.current?.scrollToOffset({ offset: 0, animated: true });
              }}
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
        </View>
      )}
    />
  );
}
