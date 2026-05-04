export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  date: string;
  description: string;
  idcategory: number;
  category: Category;
}
