import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PRODUCTS_API_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(4200),
})

export type Env = z.infer<typeof envSchema>
