import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const passwordChangeSchema = z
  .object({
    password: z.string().min(1, "Password is required").pipe(strongPassword),

    repeatPassword: z.string().min(1, "Repeat password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        path: ["repeatPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }
  });

export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;
