# Guia prático — Chat com OpenAI + CRUD de ocorrências (MetroSP)

Este ZIP foi derivado do Mobile que você enviou. O código Java complementar é distribuído em **outro ZIP**, sem alterar os repositórios GitHub.

## 1. Fluxo da arquitetura

- **App Expo:** autenticação, telas, formulário de ocorrências, chat; manda token JWT via Axios.
- **API Java:** consulta/atualiza as tabelas no banco, valida ADMIN e USER, solicita respostas ao Spring AI.
- **OpenAI:** recebe requisição **somente da API Java**. Nunca configure `OPENAI_API_KEY` dentro do app, nem em `EXPO_PUBLIC_*`.

Endpoints existentes no Java original:

- `POST /api/auth/cadastro` (USER), `POST /api/auth/login` (USER ou ADMIN).
- `GET /api/estacoes` (para obter ID real da estação).
- `GET /api/ocorrencias`, `GET /api/ocorrencias/{id}` (públicos).
- `POST /api/ocorrencias`, `PUT /api/ocorrencias/{id}`, `DELETE /api/ocorrencias/{id}` (**ADMIN**).
- `GET /api/ocorrencias/{id}/orientacao` (USER ou ADMIN, Spring AI, orientação rápida).

Endpoint novo incluído na **cópia Java complementar**, ainda não presente necessariamente na versão online:

- `POST /api/chat` (USER ou ADMIN): perguntas livres, contexto opcional da ocorrência, histórico curto.

## 2. Configurar a API correta

Na pasta Mobile, copie `.env.example` para `.env` e mantenha:

```dotenv
EXPO_PUBLIC_API_URL=https://app-global-mobile-global-rm561857.azurewebsites.net
```

Para emulador Android e Java local:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

O `eas.json` usa a URL HTTPS informada no chat como perfil `preview`. Verifique que o Azure esteja com a versão Java correta antes de gerar APK. Toda alteração no valor `EXPO_PUBLIC_*` exige reiniciar Expo ou gerar outro build.

## 3. Configurar OpenAI no servidor Java (não no app)

Na configuração de ambiente do Java/Azure:

```text
OPENAI_API_KEY=<sua-chave-real-guardada-no-servidor>
SPRING_AI_MODEL_CHAT=openai
OPENAI_MODEL=gpt-4o-mini
```

Exemplo local **PowerShell** (não registre a chave no código ou no Git):

```powershell
$env:OPENAI_API_KEY = Read-Host 'Chave OpenAI'
$env:SPRING_AI_MODEL_CHAT = 'openai'
$env:OPENAI_MODEL = 'gpt-4o-mini'
.\mvnw.cmd spring-boot:run
```

Lembre de configurar também banco, JWT e RabbitMQ do Java. A chave precisa ter quota/créditos válidos na API OpenAI; a assinatura ChatGPT não equivale a créditos da API.

A versão da API Java original **não oferece chat de perguntas livres**. Publique a cópia Java deste pacote para habilitar `POST /api/chat`. Enquanto isso, a tela Mobile oferece **orientação rápida** via endpoint original `GET /api/ocorrencias/{id}/orientacao`.

## 4. Criar ADMIN (se não existir)

No backend, ADMIN é um **Funcionário**, não um passageiro. O endpoint público `POST /api/auth/cadastro` cria **USER**, que **não** pode cadastrar ocorrências.

O bootstrap cria o primeiro funcionário apenas se **a tabela de funcionários estiver vazia**. Configure temporariamente no servidor:

```text
APP_BOOTSTRAP_ENABLED=true
APP_BOOTSTRAP_EMAIL=<email-admin-escolhido>
APP_BOOTSTRAP_PASSWORD=<senha-forte-escolhida>
APP_BOOTSTRAP_CPF=<11-digitos-de-cadastro-autorizado>
```

Reinicie uma vez, teste login e depois defina `APP_BOOTSTRAP_ENABLED=false` e reinicie novamente. Se a tabela já possuir funcionários, é necessário usar uma conta ADMIN existente ou um procedimento de cadastro autorizado; o bootstrap não sobrescreve dados.

## 5. CRUD completo no Swagger

Abra `https://app-global-mobile-global-rm561857.azurewebsites.net/swagger-ui/index.html#/`.

### A — Login ADMIN

`POST /api/auth/login` > **Try it out** > **Execute** com as credenciais reais:

