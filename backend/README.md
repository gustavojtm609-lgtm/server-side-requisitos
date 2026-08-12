# Back-end — Etapas 2 e 3

Este back-end contém banco e modelagem da Etapa 2 e a API REST da Etapa 3: autenticação JWT, refresh token rotativo, jogo com temporizador validado no servidor, pontuação, ranking, CRUDs administrativos, validações e testes.

## Tecnologias

- Node.js 20 ou superior
- Sequelize 6
- MySQL com o driver `mysql2`
- Express 5
- JWT de acesso e renovação
- Zod para validação das entradas
- JavaScript usando ES Modules

## Models

| Model | Responsabilidade |
| --- | --- |
| User | Jogadores e administradores, senha protegida e exclusão lógica |
| RefreshToken | Sessões renováveis que poderão ser revogadas no logout |
| Theme | Temas Pizzaria, Hotel e novos temas administrativos |
| Modality | Modalidades do jogo, como Clássica |
| Phase | Dificuldade, ordem, quantidade, tempo e multiplicador |
| Question | Afirmação, explicação, tema, dificuldade e estado |
| Alternative | As duas opções permitidas e indicação da correta |
| GameSession | Partida, configuração congelada, resultado e tempo total |
| GameAnswer | Pergunta sorteada, snapshots, resposta, prazo e pontos |
| Ranking | Resultado concluído e indicação da melhor tentativa |

## Relacionamentos principais

- User 1:N RefreshToken
- User 1:N GameSession
- User 1:N Ranking
- Theme 1:N Question
- Question 1:N Alternative
- Modality 1:N Phase
- User, Theme, Modality e Phase 1:N GameSession
- GameSession 1:N GameAnswer
- Question 1:N GameAnswer
- Alternative 1:N GameAnswer como alternativa selecionada
- GameSession 1:1 Ranking

## Dados iniciais

O seeder cria:

- os temas Pizzaria e Hotel;
- a modalidade Clássica;
- as fases Fácil, Médio e Difícil;
- 30 perguntas por tema, sendo 10 de cada dificuldade;
- duas alternativas por pergunta, totalizando 120 alternativas.

Isso garante mais do que o mínimo solicitado de 20 perguntas para cada tema e permite partidas de 10 perguntas em qualquer dificuldade.

## Rotas da API

Prefixo: `/api/v1`.

### Autenticação

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register` | Público | Cadastra jogador e inicia a sessão |
| POST | `/auth/login` | Público | Autentica e entrega access token |
| POST | `/auth/refresh` | Cookie refresh | Rotaciona o refresh token |
| POST | `/auth/logout` | Cookie refresh | Revoga a sessão e limpa o cookie |
| GET | `/auth/me` | JWT | Retorna o usuário autenticado |

### Jogo e ranking

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/game/options` | Lista temas, modalidades e fases disponíveis |
| GET | `/game/active` | Recupera a partida ativa e trata tempo esgotado |
| POST | `/game/sessions` | Inicia uma nova partida |
| POST | `/game/sessions/:sessionId/answer` | Responde à pergunta atual |
| POST | `/game/sessions/:sessionId/abandon` | Abandona uma partida |
| GET | `/game/sessions/:sessionId/result` | Consulta o resultado concluído |
| GET | `/rankings` | Consulta ranking filtrado e paginado |
| GET | `/rankings/me/history` | Consulta o próprio histórico |
| GET | `/rankings/me/summary` | Consulta estatísticas pessoais |

Todas essas rotas exigem `Authorization: Bearer <accessToken>`.

### Administração

As rotas `/admin` exigem JWT de um usuário com perfil `ADMIN`.

| Recurso | Operações |
| --- | --- |
| `/admin/themes` | Listar, consultar, criar, editar e arquivar temas |
| `/admin/modalities` | Listar, consultar, criar, editar e arquivar modalidades |
| `/admin/phases` | Listar, consultar, criar, editar e arquivar fases |
| `/admin/questions` | Listar, consultar, criar, editar e arquivar perguntas |
| `/admin/questions/:id/alternatives` | Definir atomicamente a alternativa correta |
| `/admin/users` | Listar usuários e alterar perfil/status |

As alternativas usam um CRUD controlado: as duas opções são criadas junto com a pergunta, podem ser consultadas e atualizadas em conjunto e são arquivadas com a pergunta. Isso impede que uma pergunta publicada fique com uma ou três alternativas.

## Configuração

### 1. Criar o banco

```sql
CREATE DATABASE quiz_requisitos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar as variáveis

Copie `.env.example` para `.env` e informe seus dados do MySQL.

No Windows:

```powershell
copy .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Altere principalmente:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=quiz_requisitos
DB_USER=root
DB_PASSWORD=sua_senha

JWT_ACCESS_SECRET=use-um-segredo-aleatorio-com-32-caracteres-ou-mais
JWT_REFRESH_SECRET=use-outro-segredo-diferente-com-32-caracteres-ou-mais
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_DAYS=7
CORS_ORIGIN=http://localhost:5173
```

### 3. Instalar e preparar

```bash
npm install
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

O administrador inicial será criado pelo seeder apenas quando `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem preenchidos no `.env`.

## Comandos disponíveis

| Comando | Ação |
| --- | --- |
| `npm run dev` | Inicia a API e reinicia ao detectar alterações |
| `npm start` | Inicia a API normalmente |
| `npm run db:check` | Testa a conexão com o MySQL |
| `npm run db:migrate` | Cria as tabelas por migration |
| `npm run db:migrate:undo` | Desfaz a última migration |
| `npm run db:seed` | Insere modalidade, fases, temas, perguntas e alternativas |
| `npm run db:seed:undo` | Remove os dados dos seeders |
| `npm run db:sync:dev` | Sincroniza Models somente em desenvolvimento |
| `npm run lint` | Verifica problemas estáticos no código |
| `npm test` | Executa todos os testes automatizados |

## Observações de segurança e integridade

- A senha é transformada em hash com bcrypt antes de ser salva.
- O access token e o refresh token usam segredos diferentes; o refresh é salvo apenas como hash e rotacionado a cada uso.
- A resposta correta não é enviada ao front-end antes de a pergunta ser encerrada.
- Tempo, correção, pontos e ranking são calculados no servidor dentro de transações.
- Partidas e respostas guardam snapshots, preservando o histórico mesmo quando o conteúdo for editado.
- Entidades administrativas utilizam exclusão lógica com `deleted_at`.
- Helmet, CORS restrito, limite de requisições e validação Zod são aplicados à API.
- A migration deve ser usada em produção. `sequelize.sync()` ficou restrito ao desenvolvimento.

### Dependência transitiva conhecida

O `npm audit` pode apontar um aviso moderado no pacote transitivo `uuid` usado pelo Sequelize 6. Não foi utilizado `npm audit fix --force`, pois a correção automática sugerida troca a versão principal do Sequelize e pode quebrar o projeto. A recomendação é atualizar quando o pacote oficial disponibilizar uma correção compatível.
