import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Text from './ThemedText';
import { useTema } from '../Theme/themeContext';

export default function Loading({ texto = 'Carregando...' }: { texto?: string }) {
  const { cores } = useTema();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={[styles.text, { color: cores.textoSecundario }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  text: { marginTop: 10 },
});
