// Service Budget
// -------------------------------------------------------------
// Ce fichier contient toute la logique métier liée aux budgets.
// Le contrôleur appelle ces fonctions pour interagir avec la base
// de données via Prisma. Cela permet de séparer la logique métier
// de la gestion des requêtes HTTP, rendant le code plus propre
// et plus facile à maintenir.

import { id } from "zod/locales";
import { prisma } from "../lib/prisma.js";

// -------------------------------------------------------------
// 1. Récupérer tous les budgets d'un utilisateur
// -------------------------------------------------------------
export const getAllBudgets = async (userId: number) => {
  return prisma.budget.findMany({
    where: { userId },
    include: {
      category: true,       // Inclure la catégorie associée
      transactions: true,   // Inclure les transactions liées
    },
  });
};

// -------------------------------------------------------------
// 2. Créer un nouveau budget
// -------------------------------------------------------------
export const createBudget = async (userId: number, data: any) => {
  return prisma.budget.create({
    data: {
      userId,
      id_category: data.id_category,
      limit_amount: data.limit_amount,
      period: data.period,
    },
  });
};

// -------------------------------------------------------------
// 3. Récupérer un budget spécifique par ID
// -------------------------------------------------------------
export const getBudgetById = async (id: number, userId: number) => {
  return prisma.budget.findFirst({
    where: { id, userId },
    include: {
      category: true,
      transactions: true,
    },
  });
};

// -------------------------------------------------------------
// 4. Mettre à jour un budget existant
// -------------------------------------------------------------
export const updateBudget = async (id: number, userId: number, data: any) => {
  return prisma.budget.update({
    where: { id },
    data,
  });
};

// -------------------------------------------------------------
// 5. Supprimer un budget
// -------------------------------------------------------------
export const deleteBudget = async (id: number, userId: number) => {
  return prisma.budget.delete({
    where: { id },
  });
};

// -------------------------------------------------------------
// 6. Calculer le statut d'un budget
//    (dépensé, restant, pourcentage consommé)
// -------------------------------------------------------------

// Cette fonction calcule le statut complet d’un budget donné pour un utilisateur.
// Elle récupère d’abord le budget correspondant dans la base de données, ainsi que
// toutes les transactions associées et la catégorie liée. Si aucun budget n’est trouvé
// (soit parce qu’il n’existe pas, soit parce qu’il n’appartient pas à l’utilisateur),
// la fonction renvoie null.
//
// Une fois le budget récupéré, la fonction calcule :
//
// 1. Le montant total dépensé (“spent”) :
//    - en additionnant toutes les transactions liées au budget.
//    - chaque transaction possède un montant (“amount”), converti en nombre.
//
// 2. Le montant restant (“remaining”) :
//    - en soustrayant le total dépensé du montant limite du budget.
//
// 3. Le pourcentage consommé (“percent”) :
//    - en divisant le total dépensé par la limite du budget, puis en multipliant par 100.
//
// Enfin, la fonction renvoie un objet contenant toutes les informations utiles pour
// l’interface utilisateur :
//    - l’identifiant du budget,
//    - le nom de la catégorie,
//    - la limite définie,
//    - le total dépensé,
//    - le montant restant,
//    - et le pourcentage consommé.
//
// Ces données permettent d’afficher un suivi clair et visuel de l’état du budget,
// par exemple sous forme de barre de progression ou de graphique.


export const getBudgetStatus = async (budgetId: number, userId: number) => {
  // Récupérer le budget avec ses transactions
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
    include: {
      transactions: true,
      category: true,
    },
  });

  if (!budget) return null;

  // Calcul du total dépensé
  const spent = budget.transactions.reduce(
    (sum: number, t: { amount: any }) => sum + Number(t.amount),
    0
  );

  // Montant restant
  const remaining = budget.limit_amount - spent;

  // Pourcentage consommé
  const percent = (spent / budget.limit_amount) * 100;

  return {
    budgetId: budget.id,
    category: budget.category.name,
    limit: budget.limit_amount,
    spent,
    remaining,
    percent,
  };
};

// -------------------------------------------------------------
// 7. Statistiques Budgétaires (Hybride : Mensuel ou Global)
// -------------------------------------------------------------
export const getBudgetMonthlyStats = async (userId: number, month?: number, year?: number) => {
  // 1. Préparation du filtre de date (optionnel)
  // Si month et year sont fournis, on crée une fenêtre temporelle.
  // Sinon, on laisse le filtre vide pour avoir une vue "Globale" (All-time).
  let dateFilter = {};
  const isHistoricalRequest = month !== undefined && year !== undefined;

  if (isHistoricalRequest) {
    const targetMonth = month! - 1;
    const startDate = new Date(year!, targetMonth, 1);
    const endDate = new Date(year!, targetMonth + 1, 0, 23, 59, 59);
    dateFilter = { gte: startDate, lte: endDate };
  }

  // 2. Récupération des budgets de l'utilisateur
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: {
      category: true,
    },
  });

  // 3. Calcul du réel pour chaque budget via Promise.all (parallélisation)
  return await Promise.all(
    budgets.map(async (budget: any) => {
      // Choix technique : On filtre par budgetId pour respecter le "Lien Manuel".
      // Les transactions "extras" (sans budgetId) sont automatiquement ignorées.
      const aggregateResult = await prisma.transaction.aggregate({
        where: {
          userId,
          budgetId: budget.id,
          ...(isHistoricalRequest ? { date: dateFilter } : {}), // Filtre date conditionnel
        },
        _sum: {
          amount: true,
        },
      });

      const spent = Number(aggregateResult._sum.amount) || 0;
      const limit = Number(budget.limit_amount);
      
      // Calcul du pourcentage réel (peut dépasser 100% pour la logique de couleur)
      const realPercent = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        id: budget.id,
        categoryName: budget.category.name,
        icon: budget.category.icon,
        color: budget.category.color,
        limitAmount: limit,
        spentAmount: spent,
        remainingAmount: Math.max(limit - spent, 0),
        percent: Math.min(realPercent, 100), // Plafonné pour l'affichage de la barre
        realPercent: realPercent,            // Vrai chiffre (ex: 125%) pour l'analyse
        period: isHistoricalRequest ? { month, year } : "global",
      };
    })
  );
};

