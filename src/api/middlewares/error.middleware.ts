import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { HttpClientError } from "../lib/error.ts";

/**
 * Middleware centralisé pour la gestion globale des erreurs
 * Capture les erreurs applicatives, gère les Custom Errors et renvoie un JSON standardisé au frontend
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. Détermination du code de statut HTTP (s'adapte à err.status de HttpClientError ou err.statusCode)
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Une erreur interne du serveur est survenue.";
  let field = err.field || undefined;

  // 2. Log détaillé de l'erreur dans la console du serveur pour le débogage
  console.error(`[Error] ${req.method} ${req.url} :`, err);

  // 3. Réponse standardisée envoyée au frontend
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    field: field, // Très important pour que le front-end sache quel champ est en erreur (ex: Zod, email dupliqué)
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};