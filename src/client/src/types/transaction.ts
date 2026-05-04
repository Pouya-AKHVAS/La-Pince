// C'est la forme des catégories de transactions car une transaction appartient à une catégorie.
export interface Category {
  id: number;
  name : string;
  type : 'income' | 'expense';
  color?: string;
  icon?: string;
}

// C'est la forme des transactions.
export interface Transaction {
  id: number;
  amount: number;
  date : string ; 
  description: string;
  idcategory: number;
  category: Category; // C'est l'élement clé pour lier la transaction à une catégorie. 
}