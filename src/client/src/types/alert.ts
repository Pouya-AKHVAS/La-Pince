export type Alert = {
    id: number;
    categoryName: string;

    // Toujours positif : c'est le montant du dépassement, pas le total dépensé.
    // Prisma stocke float -> JSON.parse() le convertit en bumber 
    exceededAmount : number;

    isRead : boolean;

    // userId est renvoyé par le controleur - on ne l'utilise pas coté UI
    // mais on déclare pour que notre type corresponde exactement au JSON recu
    
    userId: number

    createdAt: string // ISO8601

};

