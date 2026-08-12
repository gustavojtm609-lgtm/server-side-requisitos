import { sequelize } from '../config/database.js';
import defineAlternative from './Alternative.js';
import defineGameAnswer from './GameAnswer.js';
import defineGameSession from './GameSession.js';
import defineModality from './Modality.js';
import definePhase from './Phase.js';
import defineQuestion from './Question.js';
import defineRanking from './Ranking.js';
import defineRefreshToken from './RefreshToken.js';
import defineTheme from './Theme.js';
import defineUser from './User.js';

export const User = defineUser(sequelize);
export const RefreshToken = defineRefreshToken(sequelize);
export const Theme = defineTheme(sequelize);
export const Modality = defineModality(sequelize);
export const Phase = definePhase(sequelize);
export const Question = defineQuestion(sequelize);
export const Alternative = defineAlternative(sequelize);
export const GameSession = defineGameSession(sequelize);
export const GameAnswer = defineGameAnswer(sequelize);
export const Ranking = defineRanking(sequelize);

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'RefreshTokens',
  onDelete: 'CASCADE',
});
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
  onDelete: 'CASCADE',
});

User.hasMany(GameSession, {
  foreignKey: 'userId',
  as: 'GameSessions',
  onDelete: 'RESTRICT',
});
GameSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
  onDelete: 'RESTRICT',
});

User.hasMany(Ranking, {
  foreignKey: 'userId',
  as: 'Rankings',
  onDelete: 'RESTRICT',
});
Ranking.belongsTo(User, {
  foreignKey: 'userId',
  as: 'User',
  onDelete: 'RESTRICT',
});

User.hasMany(Question, {
  foreignKey: 'createdBy',
  as: 'CreatedQuestions',
  onDelete: 'SET NULL',
});
Question.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'Creator',
  onDelete: 'SET NULL',
});

User.hasMany(Question, {
  foreignKey: 'updatedBy',
  as: 'UpdatedQuestions',
  onDelete: 'SET NULL',
});
Question.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'Updater',
  onDelete: 'SET NULL',
});

Theme.hasMany(Question, {
  foreignKey: 'themeId',
  as: 'Questions',
  onDelete: 'RESTRICT',
});
Question.belongsTo(Theme, {
  foreignKey: 'themeId',
  as: 'Theme',
  onDelete: 'RESTRICT',
});

Question.hasMany(Alternative, {
  foreignKey: 'questionId',
  as: 'Alternatives',
  onDelete: 'CASCADE',
});
Alternative.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'Question',
  onDelete: 'CASCADE',
});

Modality.hasMany(Phase, {
  foreignKey: 'modalityId',
  as: 'Phases',
  onDelete: 'RESTRICT',
});
Phase.belongsTo(Modality, {
  foreignKey: 'modalityId',
  as: 'Modality',
  onDelete: 'RESTRICT',
});

Modality.hasMany(GameSession, {
  foreignKey: 'modalityId',
  as: 'GameSessions',
  onDelete: 'RESTRICT',
});
GameSession.belongsTo(Modality, {
  foreignKey: 'modalityId',
  as: 'Modality',
  onDelete: 'RESTRICT',
});

Phase.hasMany(GameSession, {
  foreignKey: 'phaseId',
  as: 'GameSessions',
  onDelete: 'RESTRICT',
});
GameSession.belongsTo(Phase, {
  foreignKey: 'phaseId',
  as: 'Phase',
  onDelete: 'RESTRICT',
});

Theme.hasMany(GameSession, {
  foreignKey: 'themeId',
  as: 'GameSessions',
  onDelete: 'RESTRICT',
});
GameSession.belongsTo(Theme, {
  foreignKey: 'themeId',
  as: 'Theme',
  onDelete: 'RESTRICT',
});

GameSession.hasMany(GameAnswer, {
  foreignKey: 'gameSessionId',
  as: 'Answers',
  onDelete: 'CASCADE',
});
GameAnswer.belongsTo(GameSession, {
  foreignKey: 'gameSessionId',
  as: 'GameSession',
  onDelete: 'CASCADE',
});

Question.hasMany(GameAnswer, {
  foreignKey: 'questionId',
  as: 'GameAnswers',
  onDelete: 'RESTRICT',
});
GameAnswer.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'Question',
  onDelete: 'RESTRICT',
});

Alternative.hasMany(GameAnswer, {
  foreignKey: 'selectedAlternativeId',
  as: 'Selections',
  onDelete: 'SET NULL',
});
GameAnswer.belongsTo(Alternative, {
  foreignKey: 'selectedAlternativeId',
  as: 'SelectedAlternative',
  onDelete: 'SET NULL',
});

GameSession.hasOne(Ranking, {
  foreignKey: 'gameSessionId',
  as: 'Ranking',
  onDelete: 'CASCADE',
});
Ranking.belongsTo(GameSession, {
  foreignKey: 'gameSessionId',
  as: 'GameSession',
  onDelete: 'CASCADE',
});

Modality.hasMany(Ranking, {
  foreignKey: 'modalityId',
  as: 'Rankings',
  onDelete: 'RESTRICT',
});
Ranking.belongsTo(Modality, {
  foreignKey: 'modalityId',
  as: 'Modality',
  onDelete: 'RESTRICT',
});

Phase.hasMany(Ranking, {
  foreignKey: 'phaseId',
  as: 'Rankings',
  onDelete: 'RESTRICT',
});
Ranking.belongsTo(Phase, {
  foreignKey: 'phaseId',
  as: 'Phase',
  onDelete: 'RESTRICT',
});

Theme.hasMany(Ranking, {
  foreignKey: 'themeId',
  as: 'Rankings',
  onDelete: 'RESTRICT',
});
Ranking.belongsTo(Theme, {
  foreignKey: 'themeId',
  as: 'Theme',
  onDelete: 'RESTRICT',
});

const models = {
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
};

export { sequelize };
export default models;
