import type { Request, Response } from "express";
import * as budgetService from "../services/budget.service.ts";
import {
  createBudgetSchema,
  updateBudgetSchema,
} from "../validators/budget.validator.js";

/**
 * ---------------------------------------------------------
 * 1. GET /budgets
 * Récupère tous les budgets de l'utilisateur connecté.
 *
 * Logique :
 *  - Vérifier que l'utilisateur est authentifié (req.user)
 *  - Appeler le service pour récupérer les budgets
 *  - Retourner la liste au format JSON
 * ---------------------------------------------------------
 */
export const getBudgets = async (req: Request, res: Response) => {
  try {
    // Vérifie que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Récupère tous les budgets de l'utilisateur
    const budgets = await budgetService.getAllBudgets(req.user.id);

    return res.status(200).json(budgets);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des budgets" });
  }
};

/**
 * ---------------------------------------------------------
 * 2. POST /budgets
 * Crée un nouveau budget pour l'utilisateur.
 *
 * Logique :
 *  - Vérifier l'authentification
 *  - Valider les données avec Zod (createBudgetSchema)
 *  - Appeler le service pour créer le budget
 *  - Retourner le budget créé
 * ---------------------------------------------------------
 */
export const createBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Validation du body avec Zod
    const body = createBudgetSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ erreurs: body.error.format() });
    }

    // Création du budget
    const budget = await budgetService.createBudget(req.user.id, body.data);

    return res.status(201).json(budget);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du budget" });
  }
};

/**
 * ---------------------------------------------------------
 * 3. GET /budgets/:id
 * Récupère un budget spécifique par son ID.
 *
 * Logique :
 *  - Vérifier l'authentification
 *  - Vérifier que l'ID est valide
 *  - Appeler le service pour récupérer le budget
 *  - Retourner 404 si le budget n'existe pas
 * ---------------------------------------------------------
 */
export const getBudgetById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    const budget = await budgetService.getBudgetById(id, req.user.id);
    if (!budget) return res.status(404).json({ message: "Budget introuvable" });

    return res.status(200).json(budget);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ---------------------------------------------------------
 * 4. PATCH /budgets/:id
 * Met à jour un budget existant.
 *
 * Logique :
 *  - Vérifier l'authentification
 *  - Vérifier que l'ID est valide
 *  - Valider les données avec Zod (updateBudgetSchema)
 *  - Appeler le service pour mettre à jour
 * ---------------------------------------------------------
 */
export const updateBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    const body = updateBudgetSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ erreurs: body.error.format() });
    }

    const updated = await budgetService.updateBudget(
      id,
      req.user.id,
      body.data,
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour" });
  }
};

/**
 * ---------------------------------------------------------
 * 5. DELETE /budgets/:id
 * Supprime un budget.
 *
 * Logique :
 *  - Vérifier l'authentification
 *  - Vérifier que l'ID est valide
 *  - Appeler le service pour supprimer
 *  - Retourner 204 (aucun contenu)
 * ---------------------------------------------------------
 */
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    await budgetService.deleteBudget(id, req.user.id);

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression" });
  }
};

/**
 * ---------------------------------------------------------
 * 6. GET /budgets/:id/status
 * Retourne le statut d’un budget :
 *  - montant dépensé
 *  - montant restant
 *  - pourcentage utilisé
 *
 * Logique :
 *  - Vérifier l'authentification
 *  - Vérifier l'ID
 *  - Appeler le service pour calculer le statut
 * ---------------------------------------------------------
 */
export const getBudgetStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

    const status = await budgetService.getBudgetStatus(id, req.user.id);
    if (!status) return res.status(404).json({ message: "Budget introuvable" });

    return res.status(200).json(status);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur lors du calcul du statut" });
  }
};
