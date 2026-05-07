import { z } from "zod";

// Schéma pour POST /budgets
export const createBudgetSchema = z.object({
  limit_amount: z
    .number()
    .positive("Le montant doit être positif"),

  period: z.string().min(1, "La période est requise"),

  id_category: z
    .number()
    .int("L'identifiant doit être un entier")
    .positive("Catégorie invalide"),
});

// Schéma pour PATCH /budgets/:id
export const updateBudgetSchema = z.object({
  limit_amount: z
    .number()
    .positive("Le montant doit être positif")
    .optional(),
  period: z.string().min(1).optional(),

  id_category: z
    .number()
    .int("L'identifiant doit être un entier")
    .positive("Catégorie invalide")
    .optional(),
});
