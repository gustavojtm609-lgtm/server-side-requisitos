import { z } from 'zod';

const id = z.coerce.number().int().positive();
const difficulty = z.enum(['EASY', 'MEDIUM', 'HARD']);
const sessionParams = z.object({
  sessionId: z.string().uuid(),
});

export const startGameSchema = z.object({
  body: z
    .object({
      modalityId: id,
      themeId: id,
      phaseId: id.optional(),
      difficulty,
    })
    .strict(),
});

export const sessionSchema = z.object({
  params: sessionParams,
});

export const answerSchema = z.object({
  params: sessionParams,
  body: z
    .object({
      alternativeId: id,
    })
    .strict(),
});
