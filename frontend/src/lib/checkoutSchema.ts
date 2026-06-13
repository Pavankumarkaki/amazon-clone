import { z } from "zod";
import { INDIAN_STATES } from "@/lib/indian-states";

const indianMobileRegex = /^[6-9]\d{9}$/;
const pinCodeRegex = /^\d{6}$/;

export const checkoutAddressSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(indianMobileRegex, "Enter a valid 10-digit mobile number"),
  postal_code: z.string().trim().regex(pinCodeRegex, "PIN code must be 6 digits"),
  address_line1: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z
    .string()
    .min(1, "Select a state")
    .refine((value) => INDIAN_STATES.includes(value as (typeof INDIAN_STATES)[number]), {
      message: "Select a valid state",
    }),
  country: z.literal("India"),
});

export type CheckoutAddressForm = z.infer<typeof checkoutAddressSchema>;
