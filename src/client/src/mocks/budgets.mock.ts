import type { Budget } from "../types/bugdet"


// MOCK_TRANSACTIONS contient :
//   Supermarché U     → -45,50€ (catégorie "Alimentation")
//   Abonnement Ciné   → -19,90€ (catégorie "Loisirs")
//
// Plafonds intentionnellement bas pour déclencher les alertes :
//   Alimentation : limit_amount 40€  → exceededAmount = 5,50€
//   Loisirs      : limit_amount 10€  → exceededAmount = 9,90€

export const MOCK_BUDGETS: Budget[] = [
  {
    id: 1,
    limit_amount: 40,       // ← nom du champ Prisma
    period: "2024-04",      // ← nom du champ Prisma
    id_category: 2,         // ← correspond à categoryId: 2 dans les transactions mock
    userId: 1,
    categoryName: "Alimentation", // commodité mock — pour matcher t.category.name
  },
  {
    id: 2,
    limit_amount: 10,
    period: "2024-04",
    id_category: 3,
    userId: 1,
    categoryName: "Loisirs",
  },
  {
    id: 3,
    limit_amount: 50, // Télépéage = 2,90€ → pas de dépassement, pas d'alerte
    period: "2024-04",
    id_category: 4,
    userId: 1,
    categoryName: "Transport",
  },
];