import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "E-Mail-Adresse ist erforderlich")
      .email("Bitte geben Sie eine gültige E-Mail-Adresse ein")
      .refine((email) => email.toLowerCase().endsWith("@pro-fina.de"), {
        message:
          "Bitte verwenden Sie Ihre geschäftliche E-Mail-Adresse (@pro-fina.de)",
      }),

    password: z
      .string()
      .min(1, "Passwort ist erforderlich")
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
      .regex(
        /[^A-Za-z0-9]/,
        "Passwort muss mindestens ein Sonderzeichen enthalten",
      ),

    repeatedPassword: z.string().min(1, "Bitte wiederholen Sie Ihr Passwort"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatedPassword) {
      ctx.addIssue({
        path: ["repeatedPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwörter stimmen nicht überein",
      });
    }
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
