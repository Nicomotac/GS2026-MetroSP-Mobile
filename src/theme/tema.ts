import { StyleSheet } from 'react-native';

/** Cores inspiradas na identidade do Metrô de São Paulo (Linha 1-Azul). */
export const cores = {
  primaria: '#0B1F4D',
  azul: '#0455A4',
  amarelo: '#FFC72C',
  fundo: '#F3F5FA',
  cartao: '#FFFFFF',
  texto: '#14213D',
  textoSecundario: '#5B6680',
  borda: '#D8DEEA',
  erro: '#C62828',
  erroFundo: '#FDECEC',
  sucesso: '#0F8A5F',
  alerta: '#B26A00',
  alertaFundo: '#FFF4DE',
  branco: '#FFFFFF',
} as const;

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** Família Poppins, carregada de assets/fonts no App.tsx. */
export const fontes = {
  regular: 'Poppins_400Regular',
  medio: 'Poppins_500Medium',
  semi: 'Poppins_600SemiBold',
  negrito: 'Poppins_700Bold',
} as const;

export const estilosBase = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md },
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 14,
    padding: espaco.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espaco.sm,
  },
  titulo: { fontSize: 22, fontFamily: fontes.negrito, color: cores.texto },
  subtitulo: { fontSize: 16, fontFamily: fontes.semi, color: cores.texto },
  texto: { fontSize: 15, fontFamily: fontes.regular, color: cores.texto, lineHeight: 22 },
  textoSecundario: { fontSize: 13, fontFamily: fontes.regular, color: cores.textoSecundario },
  rotulo: {
    fontSize: 13,
    fontFamily: fontes.medio,
    color: cores.textoSecundario,
    marginTop: espaco.xs,
  },
  erro: {
    color: cores.erro,
    backgroundColor: cores.erroFundo,
    padding: espaco.md,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: fontes.regular,
  },
  aviso: {
    color: cores.alerta,
    backgroundColor: cores.alertaFundo,
    padding: espaco.md,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: fontes.regular,
    lineHeight: 19,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});
