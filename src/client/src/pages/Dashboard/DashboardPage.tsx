import { useState, useEffect, useMemo } from 'react';
import { transactionApi } from '../../services/transactionApi';
import type { Transaction } from '../../types/transaction';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine,Legend, Rectangle
} from 'recharts';

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

    // 1. Récupération des données
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
    }, []);

    // 2. Extraction des catégories pour le filtre
    const categories = useMemo(() => { 
        const map = new Map();
        transactions.forEach(t => {
            if (!map.has(t.category.id)) {
                map.set(t.category.id, t.category);
            }
        });
        return Array.from(map.values());
    }, [transactions]);

    // 3. Filtrage des transactions
    const filteredTransactions = useMemo(() => {
        if (selectedCategory === 'all') return transactions;
        return transactions.filter(t => t.idcategory === selectedCategory);
    }, [transactions, selectedCategory]);

    // 4. Calcul des KPIs (Totaux)
    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            const amount = Number(t.amount);
            if (t.category.type === 'INCOME') acc.income += amount;
            else acc.expense += amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredTransactions]);

    // 5. Transformation des données pour Recharts (Groupement par mois)
    const chartData = useMemo(() => {
        const totals: { [key: string]: number } = {};
        
        filteredTransactions.forEach((t) => {
            const date = new Date(t.date);
            const month = date.toLocaleString('fr-FR', { month: 'short' });
            const value = t.category.type === 'EXPENSE' ? -Number(t.amount) : Number(t.amount);
            totals[month] = (totals[month] || 0) + value;
        });

        // On trie les mois (simplifié par ordre d'apparition ici, 
        // idéalement trié par date réelle)
        return Object.entries(totals).map(([name, amount]) => ({ name, amount }));
    }, [filteredTransactions]);

    if (loading) return <div className="p-8">Chargement du dashboard...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Analyse de vos flux financiers</p>
                </div>

                {/* Barre de Filtres */}
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === 'all' 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Vue Globale
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                selectedCategory === cat.id 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Revenus</p>
                    <p className="text-2xl font-bold text-green-600">+{stats.income.toFixed(2)} €</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Total Dépenses</p>
                    <p className="text-2xl font-bold text-red-600">-{stats.expense.toFixed(2)} €</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Balance Nette</p>
                    <p className={`text-2xl font-bold ${stats.income - stats.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(stats.income - stats.expense).toFixed(2)} €
                    </p>
                </div>
            </div>

            {/* Graphique */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-6">Performance Mensuelle</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: '#f9fafb'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine y={0} stroke="#e5e7eb" />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Rectangle key={`rectangle-${index}`} fill={entry.amount > 0 ? '#10b981' : '#ef4444'} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Journal des Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold">Détails des opérations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium">Catégorie</th>
                                <th className="px-6 py-4 font-medium text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        {t.description || 'Sans description'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                                            {t.category.name}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm text-right font-bold ${
                                        t.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {t.category.type === 'INCOME' ? '+' : '-'} {Number(t.amount).toFixed(2)} €
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
