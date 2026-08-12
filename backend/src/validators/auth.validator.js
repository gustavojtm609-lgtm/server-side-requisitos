import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve possuir pelo menos 8 caracteres.')
  .max(72, 'A senha deve possuir no máximo 72 caracteres.')
  .regex(/[a-z]/, 'A senha deve possuir uma letra minúscula.')
  .regex(/[A-Z]/, 'A senha deve possuir uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve possuir um número.');

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.email().max(150),
      password: passwordSchema,
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.email().max(150),
      password: z.string().min(1).max(72),
    })
    .strict(),
});

export const optionalRefreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional(),
    })
    .strict(),
});
