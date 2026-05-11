// controllers/alert.controller.ts

import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Import des classes d'erreurs personnalisées
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../lib/error.ts";

/**
 * ---------------------------------------------------------
 * GET /alerts
 * Récupère toutes les alertes de l'utilisateur connecté.
 *
 * Explication :
 *  - On récupère l'utilisateur depuis req.user (injecté par le middleware JWT)
 *  - On cherche toutes les alertes appartenant à cet utilisateur
 *  - On les trie par date décroissante (les plus récentes en premier)
 *  - On renvoie la liste complète
 * ---------------------------------------------------------
 */
export async function getAlerts(req: Request, res: Response) {
  // Récupération sécurisée de l'identité utilisateur depuis le JWT
  const user = req.user as { id: number; userId?: number };
  const userId = user.userId ?? user.id;

  // Recherche des alertes appartenant à cet utilisateur
  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Trier par date décroissante
  });

  // Renvoi de la liste complète des alertes
  res.json(alerts);
}

/**
 * ---------------------------------------------------------
 * GET /alerts/:id
 * Récupère une alerte spécifique appartenant à l'utilisateur.
 *
 * Explication :
 *  - On vérifie que l'ID est valide
 *  - On récupère l'alerte dans la base
 *  - On vérifie que l'alerte appartient bien à l'utilisateur connecté
 *  - On renvoie l'alerte si tout est correct
 * ---------------------------------------------------------
 */
export async function getAlertById(req: Request, res: Response) {
  const id = Number(req.params.id);

  // Extraction de l'utilisateur connecté
  const user = req.user as { id: number; userId?: number };
  const userId = user.userId ?? user.id;

  // Vérification de l'identifiant
  if (isNaN(id)) throw new BadRequestError("Identifiant invalide");

  // Recherche de l'alerte
  const alert = await prisma.alert.findUnique({
    where: { id },
  });

  // Gestion des erreurs
  if (!alert) throw new NotFoundError("Alerte introuvable");
  if (alert.userId !== userId) throw new UnauthorizedError("Accès refusé");

  // Renvoi de l'alerte trouvée
  res.json(alert);
}

/**
 * ---------------------------------------------------------
 * PATCH /alerts/:id/read
 * Marque une alerte comme lue.
 *
 * Explication :
 *  - On vérifie que l'ID est valide
 *  - On vérifie que l'alerte existe
 *  - On vérifie que l'utilisateur en est bien le propriétaire
 *  - On met à jour le champ isRead = true
 * ---------------------------------------------------------
 */
export async function markAlertAsRead(req: Request, res: Response) {
  const id = Number(req.params.id);

  const user = req.user as { id: number; userId?: number };
  const userId = user.userId ?? user.id;

  if (isNaN(id)) throw new BadRequestError("Identifiant invalide");

  // Vérifier que l'alerte existe
  const alert = await prisma.alert.findUnique({ where: { id } });

  if (!alert) throw new NotFoundError("Alerte introuvable");
  if (alert.userId !== userId) throw new UnauthorizedError("Accès refusé");

  // Mise à jour de l'état de lecture
  const updated = await prisma.alert.update({
    where: { id },
    data: { isRead: true },
  });

  res.json(updated);
}

/**
 * ---------------------------------------------------------
 * PATCH /alerts/read-all
 * Marque toutes les alertes de l'utilisateur comme lues.
 *
 * Explication :
 *  - On récupère l'utilisateur connecté
 *  - On met à jour toutes ses alertes en une seule requête (updateMany)
 *  - On renvoie un message de confirmation
 * ---------------------------------------------------------
 */
export async function markAllAlertsAsRead(req: Request, res: Response) {
  const user = req.user as { id: number; userId?: number };
  const userId = user.userId ?? user.id;

  // Mise à jour en masse
  await prisma.alert.updateMany({
    where: { userId },
    data: { isRead: true },
  });

  res.json({ message: "Toutes les alertes ont été marquées comme lues" });
}

/**
 * ---------------------------------------------------------
 * DELETE /alerts/:id
 * Supprime une alerte appartenant à l'utilisateur.
 *
 * Explication :
 *  - On vérifie que l'ID est valide
 *  - On vérifie que l'alerte existe
 *  - On vérifie que l'utilisateur est bien le propriétaire
 *  - On supprime l'alerte
 *  - On renvoie un statut 204 (aucun contenu)
 * ---------------------------------------------------------
 */
export async function deleteAlert(req: Request, res: Response) {
  const id = Number(req.params.id);

  const user = req.user as { id: number; userId?: number };
  const userId = user.userId ?? user.id;

  if (isNaN(id)) throw new BadRequestError("Identifiant invalide");

  // Vérifier que l'alerte existe
  const alert = await prisma.alert.findUnique({ where: { id } });

  if (!alert) throw new NotFoundError("Alerte introuvable");
  if (alert.userId !== userId) throw new UnauthorizedError("Accès refusé");

  // Suppression de l'alerte
  await prisma.alert.delete({ where: { id } });

  res.status(204).send();
}
