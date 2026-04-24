import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name:  z.string().min(1, "Le nom est requis"),
  email:      z.string().email("Adresse email invalide"),
  password:   z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

