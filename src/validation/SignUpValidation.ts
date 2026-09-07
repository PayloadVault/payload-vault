import { z } from "zod";

// NOTE: the registration allowlist is enforced in the database
// (public.signup_allowlist + the enforce_signup_allowlist trigger on
// auth.users). It deliberately no longer lives here: a list shipped in the
// browser bundle both leaked every approved address and could be skipped by
// calling GoTrue directly with the public anon key.
export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "E-Mail-Adresse ist erforderlich")
      .max(254, "E-Mail-Adresse ist zu lang")
      .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),

    password: z
      .string()
      .min(1, "Passwort ist erforderlich")
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .max(72, "Passwort darf höchstens 72 Zeichen lang sein")
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
