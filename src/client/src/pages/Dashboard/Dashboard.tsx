import { useState, useEffect } from 'react';
import { transactionApi } from '../../services/transactionApi';
import type { Transaction } from '../../types/transaction';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Text } from 'recharts';

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]); // On initialise le tableau des transactions
    const [loading, setLoading] = useState(true); // On initialise le statut de chargement
    const [error, setError] = useState<string | null>(null); // On initialise le message d'erreur


    // On utilise useEffect pour dire à React de récupérer les transactions au chargement de la page
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await transactionApi.getTransactions();
                setTransactions(data);
            } catch (err) {
                setError('Erreur lors de la récupération des transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []); // Le tableau vide signifie que le effet ne s'exécutera qu'une seule fois au chargement de la page

    return (
        <div>
            {loading && <p>Chargement des transactions...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && (
                <div>
                    <h2>Transactions</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transactions}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
