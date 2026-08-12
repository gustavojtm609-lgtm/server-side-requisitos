# Front-end — Etapa 4

Aplicação React + Vite em JavaScript para o Quiz de Requisitos. O mesmo código funciona em duas formas:

- **modo simulado:** o `axios-mock-adapter` responde na própria instância Axios, sem exigir MySQL ou API ativa;
- **modo integrado:** as requisições são enviadas à API Express das Etapas 2 e 3.

## Telas e recursos

- login, cadastro e logout;
- sessão com access token e renovação por cookie HTTP-only;
- seleção dos temas Hotel/Pizzaria e das dificuldades Fácil/Médio/Difícil;
- recuperação de partida ativa;
- jogo com duas alternativas: Funcional e Não Funcional;
- temporizador baseado no `deadlineAt` recebido do servidor;
- feedback, pontuação e tratamento de tempo esgotado;
- resultado com precisão e revisão de todas as respostas;
- ranking filtrável por tema e dificuldade;
- perfil com indicadores e histórico;
- rotas protegidas, estados de carregamento/erro e layout responsivo.

## Executar em modo simulado

O arquivo `.env.development` já deixa a simulação habilitada:

```bash
npm install
npm run dev
```

Na tela de login, use o botão **Preencher conta de demonstração**. Também é possível cadastrar qualquer conta fictícia nesse modo.

## Executar com a API real

Com o back-end ativo em `http://localhost:3000`:

```bash
VITE_USE_MOCK=false npm run dev
```

No Windows PowerShell:

```powershell
$env:VITE_USE_MOCK="false"
npm run dev
```

Para outra URL, crie `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_USE_MOCK=false
```

## Integração Axios

A instância em `src/api/client.js`:

- envia cookies com `withCredentials`;
- inclui o access token em `Authorization: Bearer`;
- tenta renovar uma sessão expirada uma única vez;
- repete a requisição original após o refresh;
- encerra a sessão local caso a renovação falhe;
- normaliza mensagens de erro da API.

Os módulos `auth.js`, `game.js` e `ranking.js` isolam o contrato HTTP das páginas. O arquivo `mock.js` simula as mesmas rotas e o mesmo formato de resposta da API real.

## Comandos

| Comando | Ação |
| --- | --- |
| `npm run dev` | inicia o Vite em desenvolvimento |
| `npm run build` | gera o pacote de produção em `dist/` |
| `npm run validate:artifact` | confirma a integridade do pacote gerado |
| `npm run preview` | abre localmente o pacote gerado |
| `npm run lint` | verifica o código com ESLint |
| `npm test` | executa os testes com Vitest |
