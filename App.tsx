import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { cores, fontes } from './src/theme/tema';

const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: cores.azul, background: cores.fundo },
};

export default function App() {
  // Fontes da identidade visual, guardadas em assets/fonts.
  const [fontesCarregadas] = useFonts({
    [fontes.regular]: require('./assets/fonts/Poppins_400Regular.ttf'),
    [fontes.medio]: require('./assets/fonts/Poppins_500Medium.ttf'),
    [fontes.semi]: require('./assets/fonts/Poppins_600SemiBold.ttf'),
    [fontes.negrito]: require('./assets/fonts/Poppins_700Bold.ttf'),
  });

  if (!fontesCarregadas) {
    return (
      <View style={estilos.carregando}>
        <ActivityIndicator size="large" color={cores.branco} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={tema}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
});
