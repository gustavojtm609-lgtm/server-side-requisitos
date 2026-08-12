import { z } from 'zod';

const id = z.coerce.number().int().positive();
const difficulty = z.enum(['EASY', 'MEDIUM', 'HARD']);
const contentStatus = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']);
const correctType = z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL']);
const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.');
const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
};
const idParams = z.object({ id });

function patchBody(schema) {
  return schema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Informe pelo menos um campo para alteração.',
  });
}

export const idSchema = z.object({ params: idParams });

export const contentListSchema = z.object({
  query: z
    .object({
      ...pagination,
      status: contentStatus.optional(),
    })
    .strict(),
});

const themeBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    slug,
    description: z.string().trim().max(5000).nullable().optional(),
    minimumQuestions: z.coerce.number().int().min(20).max(1000).optional(),
    status: contentStatus.optional(),
  })
  .strict();

export const createThemeSchema = z.object({ body: themeBody });
export const updateThemeSchema = z.object({
  params: idParams,
  body: patchBody(themeBody),
});

const modalityBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    slug,
    description: z.string().trim().max(5000).nullable().optional(),
    defaultQuestionCount: z.coerce.number().int().min(1).max(100).optional(),
    scoreMultiplier: z.coerce.number().min(0.01).max(99.99).optional(),
    status: contentStatus.optional(),
  })
  .strict();

export const createModalitySchema = z.object({ body: modalityBody });
export const updateModalitySchema = z.object({
  params: idParams,
  body: patchBody(modalityBody),
});

export const phaseListSchema = z.object({
  query: z
    .object({
      ...pagination,
      status: contentStatus.optional(),
      modalityId: id.optional(),
    })
    .strict(),
});

const phaseBody = z
  .object({
    modalityId: id,
    name: z.string().trim().min(2).max(100),
    sequence: z.coerce.number().int().min(1),
    difficulty,
    questionCount: z.coerce.number().int().min(1).max(100),
    timeLimitSeconds: z.coerce.number().int().min(5).max(600),
    scoreMultiplier: z.coerce.number().min(0.01).max(99.99).optional(),
    status: contentStatus.optional(),
  })
  .strict();

export const createPhaseSchema = z.object({ body: phaseBody });
export const updatePhaseSchema = z.object({
  params: idParams,
  body: patchBody(phaseBody),
});

export const questionListSchema = z.object({
  query: z
    .object({
      ...pagination,
      status: contentStatus.optional(),
      themeId: id.optional(),
      difficulty: difficulty.optional(),
    })
    .strict(),
});

const questionBody = z
  .object({
    themeId: id,
    statement: z.string().trim().min(10).max(2000),
    explanation: z.string().trim().min(10).max(3000),
    difficulty,
    status: contentStatus.optional(),
    correctType,
  })
  .strict();

export const createQuestionSchema = z.object({ body: questionBody });
export const updateQuestionSchema = z.object({
  params: idParams,
  body: patchBody(questionBody),
});
export const updateAlternativesSchema = z.object({
  params: idParams,
  body: z.object({ correctType }).strict(),
});

export const userListSchema = z.object({
  query: z
    .object({
      ...pagination,
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      role: z.enum(['PLAYER', 'ADMIN']).optional(),
    })
    .strict(),
});

export const updateUserSchema = z.object({
  params: idParams,
  body: z
    .object({
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      role: z.enum(['PLAYER', 'ADMIN']).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Informe status ou perfil.',
    }),
});
