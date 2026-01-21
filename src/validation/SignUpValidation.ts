import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine((email) => email.toLowerCase().endsWith("@pro-fina.de"), {
        message: "You must use your business email (@pro-fina.de)",
      }),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long"),

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
