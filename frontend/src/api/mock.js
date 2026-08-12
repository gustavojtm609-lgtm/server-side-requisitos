import AxiosMockAdapter from 'axios-mock-adapter';

const themes = [
  {
    id: 1,
    name: 'Hotel',
    slug: 'hotel',
    description: 'Reservas, hospedagem e gestão hoteleira.',
  },
  {
    id: 2,
    name: 'Pizzaria',
    slug: 'pizzaria',
    description: 'Pedidos, cardápio e operação de uma pizzaria.',
  },
];

const phases = [
  {
    id: 1,
    name: 'Fácil',
    sequence: 1,
    difficulty: 'EASY',
    questionCount: 10,
    timeLimitSeconds: 30,
    scoreMultiplier: 1,
  },
  {
    id: 2,
    name: 'Médio',
    sequence: 2,
    difficulty: 'MEDIUM',
    questionCount: 10,
    timeLimitSeconds: 20,
    scoreMultiplier: 1.5,
  },
  {
    id: 3,
    name: 'Difícil',
    sequence: 3,
    difficulty: 'HARD',
    questionCount: 10,
    timeLimitSeconds: 10,
    scoreMultiplier: 2,
  },
];

const modalities = [
  {
    id: 1,
    name: 'Clássica',
    slug: 'classica',
    description: 'Dez afirmações, pontos por acerto e bônus de velocidade.',
    defaultQuestionCount: 10,
    scoreMultiplier: 1,
    Phases: phases,
  },
];

const questionBank = {
  hotel: [
    ['O hóspede deve poder pesquisar quartos disponíveis por período.', 'FUNCTIONAL', 'Pesquisar disponibilidade é uma função oferecida ao hóspede.'],
    ['A pesquisa de quartos deve responder em até dois segundos.', 'NON_FUNCTIONAL', 'O limite mensurável descreve desempenho.'],
    ['O hóspede deve poder reservar um quarto disponível.', 'FUNCTIONAL', 'Criar uma reserva é uma funcionalidade central.'],
    ['O processo de reserva deve ser totalmente utilizável pelo teclado.', 'NON_FUNCTIONAL', 'A afirmação define acessibilidade e usabilidade.'],
    ['O recepcionista deve poder registrar o check-in do hóspede.', 'FUNCTIONAL', 'Registrar a entrada é uma operação do sistema.'],
    ['As senhas nunca devem ser gravadas em texto puro.', 'NON_FUNCTIONAL', 'A restrição trata da segurança dos dados.'],
    ['O sistema deve calcular diárias, taxas e serviços contratados.', 'FUNCTIONAL', 'O cálculo é uma regra funcional de negócio.'],
    ['O serviço deve manter disponibilidade mensal mínima de 99,9%.', 'NON_FUNCTIONAL', 'Disponibilidade é uma propriedade de qualidade.'],
    ['O hóspede deve poder cancelar uma reserva conforme a tarifa.', 'FUNCTIONAL', 'O cancelamento condicionado é uma funcionalidade.'],
    ['O banco de reservas deve possuir backup diário automatizado.', 'NON_FUNCTIONAL', 'Backup é uma exigência de confiabilidade.'],
  ],
  pizzaria: [
    ['O cliente deve poder adicionar e remover pizzas do carrinho.', 'FUNCTIONAL', 'Adicionar e remover itens são comportamentos do sistema.'],
    ['A página do cardápio deve carregar em até dois segundos.', 'NON_FUNCTIONAL', 'A afirmação estabelece um limite de desempenho.'],
    ['O sistema deve calcular itens, adicionais, descontos e entrega.', 'FUNCTIONAL', 'Calcular o total é uma regra funcional.'],
    ['O sistema deve suportar 500 usuários simultâneos.', 'NON_FUNCTIONAL', 'A capacidade sob carga é um requisito de desempenho.'],
    ['O cliente deve poder acompanhar o status do pedido.', 'FUNCTIONAL', 'Consultar o status é uma função visível.'],
    ['Dados de pagamento devem usar conexão criptografada.', 'NON_FUNCTIONAL', 'A afirmação define uma restrição de segurança.'],
    ['O cliente deve poder aplicar um cupom válido.', 'FUNCTIONAL', 'Aplicar cupons é uma operação do sistema.'],
    ['A aplicação deve ter disponibilidade mensal de 99,5%.', 'NON_FUNCTIONAL', 'Disponibilidade é uma característica de qualidade.'],
    ['Após o pagamento, o sistema deve enviar o pedido à cozinha.', 'FUNCTIONAL', 'O envio automático é um comportamento do sistema.'],
    ['O banco deve receber backup diário com retenção de 30 dias.', 'NON_FUNCTIONAL', 'Backup e retenção tratam da confiabilidade operacional.'],
  ],
};

