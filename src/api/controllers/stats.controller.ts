import type { Request, Response } from "express";
import * as statsService from "../services/stats.service.ts";
import * as budgetService from "../services/budget.service.ts"; // Import du service de budget pour calculer les stats de budget dans le dashboard. Cela permet de séparer la logique métier (dans le service) de la gestion des requêtes/réponses (dans le contrôleur), rendant le code plus propre et plus facile à maintenir.

/**
 * Contrôleur pour GET /stats/overview
 * Alimente les 3 cartes en haut du tableau de bord :
 * - TOTAL REVENUS
 * - TOTAL DÉPENSES
 * - BALANCE NETTE
 */
export const getOverview = async (req: Request, res: Response) => {
  try {
    // On vérifie que l'utilisateur est authentifié (req.user injecté par le middleware d'auth)
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // On délègue la logique métier au service
    const data = await statsService.getOverview(req.user.id);

    // data = { income, expenses, balance }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur (overview)" });
  }
};

/**
 * Contrôleur pour GET /stats/monthly
 * Alimente le graphique "ANALYSE MENSUELLE" :
 * - Pour chaque mois : total revenus, total dépenses
 */
export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const data = await statsService.getMonthlyStats(req.user.id);

    // data = [ { month: "2026-01", income: 1200, expenses: 800 }, ... ]
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur (monthly)" });
  }
};

/**
 * Contrôleur pour GET /stats/categories
 * Alimente un graphique de répartition des dépenses par catégorie :
 * - Exemple : Carburant, Courses, Logement, etc.
 */
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const data = await statsService.getCategoryStats(req.user.id);

    // data = [ { category: "Carburant", total: 150 }, ... ]
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur (categories)" });
  }
};

/**
 * Contrôleur pour GET /stats/budgets
 * Alimente la partie "budgets" du dashboard :
 * - Pour chaque budget : limite, dépensé, restant, pourcentage utilisé
 */
export const getBudgetStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Extraction des paramètres optionnels pour l'historique
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    // MUTUALISATION : Appel au service budget pour la précision et l'historique
    const data = await budgetService.getBudgetMonthlyStats(req.user.id, month, year);

    // data = [ { id, categoryName, limitAmount, spentAmount, remainingAmount, percent, ... }, ... ]
    return res.status(200).json(data);
  } catch (err) {
    console.error("Erreur stats budgets:", err);
    return res.status(500).json({ message: "Erreur serveur (budgets stats)" });
  }
};
