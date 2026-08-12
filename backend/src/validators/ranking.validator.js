import { z } from 'zod';

const optionalId = z.coerce.number().int().positive().optional();
const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export const leaderboardSchema = z.object({
  query: z
    .object({
      ...pagination,
      modalityId: optionalId,
      themeId: optionalId,
      phaseId: optionalId,
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    })
    .strict(),
});

export const historySchema = z.object({
  query: z
    .object({
      ...pagination,
      status: z
        .enum(['ACTIVE', 'COMPLETED', 'ABANDONED', 'CANCELLED', 'INVALID'])
        .optional(),
    })
    .strict(),
});
