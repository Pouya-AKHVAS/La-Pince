import type { Request, Response } from "express";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import { registerSchema } from "../validators/auth.validator.js";

// Contrôleur appelé par POST /auth/register
// Il reçoit les données du formulaire d'inscription et crée un nouvel utilisateur en base
export async function register(req: Request, res: Response) {

  // On valide le body avec le schéma Zod
  // safeParse ne lève pas d'erreur, il retourne { success, data } ou { success, error }
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    // On récupère le premier problème de validation (ex: mot de passe trop court)
    // et on renvoie un message lisible au front avec le nom du champ concerné
    const firstIssue = result.error.issues[0];
    res.status(400).json({
      message: firstIssue?.message ?? "Données invalides",
      field: firstIssue?.path[0] as string | undefined,
    });
    return;
  }

  // Si la validation passe, on extrait les champs depuis result.data (typé et sûr)
  const { first_name, last_name, email, password, photo } = result.data;

  // On vérifie que l'email n'est pas déjà utilisé dans la base
  // findUnique retourne null si aucun utilisateur n'a cet email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Cet email est déjà utilisé", field: "email" });
    return;
  }

  // On ne stocke jamais un mot de passe en clair
  // argon2 est un algorithme de hachage sécurisé, conçu pour être lent et résistant aux attaques
  const hashedPassword = await argon2.hash(password);

  // On crée l'utilisateur en base via Prisma
  // Le champ select permet de choisir exactement ce qu'on retourne — le hash du mot de passe est volontairement exclu
  const user = await prisma.user.create({
    data: { first_name, last_name, email, password: hashedPassword, photo: photo ?? null },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      photo: true,
      createdAt: true,
    },
  });

  // Tout s'est bien passé : on retourne un 201 (ressource créée) avec les infos du nouvel utilisateur
  res.status(201).json({ message: "Inscription réussie", user });
}