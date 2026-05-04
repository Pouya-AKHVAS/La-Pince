// Budget


export type Budget = {
    id: number;
    limit_amount : number; // plafond en euros (Prisma: limit_amount Float)
    period: string; // "2024-04" (Prisma: period String)
    id_category: number; //FK Category (Prisma: id_category Int)
    userId: number

    // Champ de commodité pour le mock uniquement.
    // Dans la vraie base, il faudrait faire un Join avec la table Category pour obtenir ce nom
    // Pooya le gerera coté back dans l'alert generator

    categoryName: string;
}