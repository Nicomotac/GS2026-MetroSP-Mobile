import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../components/ThemedText';
import { useCadastroFormulario } from '../control/useCadastroFormulario';
import { criarEstilosBase } from '../Theme/estilosBase';
import { useTema } from '../Theme/themeContext';

type Campo = 'nome' | 'email' | 'senha' | 'confirmacao';

export default function RegisterScreen() {
  const { cores } = useTema();
  const styles = criarEstilosBase(cores);
  const { form, setForm, erro, cadastrando, enviar } = useCadastroFormulario();

  function campo(
    chave: Campo,
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
    <ScrollView
      style={styles.pagina}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Criar conta</Text>
      <Text style={[styles.textoSecundario, { marginBottom: 14 }]}>
        Cadastre-se como passageiro para consultar ocorrências e usar o assistente com IA.
      </Text>
      <View style={styles.card}>
        {campo('nome', 'Nome completo')}
        {campo('email', 'E-mail', { autoCapitalize: 'none', keyboardType: 'email-address' })}
        {campo('senha', 'Senha (mínimo 3 caracteres)', { secureTextEntry: true })}
        {campo('confirmacao', 'Confirmar senha', { secureTextEntry: true })}
        {!!erro && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity
          style={styles.primario}
          onPress={() => void enviar()}
          disabled={cadastrando}
        >
          <Text style={styles.botaoTexto}>{cadastrando ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
