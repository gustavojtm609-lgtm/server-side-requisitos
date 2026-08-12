# Quiz de Requisitos — projeto completo

Projeto didático em arquitetura MVC para classificar afirmações como **Requisito Funcional** ou **Requisito Não Funcional**. O conteúdo usa os contextos Pizzaria e Hotel, três dificuldades, temporizador e ranking por pontos/tempo.

## Estrutura entregue

```text
quiz-requisitos/
├── backend/   # Express, Sequelize, MySQL, JWT e regras de negócio
└── frontend/  # React, Vite, Axios e interface responsiva
```

O back-end contém 60 perguntas iniciais: 30 de Pizzaria e 30 de Hotel, distribuídas igualmente entre Fácil, Médio e Difícil. Cada pergunta possui exatamente duas alternativas.

## Início rápido — demonstração sem banco

```bash
cd frontend
npm install
npm run dev
```

O front-end inicia em modo simulado. Use o preenchimento da conta demonstrativa na tela de login.

## Aplicação completa com MySQL

### 1. Banco e API

Crie um banco MySQL chamado `quiz_requisitos`. Depois:

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

Edite o `.env` antes das migrations, informando credenciais MySQL e dois segredos JWT diferentes com pelo menos 32 caracteres.

### 2. Front-end integrado

Em outro terminal:

```bash
cd frontend
npm install
VITE_USE_MOCK=false npm run dev
```

Endereços padrão:

- interface: `http://localhost:5173`;
- API: `http://localhost:3000/api/v1`.

## Regras implementadas

- login, cadastro, refresh token rotativo e logout;
- seleção de modalidade, tema, fase e dificuldade;
- prazo de 30s no Fácil, 20s no Médio e 10s no Difícil;
- sorteio de dez perguntas válidas por partida;
- pontuação calculada no servidor por acerto, velocidade e multiplicadores;
- ranking com maior pontuação e menor tempo como desempate;
- retomada de partida ativa e processamento de resposta expirada;
- CRUDs administrativos de temas, modalidades, fases, perguntas e alternativas;
- validação, paginação, rate limit, CORS, Helmet e tratamento uniforme de erros;
- interface acessível, responsiva e com feedback visual.

Consulte os READMEs de `backend/` e `frontend/` para detalhes das rotas, variáveis e comandos.

