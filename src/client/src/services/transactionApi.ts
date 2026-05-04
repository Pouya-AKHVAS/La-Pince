import type { Transaction } from '../types/transaction';

const BASE_URL = 'http://localhost:3007';

export const transactionApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des transactions');
    }

    const data = await response.json();
    return data;
  }
};
