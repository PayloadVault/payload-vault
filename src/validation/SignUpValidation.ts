import { z } from "zod";

const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS;

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine((email) => allowedEmails!.includes(email.toLowerCase()), {
        message:
          "Diese E-Mail-Adresse ist nicht für die Testphase freigegeben.",
      }),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    repeatedPassword: z.string().min(1, "Please repeat your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatedPassword) {
      ctx.addIssue({
        path: ["repeatedPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
