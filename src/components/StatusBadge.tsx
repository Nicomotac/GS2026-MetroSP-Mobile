import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './ThemedText';
import { infoStatus } from '../model/Ocorrencia';

export default function StatusBadge({ status }: { status: string }) {
  const info = infoStatus(status);
  return (
    <View style={[styles.badge, { backgroundColor: info.cor }]}>
      <Text style={styles.texto}>{info.rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  texto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
