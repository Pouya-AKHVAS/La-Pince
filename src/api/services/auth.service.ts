import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import type { User } from "../models/index.ts";
import { UnauthorizedError } from "../lib/error.ts";

async function hashPassword(password: string) {
  return argon2.hash(password);
}

async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export const authService = {
  /**
   * Opération métier pour inscrire un utilisateur
   * Vérifie l'unicité de l'email, hache le mot de passe et crée l'enregistrement avec un jeton d'activation
   */
  registerUser: async (data: { 
    first_name: string; 
    last_name: string; 
    email: string; 
    passwordPlain: string; 
    photo?: string | null | undefined;
    verificationToken: string; // Reçu depuis le contrôleur pour l'activation par mail
  }) => {
    // On vérifie que l'email n'est pas déjà utilisé dans la base
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      const error = new Error("Cet email est déjà utilisé");
      (error as any).statusCode = 409;
      (error as any).field = "email";
      throw error;
    }

    // On ne stocke jamais un mot de passe en clair
    const hashedPassword = await hashPassword(data.passwordPlain);

    // On crée l'utilisateur en base via Prisma
    return await prisma.user.create({
      data: { 
        first_name: data.first_name, 
        last_name: data.last_name, 
        email: data.email, 
        password: hashedPassword, 
        photo: data.photo === undefined ? null : data.photo, 
        isVerified: false,              // 🔥 Bloqué par défaut jusqu'à validation
        verificationToken: data.verificationToken, // Stockage du token de sécurité
      }as any,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        photo: true,
        isVerified: true, // Ajouté pour le suivi au niveau du front si nécessaire
        createdAt: true,
      },
    });
  },

  /**
   * Opération métier pour vérifier les identifiants de connexion
   * Cherche l'utilisateur et valide la correspondance du hash du mot de passe
   */
  verifyLogin: async (email: string, passwordPlain: string): Promise<User> => {
    // Récupérer l'utilisateur dans la BDD
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Le login et le mot de passe ne correspondent pas");
    }

    // Vérifier que le mot de passe et le hash correspondent
    const isMatching = await verifyPassword(user.password, passwordPlain);
    if (!isMatching) {
      throw new UnauthorizedError("Le login et le mot de passe ne correspondent pas");
    }

    // Retourne l'utilisateur (incluant désormais le champ isVerified mis à jour par Prisma)
    return user as unknown as User;
  }
};