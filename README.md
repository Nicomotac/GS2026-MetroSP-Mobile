# MetroSP Ocorrências — App Mobile (Global Solution FIAP 2026/2)

**Integrantes:** Nicolas Mota (RM561857) · Caio Kenzo (RM592979)

App **React Native + TypeScript (Expo SDK 58)** ligado à API Java MetroSP publicada no Azure:

`https://app-global-mobile-global-rm561857.azurewebsites.net`

O passageiro cria a conta, entra e **cadastra, edita e exclui ocorrências** nas estações. Também conversa com o **chatbot de IA**, que usa a chave da OpenAI configurada no Web App. A chave nunca fica no app.

## Telas

| Tela | O que faz | Endpoint |
|---|---|---|
| Login | Entra com e-mail e senha | `POST /api/auth/login` |
| Criar conta | Cadastra passageiro e já entra | `POST /api/auth/cadastro` |
| Ocorrências | Lista, filtra por estação, puxa para atualizar | `GET /api/ocorrencias` |
| Detalhe | Mostra a ocorrência, pede orientação da IA, exclui | `GET /api/ocorrencias/{id}`, `GET …/{id}/orientacao`, `DELETE /api/ocorrencias/{id}` |
| Nova / Editar | Formulário completo com estação, responsável, status e datas | `GET /api/estacoes`, `GET /api/funcionarios`, `POST` e `PUT /api/ocorrencias` |
| Chatbot | Perguntas livres, com contexto opcional de uma ocorrência | `POST /api/chat` (com reserva em `…/orientacao`) |
| Perfil | Dados da sessão, tipo de conta, sair | — |
| Sobre o App | Versão, commit do build, URL da API e **teste de conexão** | `GET /actuator/health` |

## Como rodar

```bash
npm install
npx expo start --clear
```

Leia o QR Code com o **Expo Go** (SDK 58) ou aperte `a` para abrir no emulador Android.

- Sem `.env`, o app usa o Web App do Azure acima.
- Para usar outra API, copie `.env.example` para `.env`, troque a URL e rode `npx expo start --clear`.
- Na tela **Sobre o App**, confira a URL em uso e toque em **Testar conexão**.

Typecheck: `npm run typecheck`.

## Gerar o APK

```bash
npx eas-cli@latest login
npm run build:apk
```

O perfil `preview` do `eas.json` já grava a URL do Azure no APK. O pacote Android continua `br.com.fiap.metrosp.mobile` (versionCode 2), então o Firebase App Distribution reconhece como atualização.

## Estrutura

```
App.tsx                  Providers (SafeArea, Auth, Navigation)
src/
├── config.ts            URL da API e timeouts
├── model/               Tipos iguais aos DTOs da API Java
├── services/            Axios: api.ts (JWT + 401), auth, ocorrências, estações/funcionários, chat, status
├── context/             AuthContext (sessão no SecureStore)
├── hooks/               Lógica das telas: carregamento, formulário de ocorrência, chat
├── navigation/          Pilha (login ou app) + abas (Ocorrências, Chatbot, Perfil)
├── screens/             Telas
├── components/          Botão, campo, chip, status, estados de carregando/erro/vazio, teclado
├── theme/               Cores e estilos base
└── utils/               Datas (DD/MM/AAAA HH:mm ↔ LocalDateTime), JWT, mensagens de erro
```

## Pré-requisitos no lado da API

1. **Chatbot:** adicione `ChatController.java` (entregue junto com este app) em `src/main/java/br/com/fiap/metrosp/controller/` e publique a API. Sem ele, `POST /api/chat` responde 404. O app avisa e usa a orientação por ocorrência no lugar.
2. **CRUD pelo passageiro:** a API só libera `POST/PUT/DELETE /api/ocorrencias` para ADMIN. Funciona hoje porque o Web App tem `APP_DEMO_ALL_USERS_ADMIN=true`. Se desligar, o passageiro recebe 403 e o app explica o motivo.
3. **Estações:** com `SPRING_FLYWAY_ENABLED=false`, rode `V2__popular_estacoes_linha_azul.sql` no Oracle (e `COMMIT`) se a `T_ESTACAO` estiver vazia.
4. **Funcionário:** toda ocorrência precisa de um responsável (`funcionarioId`). A `T_FUNCIONARIO` precisa ter pelo menos um registro.
