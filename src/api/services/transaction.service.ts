// Ce service contient la logique métier liée aux transactions, comme la création d'une transaction, la validation des données, etc. 
// Il interagit avec la base de données via Prisma pour effectuer les opérations nécessaires.
// Par exemple, la fonction createTransaction pourrait recevoir les données d'une nouvelle transaction, vérifier que l'utilisateur a suffisamment de fonds, créer la transaction en base, mettre à jour le solde de l'utilisateur, etc.
// En séparant la logique métier dans un service, on garde les contrôleurs propres et centrés sur la gestion des requêtes/réponses, ce qui facilite la maintenance et les tests.

import * as PrismaPkg from "@prisma/client"; // On importe PrismaClient depuis le package @prisma/client. En utilisant "as any", on contourne les problèmes de types liés à l'importation dans un projet TypeScript avec module NodeNext. Cela permet d'éviter les erreurs de type lors de l'instanciation de PrismaClient, tout en conservant la possibilité d'utiliser les fonctionnalités de Prisma pour interagir avec la base de données.
const { PrismaClient } = PrismaPkg as any;
export const prisma = new PrismaClient(); // On crée une instance de PrismaClient pour interagir avec la base de données. En l'exportant, on peut la réutiliser dans d'autres fichiers du projet sans avoir à recréer une nouvelle instance à chaque fois,
//  ce qui est plus performant et évite les problèmes de connexion.

// --- 1. Récupérer toutes les transactions avec les filtres ---
export const getAllTransactions = async (iduser: number, filters: any) => { // On reçoit l'id de l'utilisateur et les filtres (idcategory, startDate, endDate) depuis le contrôleur
  return prisma.transaction.findMany({
    where: {
      iduser,
      ...(filters.idcategory && { idcategory: filters.idcategory }),
      ...(filters.startDate && { date: { gte: new Date(filters.startDate) } }),
      ...(filters.endDate && { date: { lte: new Date(filters.endDate) } }),
    },
    orderBy: { date: "desc" }, // On trie les transactions par date décroissante pour afficher les plus récentes en premier
    include: { category: true }, // On inclut la catégorie pour avoir le type (income/expense) côté front
  });
};

// --- 2. Créer une transaction ---
export const createTransaction = async (iduser: number, data: any) => {
  // A. Vérification de la catégorie 
  const category = await prisma.category.findUnique({
    where: { id: data.idcategory }
  });

  if (!category) {
    throw new Error("Catégorie introuvable");
  }

  // La catégorie doit être "par défaut" OU appartenir à l'utilisateur
  if (!category.is_default && category.id_user !== iduser) {
    throw new Error("Action non autorisée sur cette catégorie");
  }

    // B. Création de la transaction
    const transaction = await prisma.transaction.create({
        data: {
            iduser,
            amount: data.amount,
            date: new Date(data.date), // // On convertit le string ISO en objet Date pour Prisma
            idcategory: data.idcategory,
            description: data.description,
        },
        include: { category: true }, // On inclut la catégorie pour avoir le type (income/expense) côté front
    });

   // C. TODO pour plus tard : Vérifier le budget et générer une alerte
  // await checkBudgetAndCreateAlert(iduser, data.idcategory);

  return transaction;
};

// --- 3. Récupérer une transaction par son ID ---  
export const getTransactionById = async (id: number, iduser: number) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, iduser }, // On s'assure que la transaction appartient bien à l'utilisateur connecté pour éviter les accès non autorisés
    include: { category: true },
  });
  if (!transaction) {
    throw new Error("Transaction introuvable");
  }
  return transaction;
};

// --- 4. Mettre à jour une transaction ---
export const updateTransaction = async (idtransaction: number, iduser: number, data: any) => {
  // On passe la date en objet Date si elle a été modifiée
  const updateData = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  return prisma.transaction.update({
    where: { id: idtransaction }, // On identifie la transaction à mettre à jour par son ID
    data: updateData,
  });
};

// --- 5. Supprimer une transaction 
export const deleteTransaction = async (id: number, iduser: number) => {
  await prisma.transaction.deleteMany({ where: { id, iduser } });
};

