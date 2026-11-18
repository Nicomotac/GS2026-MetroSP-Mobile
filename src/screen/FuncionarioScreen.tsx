import React, { useRef } from 'react';
import { ActivityIndicator, FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/ThemedText';
import { useFuncionarioFormulario } from '../control/useFuncionarioFormulario';
import type { Funcionario } from '../model/Funcionario';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { useTema } from '../Theme/themeContext';

type ChaveTexto = 'nome' | 'email' | 'cpf' | 'cargo' | 'senha';

/** CRUD de funcionários (contas ADMIN). */
export default function FuncionarioScreen() {
  const { cores } = useTema();
  const styles = criarEstilosBase(cores);
  const lista = useRef<FlatList<Funcionario>>(null);
  const {
    funcionarios,
    form,
    setForm,
    editandoId,
    erro,
    pendente,
    limpar,
    editar,
    salvar,
    confirmarExclusao,
  } = useFuncionarioFormulario();

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
      data={funcionarios.data ?? []}
      keyExtractor={(item) => String(item.id)}
      refreshing={funcionarios.isFetching}
      onRefresh={() => void funcionarios.refetch()}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <Text style={styles.subtitulo}>
              {editandoId !== null ? 'Editar funcionário' : 'Cadastrar funcionário'}
            </Text>
            {campo('nome', 'Nome')}
            {campo('email', 'E-mail corporativo', {
              autoCapitalize: 'none',
              keyboardType: 'email-address',
            })}
            {campo('cargo', 'Cargo')}
            {campo(
              'cpf',
              editandoId !== null ? 'CPF (obrigatório para confirmar)' : 'CPF (11 dígitos)',
              {
                keyboardType: 'number-pad',
                maxLength: 11,
              },
            )}
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
          {funcionarios.isLoading && <ActivityIndicator color={cores.primaria} />}
          {funcionarios.isError && (
            <Text style={styles.erro}>{mensagemErroApi(funcionarios.error)}</Text>
          )}
        </View>
      }
      ListEmptyComponent={
        !funcionarios.isLoading ? (
          <Text style={styles.vazio}>Nenhum funcionário cadastrado.</Text>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.textoSecundario}>
            {item.cargo} • {item.email}
          </Text>
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
