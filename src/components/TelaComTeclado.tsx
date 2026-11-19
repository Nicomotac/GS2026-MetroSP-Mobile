import { HeaderHeightContext } from '@react-navigation/elements';
import { type ReactNode, useContext } from 'react';
import { KeyboardAvoidingView, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Evita que o teclado cubra os campos. No Android com edge-to-edge (padrão do Expo)
 * a janela não encolhe sozinha, então o ajuste é feito aqui nas duas plataformas.
 */
export function TelaComTeclado({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const alturaCabecalho = useContext(HeaderHeightContext) ?? 0;
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior="padding"
      keyboardVerticalOffset={alturaCabecalho}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
