import { prisma } from "../lib/prisma.js";

export const categoryService = {
  /**
   * Opération métier pour récupérer toutes les catégories
   * Retourne la liste complète sans filtre particulier
   */
  getAllCategories: async () => {
    return await prisma.category.findMany();
  },

  /**
   * Opération métier pour récupérer une catégorie unique par son identifiant
   * Retourne la catégorie ou null si elle n'existe pas
   */
  getCategoryById: async (categoryId: number) => {
    return await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
  },

  /**
   * Opération métier pour créer une nouvelle catégorie
   */
  createCategory: async (data: any) => {
    return await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        type: data.type,
      },
    });
  },

  /**
   * Opération métier pour modifier une catégorie existante
   */
  updateCategory: async (categoryId: number, data: any) => {
    return await prisma.category.update({
      where: { id: categoryId },
      data,
    });
  },

  /**
   * Opération métier pour supprimer définitivement une catégorie
   */
  deleteCategory: async (categoryId: number) => {
    return await prisma.category.delete({
      where: { id: categoryId },
    });
  }
};