import { z } from 'zod';

export const listingSchema = z.object({
  movieName: z.string().min(1, 'Movie name is required'),
  theatreName: z.string().min(1, 'Theatre name is required'),
  showTime: z.string().min(1, 'Show time is required'),
  seatNumber: z.string().min(1, 'Seat number is required'),
  originalPrice: z.number().positive(),
  sellingPrice: z.number().nonnegative(),
  screenshotUrl: z.string().url().or(z.literal('')),
  description: z.string(),
});
