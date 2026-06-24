import { z } from "zod";

// TLM Helper function to construct safe strings avoiding XSS HTML entities injection
export function makeSafeString(schema: z.ZodString) {
  return schema
    .refine((val) => {
      const htmlRegex = /<[^>]*>/g;
      return !htmlRegex.test(val);
    }, {
      message: "Security exception: Input strings are not permitted to contain embedded HTML elements or script injected tags."
    })
    .transform((val) => {
      return val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    });
}

// Optional version of safe strings
export const safeOptionalString = z.string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    const htmlRegex = /<[^>]*>/g;
    return !htmlRegex.test(val);
  }, {
    message: "Security exception: Input optional description is not permitted to contain HTML structures."
  })
  .transform((val) => {
    if (!val) return "";
    return val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });

// Base validator helper for ID checks (User ID, listing ID, tx ID)
export const idSchema = z.string()
  .min(3, { message: "ID must be at least 3 characters long" })
  .refine((val) => {
    if (val.startsWith("user_")) {
      return val.length >= 8; // e.g., 'user_123'
    }
    return true;
  }, {
    message: "Invalid ID formatting: User IDs must be formatted with 'user_' prefix and sufficient length."
  });

// Indian Mobile Phone validator
export const mobileSchema = z.string()
  .regex(/^[6-9]\d{9}$/, { message: "Must be a valid 10-digit Indian mobile number starting with 6-9" });

// OTP code validator (usually 6 digits)
export const otpSchema = z.string()
  .regex(/^\d{6}$/, { message: "OTP must be a 6-digit verification code" });

// 1. Zod User Registration Schema
export const registerSchema = z.object({
  name: makeSafeString(z.string().min(2, { message: "Name must be at least 2 characters long" })),
  mobileNumber: mobileSchema,
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  email: z.string().email({ message: "Invalid email address format" }).optional().or(z.literal('')),
  role: z.enum(["buyer", "seller", "admin"]).default("buyer"),
  avatar: z.string().url().optional(),
});

// 2. Mobile Login OTP request schema
export const requestOtpSchema = z.object({
  mobileNumber: mobileSchema,
});

// 3. Mobile Verifying Login Schema
export const loginSchema = z.object({
  mobileNumber: mobileSchema,
  otp: otpSchema.optional(), // Simulated login with OTP
  password: z.string().min(6).optional(), // Custom credentials
});

// 4. Listing creation schema
export const createListingSchema = z.object({
  movieName: makeSafeString(z.string().min(2, { message: "Movie name is required" })),
  theatreName: makeSafeString(z.string().min(3, { message: "Theatre or venue name is required" })),
  showTime: z.string(), // ISO String
  seatNumber: makeSafeString(z.string().min(1, { message: "Seat layout information is required" })),
  originalPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  screenshotUrl: z.string().url().optional().or(z.literal('')),
  description: safeOptionalString,
  sellerId: idSchema,
  sellerName: makeSafeString(z.string()),
});

// 5. Create Transaction Schema
export const createTransactionSchema = z.object({
  listingId: z.string(),
  buyerId: idSchema,
  buyerName: makeSafeString(z.string()),
  mode: z.enum(["CONNECT", "SAFE"]),
});

// 6. Raise Dispute Schema
export const raiseDisputeSchema = z.object({
  id: z.string(),
  reason: makeSafeString(z.string().min(10, { message: "Dispute reason must explain ticket problem in at least 10 letters" })),
  userId: idSchema,
  userName: makeSafeString(z.string()),
});
