# Validação e entrega — Mobile FIAP Global Solution 2026/2

Este documento acompanha o código-fonte e serve como roteiro de validação. **Não substitui um teste funcional concluído.**

## Critérios do PDF da FIAP

| Critério | Implementação no projeto | Pendência |
| --- | --- | --- |
| 6 telas com navegação | Login, Cadastro, Home, Ocorrências, Estações, Assistente IA, Perfil e outras; React Navigation Drawer + Stack | Testar fluxos no dispositivo |
| CRUD via REST | ADMIN cria/lista/edita/exclui ocorrências e estações (Axios + React Query) | API Java acessível com dados reais |
| Autenticação | Cadastro/login pela API Java, JWT no SecureStore, logout e Drawer protegido | Testar com usuário ADMIN e USER reais |
| Estilização | Cores MetroSP, fontes Poppins, ícones e logo local | Revisão visual no dispositivo |
| Arquitetura | `screen/`, `control/`, `services/`, `model/`, `navigation/`, `Theme/` | Executar lint e typecheck |
| Vídeo até 5 minutos | Demonstração de login, criação/edição/exclusão, IA e logout | Gravar e publicar link YouTube |
| Publicação | `eas.json` e script de Firebase App Distribution; commit hash em Sobre o App | Criar APK, distribuir com professor tester |

## Contrato com API Java (repositório `Nicomotac/metrosp-global-solution-api`)

- `POST /api/auth/cadastro` — cadastra USER.
- `POST /api/auth/login` — recebe JWT, `perfil` e identificador.
- `GET /api/ocorrencias`, `POST /api/ocorrencias`, `PUT /api/ocorrencias/{id}`, `DELETE /api/ocorrencias/{id}` — CRUD ADMIN; GET público.
- `GET /api/estacoes`, `POST /api/estacoes`, `PUT /api/estacoes/{id}`, `DELETE /api/estacoes/{id}` — CRUD ADMIN; GET público.
- `GET /api/ocorrencias/{id}/orientacao` e novo `POST /api/chat` (após deploy da cópia Java) — Spring AI no backend. **A chave OpenAI nunca é enviada pelo mobile.**

A integração foi confrontada com o contrato em: https://github.com/Nicomotac/metrosp-global-solution-api/blob/main/docs/INTEGRACAO-MOBILE.md

## Como testar antes do deploy

1. Para API local: iniciar a API Java na porta 8080; em emulador Android, colocar `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080` no `.env` e reiniciar o Expo. Para Android físico, usar o IP LAN da máquina, acessível no celular, com `http` permitido em ambiente de desenvolvimento.
2. Executar `npm install`, `npm run typecheck`, `npm run lint` e `npx expo start -c`.
3. Criar uma conta de passageiro e realizar login/logout. Tentar abrir telas protegidas após sair.
4. Usar uma conta ADMIN criada no backend. Criar uma estação e uma ocorrência, listar, editar, excluir e verificar persistência na API/Oracle.
5. Fazer login como USER e confirmar que operações de edição não aparecem e que os endpoints administrativos recusam requisições não autorizadas.
6. Selecionar uma ocorrência no Assistente IA e verificar a orientação Spring AI; testar também a mensagem de erro caso o modelo esteja indisponível.
7. Conferir o hash em Sobre o App, fazer build Android com perfil `preview`, publicar no Firebase App Distribution e adicionar o e-mail do professor como tester.

## Entrega exigida

- Entregar o **`ENTREGA.txt`** preenchido com nome do grupo, integrantes, link YouTube e link GitHub, e conceder acesso ao professor.
- Preencher o vídeo YouTube antes da entrega (máximo 5 minutos); manter README e código fonte correspondentes ao APK.
- No arquivo `ENTREGA.txt` e na tela Sobre o App consta o RM do segundo integrante **conforme o ZIP original**; confira os dados antes de entregar.
- O PDF exige histórico Git coerente. Faça commits com mudanças reais, não fabrique a sequência artificialmente.
- Prazo da FIAP no PDF: **19/11/2026, às 23h55**.


A implementação complementar do chat livre exige publicar `POST /api/chat` no Java. Veja `docs/GUIA-CHAT-E-CRUD.md`.
