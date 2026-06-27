import { z } from 'zod';

export const ticketSwapListingSchema = z.object({
  ticketId: z.string(),
  price: z.number(),
});
