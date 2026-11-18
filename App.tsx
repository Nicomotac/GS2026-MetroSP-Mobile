import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { TemaProvider } from './src/Theme/themeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (tentativas, erro) => {
        // Requisicao negada nao deve ser repetida automaticamente.
        const status = (erro as { response?: { status?: number } })?.response?.status;
        return status !== 401 && status !== 403 && tentativas < 1;
      },
    },
  },
});

export default function App() {
  const [fontesCarregadas] = useFonts({ Poppins_500Medium, Poppins_700Bold });
  if (!fontesCarregadas) return null;

  return (
    <GestureHandlerRootView style={styles.raiz}>
      <QueryClientProvider client={queryClient}>
        <TemaProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </TemaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ raiz: { flex: 1 } });
