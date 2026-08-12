export const USER_ROLES = Object.freeze(['PLAYER', 'ADMIN']);
export const USER_STATUSES = Object.freeze(['ACTIVE', 'INACTIVE']);

export const CONTENT_STATUSES = Object.freeze([
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED',
]);

export const DIFFICULTIES = Object.freeze(['EASY', 'MEDIUM', 'HARD']);

export const ALTERNATIVE_TYPES = Object.freeze([
  'FUNCTIONAL',
  'NON_FUNCTIONAL',
]);

export const ALTERNATIVE_LABELS = Object.freeze({
  FUNCTIONAL: 'Funcional',
  NON_FUNCTIONAL: 'Não Funcional',
});

export const GAME_STATUSES = Object.freeze([
  'ACTIVE',
  'COMPLETED',
  'ABANDONED',
  'CANCELLED',
  'INVALID',
]);

export const ANSWER_STATUSES = Object.freeze([
  'PENDING',
  'ANSWERED',
  'TIMED_OUT',
]);