```json
{ "email": "<email-admin>", "senha": "<senha-admin>" }
```

Em resposta `200`, anote **`id`** (esse é o ID do **funcionário**) e **`token`**. Clique em **Authorize** no topo, cole o token (normalmente sem `Bearer `; o Swagger adiciona o esquema HTTP Bearer) e confirme. Não mostre a senha nem o token no vídeo.

### B — Encontrar uma estação real

`GET /api/estacoes` > **Try it out** > **Execute** com `page=0`, `size=10`.

Na resposta `content`, selecione um objeto e anote o campo **`id`**. Não assuma que o ID é 1 em todos os bancos.

### C — CREATE (POST)

`POST /api/ocorrencias` > **Try it out**, substituindo `estacaoId` e `funcionarioId` pelos IDs reais:

```json
{
  "tipoProblema": "Escada rolante parada",
  "mensagem": "Simulação acadêmica: escada rolante indisponível na estação.",
  "status": "A",
  "dataInicio": "2026-11-19T11:00:00",
  "dataFim": null,
  "estacaoId": 1,
  "funcionarioId": 1
}
```

**Atenção:** `1` e `1` são **exemplos**, não IDs confirmados no servidor. Esperado: `201 Created`; anote o **`id` da ocorrência** retornada no JSON. Nunca reutilize ID sem verificar.

### D — READ (GET)

`GET /api/ocorrencias/{id}` com o **ID recém-gerado** > Execute. Esperado `200 OK` com os campos persistidos.

Também é possível listar com `GET /api/ocorrencias?page=0&size=10`.

### E — UPDATE (PUT)

`PUT /api/ocorrencias/{id}` usando o mesmo ID e um **corpo completo**, mantendo os dois IDs de relacionamento:

```json
{
  "tipoProblema": "Escada rolante parada",
  "mensagem": "Simulação acadêmica: equipe foi informada e está atendendo.",
  "status": "E",
  "dataInicio": "2026-11-19T11:00:00",
  "dataFim": null,
  "estacaoId": 1,
  "funcionarioId": 1
}
```

Esperado: `200 OK`. Repita o GET para comprovar que o status e a mensagem foram alterados.

### F — DELETE

`DELETE /api/ocorrencias/{id}` > Execute. Esperado `204 No Content`. Repita o GET: deve retornar `404 Not Found`.

> Se o RabbitMQ estiver indisponível, a publicação do evento de criação pode registrar erro no backend. Confira o funcionamento do broker e confirme o registro pelo GET antes de concluir que o POST falhou.

## 6. Testar o chat no Swagger

- Para a orientação existente: `GET /api/ocorrencias/{id}/orientacao` com um ID real e JWT de USER ou ADMIN.
- Para o chatbot livre (**apenas após publicar a API Java complementar**): `POST /api/chat` > **Try it out** e envie:

```json
{
  "mensagem": "Como devo agir se o elevador de uma estação estiver fora de operação?",
  "ocorrenciaId": null,
  "historico": []
}
```

Esperado `200` com `resposta` textual. Erro `401`: login/token; `403`: perfil; `404` em `POST /api/chat`: versão Java ainda não publicada; `503`: indisponibilidade do modelo, chave ou créditos.

## 7. Teste o aplicativo no emulador

```powershell
npm install
Copy-Item .env.example .env
npm run typecheck
npm run lint
npx expo start -c
```

1. Faça login como **ADMIN**.
2. Abra **Ocorrências** e registre uma ocorrência (escolha estação e responsável existentes).
3. Confira na lista; edite; confirme no Swagger por GET; remova; confirme por GET novamente.
4. Abra **Assistente IA**, selecione a ocorrência antes de excluir (ou crie outra), teste **Orientação rápida** e envie uma pergunta livre.
5. Faça logout e login com **USER**. Confira que a tela apresenta somente consulta e não permite CRUD de ADMIN.

## 8. Entrega

Depois de testar: faça o commit no seu computador, confira o hash da tela **Sobre o App**, gere o APK via `npm run build:apk`, envie ao Firebase App Distribution e adicione o professor como tester. Grave um vídeo de no máximo cinco minutos mostrando no **app** o CRUD, autenticação e IA. O Swagger serve de evidência complementar, mas não substitui o aplicativo.

**Não foi feito push ou alteração no GitHub por este processo.**
