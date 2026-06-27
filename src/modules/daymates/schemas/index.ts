import { z } from 'zod';

export const dayMatesCompanionSchema = z.object({
  movieId: z.string(),
  description: z.string(),
});