const initialRankings = [
  ['Ana Souza', 1840, 83_420, 'Pizzaria', 'MEDIUM'],
  ['Caio Lima', 1760, 79_180, 'Hotel', 'HARD'],
  ['Bia Martins', 1690, 91_550, 'Hotel', 'MEDIUM'],
  ['Diego Alves', 1580, 88_760, 'Pizzaria', 'EASY'],
  ['Elisa Rocha', 1490, 95_130, 'Pizzaria', 'MEDIUM'],
].map(([name, score, totalTimeMs, theme, difficulty], index) => ({
  id: index + 1,
  score,
  totalTimeMs,
  difficulty,
  completedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
  User: { id: index + 10, name },
  Theme: { id: theme === 'Hotel' ? 1 : 2, name: theme, slug: theme.toLowerCase() },
  Modality: { id: 1, name: 'Clássica', slug: 'classica' },
  Phase: { id: phases.find((item) => item.difficulty === difficulty).id, name: phases.find((item) => item.difficulty === difficulty).name },
}));

const response = (data, status = 200) => [status, { success: true, data }];
const failure = (status, code, message) => [
  status,
  { success: false, error: { code, message } },
];

function parseBody(config) {
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}`;
}

export function installMockApi(client) {
  const mock = new AxiosMockAdapter(client, { delayResponse: 320 });
  let user = { id: 99, name: 'Jogador Demo', email: 'demo@quiz.dev', role: 'PLAYER' };
  let activeGame = null;
  const completedGames = new Map();
  const rankings = [...initialRankings];

  function sessionSummary(game) {
    return {
      id: game.id,
      status: game.status,
      difficulty: game.difficulty,
      questionCount: game.questions.length,
      currentQuestionIndex: game.index,
      score: game.score,
      correctAnswers: game.correctAnswers,
      incorrectAnswers: game.incorrectAnswers,
      totalTimeMs: game.totalTimeMs,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      configuration: game.configuration,
    };
  }

  function currentQuestion(game) {
    const item = game.questions[game.index];
    return {
      answerId: game.index + 1,
      questionId: item.id,
      position: game.index + 1,
      totalQuestions: game.questions.length,
      statement: item.statement,
      alternatives: [
        { id: item.id * 10 + 1, type: 'FUNCTIONAL', label: 'Funcional' },
        { id: item.id * 10 + 2, type: 'NON_FUNCTIONAL', label: 'Não Funcional' },
      ],
      presentedAt: game.presentedAt,
      deadlineAt: game.deadlineAt,
      timeLimitMs: game.timeLimitMs,
    };
  }

  function gameResult(game) {
    return {
      session: sessionSummary(game),
      accuracy: Number(((game.correctAnswers / game.questions.length) * 100).toFixed(2)),
      answers: game.answers,
    };
  }

  function gameState(game, feedback) {
    return {
      session: sessionSummary(game),
      ...(game.status === 'ACTIVE'
        ? { currentQuestion: currentQuestion(game) }
        : { result: gameResult(game) }),
      ...(feedback ? { feedback } : {}),
    };
  }

  function presentNext(game) {
    game.presentedAt = new Date().toISOString();
    game.deadlineAt = new Date(Date.now() + game.timeLimitMs).toISOString();
  }

  function finishGame(game) {
    game.status = 'COMPLETED';
    game.finishedAt = new Date().toISOString();
    completedGames.set(game.id, gameResult(game));
    rankings.push({
      id: rankings.length + 1,
      score: game.score,
      totalTimeMs: game.totalTimeMs,
      difficulty: game.difficulty,
      completedAt: game.finishedAt,
      User: { id: user.id, name: user.name },
      Theme: game.configuration.theme,
      Modality: game.configuration.modality,
      Phase: game.configuration.phase,
    });
    activeGame = null;
  }

  function closeCurrentQuestion(game, selectedType, timedOut = false) {
    const question = game.questions[game.index];
    const effectiveSelectedType = timedOut ? null : selectedType;
    const elapsed = timedOut
      ? game.timeLimitMs
      : Math.min(Date.now() - new Date(game.presentedAt).getTime(), game.timeLimitMs);
    const isCorrect = !timedOut && effectiveSelectedType === question.correctType;
    const basePoints = { EASY: 100, MEDIUM: 150, HARD: 200 }[game.difficulty];
    const speedBonus = isCorrect
      ? Math.round(basePoints * Math.max(0, (game.timeLimitMs - elapsed) / game.timeLimitMs))
      : 0;
    const points = isCorrect ? basePoints + speedBonus : 0;

    game.score += points;
    game.totalTimeMs += elapsed;
    game.correctAnswers += isCorrect ? 1 : 0;
    game.incorrectAnswers += isCorrect ? 0 : 1;
    game.answers.push({
      position: game.index + 1,
      questionId: question.id,
      statement: question.statement,
      status: timedOut ? 'TIMED_OUT' : 'ANSWERED',
      selectedType: effectiveSelectedType,
      correctType: question.correctType,
      isCorrect,
      explanation: question.explanation,
      points,
      responseTimeMs: elapsed,
    });

    const feedback = {
      timedOut,
      selectedType: effectiveSelectedType,
      correctType: question.correctType,
      isCorrect,
      explanation: question.explanation,
      points,
    };

    game.index += 1;
    if (game.index >= game.questions.length) {
      finishGame(game);
    } else {
      presentNext(game);
    }
    return feedback;
  }

  mock.onPost('/auth/login').reply((config) => {
    const body = parseBody(config);
    if (!body?.email || !body?.password) {
      return failure(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
    }
    user = { ...user, email: body.email };
    return response({ user, accessToken: `mock-access-${Date.now()}` });
  });

  mock.onPost('/auth/register').reply((config) => {
    const body = parseBody(config);
    user = { ...user, name: body.name, email: body.email };
    return response({ user, accessToken: `mock-access-${Date.now()}` }, 201);
  });

  mock.onPost('/auth/refresh').reply(() =>
    response({ user, accessToken: `mock-refresh-${Date.now()}` }),
  );
  mock.onGet('/auth/me').reply(() => response({ user }));
  mock.onPost('/auth/logout').reply(204);

  mock.onGet('/game/options').reply(() => response({ themes, modalities }));

  mock.onPost('/game/sessions').reply((config) => {
    const body = parseBody(config);
    const theme = themes.find((item) => item.id === Number(body.themeId));
    const phase = phases.find((item) => item.difficulty === body.difficulty);
    if (!theme || !phase) {
      return failure(400, 'INVALID_GAME_CONFIGURATION', 'Configuração de partida inválida.');
    }

    const questions = questionBank[theme.slug].map(([statement, correctType, explanation], index) => ({
      id: theme.id * 100 + index + 1,
      statement,
      correctType,
      explanation,
    }));
    const modality = modalities[0];
    activeGame = {
      id: makeId(),
      status: 'ACTIVE',
      difficulty: phase.difficulty,
      questions,
      index: 0,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeMs: 0,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      answers: [],
      timeLimitMs: phase.timeLimitSeconds * 1000,
      configuration: {
        theme: { id: theme.id, name: theme.name, slug: theme.slug },
        modality: { id: modality.id, name: modality.name, slug: modality.slug },
        phase: { ...phase },
      },
    };
    presentNext(activeGame);
    return response(gameState(activeGame), 201);
  });

  mock.onGet('/game/active').reply(() => {
    if (!activeGame) {
      return failure(404, 'ACTIVE_GAME_NOT_FOUND', 'Nenhuma partida ativa foi encontrada.');
    }
    let feedback;
    if (new Date(activeGame.deadlineAt).getTime() <= Date.now()) {
      feedback = closeCurrentQuestion(activeGame, null, true);
      if (!activeGame) {
        const lastResult = [...completedGames.values()].at(-1);
        return response({ ...lastResult, result: lastResult, feedback });
      }
    }
    return response(gameState(activeGame, feedback));
  });

  mock.onPost(/\/game\/sessions\/[^/]+\/answer$/).reply((config) => {
    if (!activeGame) {
      return failure(409, 'GAME_NOT_ACTIVE', 'A partida não está ativa.');
    }
    const { alternativeId } = parseBody(config);
    const question = activeGame.questions[activeGame.index];
    const selectedType = Number(alternativeId) === question.id * 10 + 1
      ? 'FUNCTIONAL'
      : 'NON_FUNCTIONAL';
    const feedback = closeCurrentQuestion(
      activeGame,
      selectedType,
      new Date(activeGame.deadlineAt).getTime() <= Date.now(),
    );

    if (!activeGame) {
      const result = [...completedGames.values()].at(-1);
      return response({ session: result.session, result, feedback });
    }
    return response(gameState(activeGame, feedback));
  });

  mock.onPost(/\/game\/sessions\/[^/]+\/abandon$/).reply(() => {
    if (!activeGame) {
      return failure(409, 'GAME_NOT_ACTIVE', 'A partida não está ativa.');
    }
    activeGame.status = 'ABANDONED';
    activeGame.finishedAt = new Date().toISOString();
    const summary = sessionSummary(activeGame);
    activeGame = null;
    return response({ session: summary });
  });

  mock.onGet(/\/game\/sessions\/[^/]+\/result$/).reply((config) => {
    const id = config.url.split('/').at(-2);
    const result = completedGames.get(id);
    return result
      ? response(result)
      : failure(404, 'GAME_NOT_FOUND', 'Resultado não encontrado.');
  });

  mock.onGet('/rankings').reply((config) => {
    const { themeId, difficulty } = config.params || {};
    const items = rankings
      .filter((item) => !themeId || item.Theme.id === Number(themeId))
      .filter((item) => !difficulty || item.difficulty === difficulty)
      .sort((first, second) => second.score - first.score || first.totalTimeMs - second.totalTimeMs)
      .slice(0, 20)
      .map((item, index) => ({ ...item, position: index + 1 }));
    return response({
      items,
      pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
    });
  });

  mock.onGet('/rankings/me/history').reply(() => {
    const items = [...completedGames.values()].map((item) => item.session);
    return response({
      items,
      pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
    });
  });

  mock.onGet('/rankings/me/summary').reply(() => {
    const results = [...completedGames.values()];
    return response({
      completedGames: results.length,
      rankedBestResults: results.length,
      bestScore: Math.max(0, ...results.map((item) => item.session.score)),
      correctAnswers: results.reduce((sum, item) => sum + item.session.correctAnswers, 0),
      incorrectAnswers: results.reduce((sum, item) => sum + item.session.incorrectAnswers, 0),
    });
  });

  return mock;
}
