import type { Transaction } from "../types/transaction.ts";

const API_BASE_URL = 'http://localhost:3007';

export const transactionApi = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }, 
      credentials: 'include', // Permet d'envoyer les cookies avec la requête
    });
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return response.json();
  }
}; 

