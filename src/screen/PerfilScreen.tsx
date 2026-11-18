import React from 'react';
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/ThemedText';
import { usePerfilFormulario } from '../control/usePerfilFormulario';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { useTema, type ModoTema } from '../Theme/themeContext';

type ChaveTexto = 'nome' | 'email' | 'cargo' | 'cpf' | 'senha';

const opcoesTema: { valor: ModoTema; titulo: string }[] = [
  { valor: 'sistema', titulo: 'Seguir o sistema' },
  { valor: 'claro', titulo: 'Modo claro' },
  { valor: 'escuro', titulo: 'Modo escuro' },
];

export default function PerfilScreen() {
  const { cores, modo, definirModo } = useTema();
  const styles = criarEstilosBase(cores);
  const { usuario, admin, conta, form, setForm, erro, salvando, salvar, confirmarExclusao, sair } =
    usePerfilFormulario();

  function campo(
    chave: ChaveTexto,
    placeholder: string,
    opcoes: Partial<React.ComponentProps<typeof TextInput>> = {},
  ) {
    return (
      <>
        <Text style={styles.rotulo}>{placeholder}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={cores.textoSecundario}
          value={form[chave]}
          accessibilityLabel={placeholder}
          onChangeText={(valor) => setForm((atual) => ({ ...atual, [chave]: valor }))}
          {...opcoes}
        />
      </>
    );
  }

  return (
    <ScrollView
      style={styles.pagina}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={[styles.nome, { color: cores.primaria, fontSize: 20 }]}>{usuario?.nome}</Text>
        <Text>E-mail: {usuario?.email}</Text>
        <Text>Perfil: {admin ? 'Funcionário (ADMIN)' : 'Passageiro (USER)'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Editar dados</Text>
        {conta.isLoading && <ActivityIndicator color={cores.primaria} />}
        {conta.isError && <Text style={styles.erro}>{mensagemErroApi(conta.error)}</Text>}
        {campo('nome', 'Nome')}
        {campo('email', 'E-mail', { autoCapitalize: 'none', keyboardType: 'email-address' })}
        {admin && campo('cargo', 'Cargo')}
        {admin && campo('cpf', 'CPF (confirmação)', { keyboardType: 'number-pad', maxLength: 11 })}
        {campo('senha', 'Nova senha (opcional)', { secureTextEntry: true })}
        {!!erro && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity style={styles.primario} onPress={() => void salvar()} disabled={salvando}>
          <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar alterações'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Aparência</Text>
        {opcoesTema.map((opcao) => (
          <TouchableOpacity
            key={opcao.valor}
            style={{ paddingVertical: 12 }}
            onPress={() => definirModo(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: modo === opcao.valor }}
          >
            <Text>
              {modo === opcao.valor ? '◉' : '○'} {opcao.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.destaque} onPress={() => void sair()}>
        <Text style={styles.destaqueTexto}>Sair da conta</Text>
      </TouchableOpacity>
      {!admin && (
        <TouchableOpacity
          style={[styles.perigo, { marginTop: 12, padding: 14 }]}
          onPress={confirmarExclusao}
        >
          <Text style={styles.botaoTexto}>Excluir minha conta</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
