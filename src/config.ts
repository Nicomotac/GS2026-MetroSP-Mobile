/**
 * Endereço da API Java (Spring Boot) publicada no Azure.
 *
 * O valor de EXPO_PUBLIC_API_URL entra no app quando o bundle é gerado:
 * depois de mudar o .env, reinicie com `npx expo start --clear`
 * ou gere um APK novo. A tela "Sobre o App" mostra o endereço em uso.
 */
const URL_PADRAO = 'https://app-global-mobile-global-rm561857.azurewebsites.net';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '') || URL_PADRAO;

/** Plano F1 do Azure pode levar até ~1 minuto no primeiro acesso. */
export const TIMEOUT_PADRAO_MS = 45000;

/** Chamadas que passam pela OpenAI demoram mais. */
export const TIMEOUT_IA_MS = 90000;
