import assert from 'node:assert/strict';
import { after, test } from 'node:test';

process.env.DB_HOST ??= '127.0.0.1';
process.env.DB_PORT ??= '3306';
process.env.DB_NAME ??= 'quiz_requisitos_test';
process.env.DB_USER ??= 'root';
process.env.DB_PASSWORD ??= '';
process.env.JWT_ACCESS_SECRET ??= 'teste-access-secret-com-mais-de-32-caracteres';
process.env.JWT_REFRESH_SECRET ??= 'teste-refresh-secret-com-mais-de-32-caracteres';

const databaseModule = await import('../src/models/index.js');

const {
  Alternative,
  GameAnswer,
  GameSession,
  Modality,
  Phase,
  Question,
  Ranking,
  RefreshToken,
  Theme,
  User,
  sequelize,
} = databaseModule;

after(async () => {
  await sequelize.close();
});

test('carrega os dez Models esperados', () => {
  const models = [
    User,
    RefreshToken,
    Theme,
    Modality,
    Phase,
    Question,
    Alternative,
    GameSession,
    GameAnswer,
    Ranking,
  ];

  assert.equal(models.length, 10);
  assert.deepEqual(
    models.map((model) => model.name),
    [
      'User',
      'RefreshToken',
      'Theme',
      'Modality',
      'Phase',
      'Question',
      'Alternative',
      'GameSession',
      'GameAnswer',
      'Ranking',
    ],
  );
});

test('registra os relacionamentos principais', () => {
  assert.ok(User.associations.GameSessions);
  assert.ok(Theme.associations.Questions);
  assert.ok(Modality.associations.Phases);
  assert.ok(Question.associations.Alternatives);
  assert.ok(GameSession.associations.Answers);
  assert.ok(GameSession.associations.Ranking);
  assert.ok(Ranking.associations.User);
});

test('normaliza a alternativa Não Funcional', async () => {
  const alternative = Alternative.build({
    questionId: 1,
    optionType: 'NON_FUNCTIONAL',
    isCorrect: true,
  });

  await alternative.validate();
  assert.equal(alternative.label, 'Não Funcional');
});

test('gera hash e compara a senha do usuário', async () => {
  const user = User.build({
    name: 'Jogador de Teste',
    email: 'JOGADOR@EXEMPLO.COM',
    password: 'SenhaSegura123!',
  });

  await user.validate();

  assert.equal(user.email, 'jogador@exemplo.com');
  assert.match(user.passwordHash, /^\$2[aby]\$/);
  assert.equal(await user.checkPassword('SenhaSegura123!'), true);
  assert.equal(await user.checkPassword('senha-incorreta'), false);
  assert.equal(user.toJSON().passwordHash, undefined);
});

test('rejeita contadores de resposta maiores que o total de perguntas', async () => {
  const session = GameSession.build({
    userId: 1,
    modalityId: 1,
    phaseId: 1,
    themeId: 1,
    difficulty: 'EASY',
    questionCount: 10,
    correctAnswers: 7,
    incorrectAnswers: 4,
    configurationSnapshot: {},
  });

  await assert.rejects(session.validate(), /total de respostas/);
});
