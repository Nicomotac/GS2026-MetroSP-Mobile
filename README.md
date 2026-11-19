# MetroSP Ocorrências — App Mobile (Global Solution FIAP 2026/2 · CitizenTech)

**Integrantes:** Nicolas Mota (RM561857) · Caio Kenzo (RM592979)

- 🎥 **Vídeo:** COLE_AQUI_O_LINK_DO_YOUTUBE
- ☕ **API Java (Azure):** https://app-global-mobile-global-rm561857.azurewebsites.net/swagger-ui.html
- 📦 **Firebase App Distribution:** APK do perfil `preview`, com o professor como tester

App **React Native + TypeScript (Expo SDK 58)** para o cidadão registrar e acompanhar problemas nas estações do metrô de São Paulo (escada rolante parada, elevador, superlotação...) e tirar dúvidas com um **chatbot de IA**. Os dados ficam na API Java, nunca só no celular. A chave da OpenAI fica apenas no Web App.

## Telas (9 + Sobre o App)

| #   | Tela                     | O que faz                                                           | API                                                                                  |
| --- | ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Login                    | Autenticação real com JWT                                           | `POST /api/auth/login`                                                               |
| 2   | Criar conta              | Cadastro de passageiro com validação                                | `POST /api/auth/cadastro`                                                            |
| 3   | Início                   | Painel com totais por status, atalhos e últimas ocorrências         | `GET /api/ocorrencias`                                                               |
| 4   | Ocorrências              | Lista com filtro por estação e "puxar para atualizar" (**Read**)    | `GET /api/ocorrencias`                                                               |
| 5   | Detalhe da ocorrência    | Dados completos, orientação da IA e exclusão (**Delete**)           | `GET /api/ocorrencias/{id}`, `GET …/{id}/orientacao`, `DELETE /api/ocorrencias/{id}` |
| 6   | Nova / Editar ocorrência | Formulário validado (**Create** e **Update**)                       | `POST` e `PUT /api/ocorrencias`                                                      |
| 7   | Estações                 | Estações com busca, total de ocorrências abertas e "registrar aqui" | `GET /api/estacoes`                                                                  |
| 8   | Chatbot                  | Perguntas livres com contexto opcional de uma ocorrência            | `POST /api/chat`                                                                     |
| 9   | Perfil                   | Dados da sessão e logout                                            | —                                                                                    |
| —   | Sobre o App              | Versão, **hash do commit** e teste de conexão com a API             | `GET /actuator/health`                                                               |

## Como os requisitos foram atendidos

| Requisito              | Onde                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Telas e navegação   | React Navigation: pilha (`native-stack`) + abas (`bottom-tabs`) em `src/navigation/`. Rótulos de acessibilidade em botões, cartões e campos.                          |
| 2. CRUD com a API Java | Axios em `src/services/` com JWT no cabeçalho; carregando, erro com "tentar de novo", alertas de sucesso e mensagens da API em todas as telas.                        |
| 3. Autenticação        | Cadastro, login e logout em `src/context/AuthContext.tsx`. Token no `expo-secure-store`. Sem sessão, as telas logadas não existem na navegação; 401 encerra a sessão. |
| 4. Identidade visual   | Cores do metrô em `src/theme/tema.ts`, fonte **Poppins** em `assets/fonts/` e logotipo e ícones em `assets/`.                                                         |
| 5. Arquitetura         | Pastas por responsabilidade (abaixo), **ESLint** (`eslint-config-expo` + Prettier) e **Prettier** configurados.                                                       |
| 7. Publicação          | `eas.json` (perfil `preview` gera APK) e hash do commit na tela Sobre o App (`app.config.js`).                                                                        |

## Estrutura

```
App.tsx                  Carrega as fontes e monta os providers (SafeArea, Auth, Navigation)
assets/                  Ícone, splash, logotipo e fonts/ (Poppins + licença OFL)
src/
├── config.ts            URL da API e timeouts
├── model/               Tipos iguais aos DTOs da API Java
├── services/            Acesso à API REST (Axios): api.ts, auth, ocorrências, estações, chat, status
├── context/             AuthContext: sessão, login, cadastro, logout
├── hooks/               Lógica das telas: carregamento, formulário de ocorrência, chat
├── navigation/          Rotas: pilha (login ou app) + abas
├── screens/             Telas (só interface)
├── components/          Botão, campo, chip, cartão de ocorrência, status, estados de tela, teclado
├── theme/               Cores, fontes e estilos base
└── utils/               Datas (DD/MM/AAAA HH:mm ↔ LocalDateTime), JWT, mensagens de erro
```

## Como rodar

```bash
npm install
npx expo start --clear
```

Leia o QR Code com o **Expo Go** (SDK 58) ou aperte `a` para abrir no emulador Android. Sem `.env`, o app usa a API do Azure. Para trocar, copie `.env.example` para `.env`.

Qualidade de código:

```bash
npm run lint        # ESLint
npm run format      # Prettier
npm run typecheck   # TypeScript
```

## Publicação

```bash
npx eas-cli@latest login
npm run build:apk
```

Envie o APK ao **Firebase App Distribution** (app Android `br.com.fiap.metrosp.mobile`) e adicione o e-mail do professor como tester. Faça o commit antes do build: a tela Sobre o App mostra o hash do commit usado.

## Pré-requisitos na API

1. `ChatController` publicado (`POST /api/chat`) para o chatbot de perguntas livres.
2. CRUD de ocorrências por passageiros: o Web App precisa de `APP_DEMO_ALL_USERS_ADMIN=true` (a API libera escrita só para ADMIN).
3. `T_ESTACAO` com estações e `T_FUNCIONARIO` com pelo menos um funcionário (responsável da ocorrência).
