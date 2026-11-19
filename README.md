# MetroSP Ocorrências — Global Solution 2026/2 (CitizenTech)

INTEGRANTES: Nicolas Mota (RM561857) · Caio Kenzo (RM592979)

Aplicativo **React Native + TypeScript (Expo)** que aproxima o passageiro da operação do Metrô de São Paulo. O cidadão consulta ocorrências por estação (escadas paradas, elevadores, superlotação, falhas) e recebe **orientação gerada por IA** e pode conversar com o chatbot MetroSP (Spring AI) sobre mobilidade e ocorrências. Os funcionários (perfil **ADMIN**) registram e acompanham os problemas até a resolução.

- 🎥 Vídeo: **PENDENTE**
- ☕ Backend: API Java: https://app-global-mobile-global-rm561857.azurewebsites.net/swagger-ui/index.html

## Perfis

| Perfil | Origem | Acesso no app |
|---|---|---|
| **USER** (passageiro) | Tela "Criar conta" → `POST /api/auth/cadastro` | Início, Ocorrências e Estações (consulta), Assistente IA, Meu Perfil (editar/excluir) |
| **ADMIN** (funcionário) | Tabela `T_FUNCIONARIO` (bootstrap da API) | Tudo do USER + CRUD de ocorrências, estações, funcionários e passageiros |

O login (`POST /api/auth/login`) devolve o JWT e o `perfil`. O `RootNavigator` mostra só as telas públicas sem sessão, e o menu lateral só exibe as telas administrativas para o ADMIN. HTTP 401 encerra a sessão automaticamente.

## Telas

| Tela | USER | ADMIN |
|---|---|---|
| Login / Criar conta | ✅ | ✅ |
| Início / Painel | resumo e últimas ocorrências | idem + atalho para registrar |
| Ocorrências | consulta e filtro por estação | **CRUD** |
| Estações | consulta e busca | **CRUD** |
| Assistente IA | ✅ | ✅ |
| Funcionários | — | **CRUD** |
| Passageiros | — | **CRUD** |
| Meu Perfil | editar, excluir conta, tema, sair | editar, tema, sair |
| Sobre o App | hash do commit | hash do commit |

## Arquitetura

```
App.tsx                 # Providers (React Query, Tema, Auth) + NavigationContainer
src/
├── navigation/         # RootNavigator (Stack público + Drawer privado) e tipos das rotas
├── screen/             # Telas (somente interface)
├── control/            # Hooks de controle: estado dos formulários, queries e mutations
├── services/           # Acesso à API REST com Axios (api.ts + um serviço por recurso)
├── model/              # Interfaces espelhando os DTOs da API
├── context/            # AuthContext (sessão, login, cadastro, logout)
├── validation/         # Schemas Yup alinhados ao Bean Validation da API
├── Theme/              # Tema claro/escuro, cores do metrô e estilos base
├── components/         # ThemedText, Loading, StatusBadge
├── utils/              # Datas (formato da API ↔ DD/MM/AAAA HH:mm)
└── assets/             # Ícone, splash e logotipo
```

Fluxo: **screen → control (React Query) → services (Axios) → API Java**. O token JWT fica no `expo-secure-store` (nunca a senha), e todos os dados dos CRUDs ficam na API.

## Estado da entrega (19/11/2026)

- **Código:** telas, autenticação, CRUDs e integração Spring AI implementados com base no contrato publicado em `docs/INTEGRACAO-MOBILE.md` do repositório Java.
- **API informada pelo usuário:** `https://app-global-mobile-global-rm561857.azurewebsites.net`. A disponibilidade e as requisições reais ainda precisam ser testadas. Para perguntas livres, publique a cópia Java complementar que contém `POST /api/chat`.
- **Firebase e vídeo:** pendentes de execução. A presença do script de distribuição não significa que o app já esteja publicado.
- **Validação local:** ver `docs/TESTES-E-ENTREGA.md` e executar `npm install`, `npm run typecheck`, `npm run lint` e os testes manuais.
- **Repositório:** https://github.com/Nicomotac/GS2026-MetroSP-Mobile. Faça commits representando modificações verdadeiras, sem simular um histórico retroativo.

## Como executar

Pré-requisitos: Node 20+ e o app **Expo Go** (ou um emulador Android).

```bash
npm install
cp .env.example .env     # no Windows PowerShell: Copy-Item .env.example .env
npx expo start           # leia o QR Code com o Expo Go ou aperte "a" para o emulador
```

- API no Azure (padrão): `https://app-global-mobile-global-rm561857.azurewebsites.net`
- API local no emulador Android: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`

Qualidade: `npm run lint` (ESLint) e `npm run typecheck` (TypeScript strict).

**Não inclua `OPENAI_API_KEY` nem segredos de banco no `.env` mobile:** variáveis `EXPO_PUBLIC_*` são incorporadas ao bundle do app. Configure a chave do ChatGPT apenas no backend.

## Publicação (Firebase App Distribution)

1. `npx eas-cli@latest login` e, se necessário, `npx eas-cli@latest init`
2. Commit final e `npm run build:apk` (perfil `preview`, gera APK)
3. Registre o app Android `br.com.fiap.metrosp.mobile` no Firebase Console → **App Distribution**. Envie o APK manualmente e adicione o professor como tester.

A tela **Sobre o App** exibe o hash do commit do build (`EAS_BUILD_GIT_COMMIT_HASH` ou `git rev-parse HEAD`).


## Chatbot com perguntas livres

A tela **Assistente IA** oferece conversa com mensagens e histórico curto. A chamada utiliza `POST /api/chat` (incluído na **cópia Java complementar** deste trabalho), que usa Spring AI e mantém a `OPENAI_API_KEY` somente no servidor. A orientação rápida por `GET /api/ocorrencias/{id}/orientacao` continua disponível na API original.

**Leia `docs/GUIA-CHAT-E-CRUD.md` para configurar a API, criar o ADMIN, fazer o CRUD no Swagger e testar tudo no Android.**
