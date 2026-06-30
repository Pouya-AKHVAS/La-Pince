import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";

export const userService = {
  /**
   * Opération métier pour récupérer le profil d'un utilisateur par son ID
   * Le champ password est volontairement exclu via le select pour des raisons de sécurité
   */
  getUserProfile: async (id: number) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        photo: true,
        createdAt: true,
      },
    });
  },

  /**
   * Opération métier pour mettre à jour les informations du profil utilisateur
   * Configuration stricte pour s'adapter à la règle exactOptionalPropertyTypes: true
   */
  updateUserProfile: async (
    id: number, 
    data: { 
      first_name?: string | undefined; // Ajout explicite de la valeur indéfinie pour correspondre à Zod
      last_name?: string | undefined;
      email?: string | undefined; 
      password?: string | undefined; 
      photo?: string | null | undefined; 
    }
  ) => {
    // Si l'utilisateur veut changer l'email, on vérifie qu'il n'est pas déjà pris par un autre compte
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        const error = new Error("Cet email est déjà utilisé");
        (error as any).statusCode = 409;
        (error as any).field = "email";
        throw error;
      }
    }

    // Si l'utilisateur veut changer de mot de passe, on le hache avant de le stocker
    const hashedPassword = data.password ? await argon2.hash(data.password) : undefined;

    // Construction propre de l'objet data pour Prisma en respectant exactOptionalPropertyTypes
    // Si une propriété vaut undefined, on ne l'inclut pas du tout dans l'objet passé à Prisma
    const updateData: any = {};
    
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.photo !== undefined) updateData.photo = data.photo === undefined ? null : data.photo;
    if (hashedPassword !== undefined) updateData.password = hashedPassword;

    // Mise à jour sécurisée des données de l'utilisateur avec Prisma
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

 /**
   * Opération métier pour supprimer définitivement le compte d'un utilisateur
   * Utilise une transaction Prisma ($transaction) pour garantir l'intégrité des données
   * et supprimer proprement les entités liées (ex: RefreshTokens) avant l'utilisateur
   */
  deleteUserProfile: async (id: number) => {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error("Utilisateur introuvable");
      (error as any).statusCode = 404;
      throw error;
    }

    // Exécution des suppressions dans une transaction isolée
    return await prisma.$transaction(async (tx) => {
      // 1. Supprimer d'abord tous les tokens de rafraîchissement liés à cet utilisateur
      await tx.refreshToken.deleteMany({
        where: { userId: id }
      });

      // 2. Supprimer ensuite l'utilisateur lui-même
      return await tx.user.delete({
        where: { id }
      });
    });
  }
};