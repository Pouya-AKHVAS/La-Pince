import { useState, useEffect, useMemo } from 'react';
import { fetchTransactions } from '../../services/transactionApi';
import type { Transaction } from '../../types/transaction';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Footer from '../../components/Footer/footer';

/**
 * DONNÉES FICTIVES (MOCK)
 * Recharts a besoin d'un tableau d'objets où chaque objet représente un "point" sur l'axe X.
 * Pour un graphique Positif/Négatif, on sépare 'income' (positif) et 'expense' (négatif).
 */
const MOCK_DATA = [
  { name: 'Jan', income: 4000, expense: -2400 },
  { name: 'Fév', income: 3000, expense: -1398 },
  { name: 'Mar', income: 2000, expense: -9800 },
  { name: 'Avr', income: 2780, expense: -3908 },
  { name: 'Mai', income: 1890, expense: -4800 },
  { name: 'Juin', income: 2390, expense: -3800 },
  { name: 'Juil', income: 3490, expense: -4300 },
];

export default function DashboardPage() {
    // État pour stocker les transactions réelles venant de la base de données (Prisma)
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * ÉTAPE 1 : RÉCUPÉRATION DES DONNÉES (FETCH)
     * Au chargement du composant, on appelle notre service API.
     */
    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoading(true);
                const data = await fetchTransactions();
                setTransactions(data);
            } catch (err) {
                // Si l'API échoue (ex: serveur éteint), on log l'erreur
                console.error('Erreur API, affichage des données fictives pour la démo', err);
                setError('Erreur lors de la récupération des transactions');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    /**
     * ÉTAPE 2 : TRANSFORMATION POUR LE GRAPHIQUE (LOGIQUE MÉTIER)
     * Recharts ne comprend pas une liste brute de transactions. 
     * Il lui faut un format : [{ month: 'Jan', income: 100, expense: -50 }, ...]
     */
    const chartData = useMemo(() => {
        // --- LOGIQUE DE BASCULE MOCK / RÉEL ---
        // Si le tableau transactions est vide (ex: premier lancement), on retourne le MOCK.
        // Pour supprimer le mock : enlevez cette ligne ou remplacez par `return [];`
        if (!transactions || transactions.length === 0) return MOCK_DATA;

        // Objet temporaire pour grouper par mois : { 'Jan': {income: 0, expense: 0}, ... }
        const monthlyMap: Record<string, { name: string, income: number, expense: number }> = {};
        
        // On trie les transactions par date pour que le graphique soit chronologique
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedTransactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.toLocaleString('fr-FR', { month: 'short' }); // Convertit en 'janv.', 'févr.', etc.
            
            if (!monthlyMap[month]) {
                monthlyMap[month] = { name: month, income: 0, expense: 0 };
            }
            
            const amount = Number(t.amount);
            // On sépare selon le type défini dans ta base de données (INCOME ou EXPENSE)
            if (t.category.type === 'INCOME') {
                monthlyMap[month].income += amount;
            } else {
                // TRÈS IMPORTANT : Pour que la barre descende, la valeur doit être NÉGATIVE
                monthlyMap[month].expense -= amount; 
            }
        });

        // On transforme l'objet en tableau pour Recharts : Object.values()
        return Object.values(monthlyMap);
    }, [transactions]);

    /**
     * ÉTAPE 3 : CALCUL DES TOTAUX (KPIs)
     * Somme simple de tous les revenus et toutes les dépenses.
     */
    const stats = useMemo(() => {
        const income = transactions.reduce((acc, t) => t.category.type === 'INCOME' ? acc + Number(t.amount) : acc, 0);
        const expense = transactions.reduce((acc, t) => t.category.type === 'EXPENSE' ? acc + Number(t.amount) : acc, 0);
        
        return { 
            // Fallback (repli) sur des valeurs fixes si pas de transactions, pour le look "La Pince"
            income: income || 4500.50, 
            expense: expense || 2300.20, 
            balance: (income - expense) || 2200.30 
        };
    }, [transactions]);

    return (
        <main className="fixed inset-0 w-full h-full bg-[#b9c6d1] overflow-hidden font-sans text-[#002b49]">
            
            {/* ASSETS VISUELS : On réutilise les images du projet pour le branding */}
            <div className="hidden md:block">
                <img 
                    src="/WEBP/Desktop/Lapince-Hero-Background-Desktop.webp" 
                    className="absolute bottom-0 left-0 w-[50vw] opacity-40 z-0 pointer-events-none select-none" 
                    alt="" 
                />
                <div className="absolute bottom-0 right-0 z-10 pointer-events-none hidden lg:block opacity-20">
                    <img src="/WEBP/Desktop/Lapince-Hand-Desktop.webp" className="w-[20vw] h-auto" alt="" />
                </div>
                <img src="/WEBP/Desktop/Lapince-Logo-Desktop.webp" className="absolute top-8 left-10 w-32 z-50 transition-all" alt="Logo" />
            </div>

            {/* OVERLAY : Donne cet aspect "verre fumé" au fond */}
            <div className="absolute inset-0 bg-white/40 z-20 pointer-events-none" aria-hidden="true"></div>

            {/* CONTENU : Zone scrollable avec le style Glassmorphism (bg-white/20 + backdrop-blur) */}
            <div className="absolute inset-0 z-40 overflow-y-auto pt-24 pb-24 px-4 md:px-10 scrollbar-hide">
                
                <header className="max-w-6xl mx-auto mb-10 text-center md:text-left">
                    <h1 className="text-[40px] md:text-[60px] font-black italic uppercase leading-none tracking-tighter">
                        Tableau de bord
                    </h1>
                    <p className="text-[16px] font-bold opacity-90 mt-2">
                        Visualisez vos flux et gardez la main sur votre oseille.
                    </p>
                </header>

                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* CARTES KPIs : Structure flexible Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/20 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl border border-white/40 hover:scale-102 transition-transform">
                            <p className="text-xs font-black uppercase italic opacity-70 mb-1">Total Revenus</p>
                            <p className="text-2xl font-black text-green-600">
                                + {stats.income.toLocaleString()} €
                            </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl border border-white/40 hover:scale-102 transition-transform">
                            <p className="text-xs font-black uppercase italic opacity-70 mb-1">Total Dépenses</p>
                            <p className="text-2xl font-black text-red-600">
                                - {stats.expense.toLocaleString()} €
                            </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl border border-white/40 hover:scale-102 transition-transform">
                            <p className="text-xs font-black uppercase italic opacity-70 mb-1">Balance Nette</p>
                            <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-[#002b49]' : 'text-red-600'}`}>
                                {stats.balance.toLocaleString()} €
                            </p>
                        </div>
                    </div>

                    {/* SECTION GRAPHIQUE : Le coeur du dashboard */}
                    <section className="bg-white/25 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/40">
                        <header className="mb-8">
                            <h3 className="text-xl font-black italic uppercase">Analyse Mensuelle</h3>
                            <p className="text-xs font-bold opacity-60">Revenus vs Dépenses par mois</p>
                        </header>
                        
                        <div className="h-[350px] w-full">
                            {/* ResponsiveContainer permet au graphique de s'ajuster à la taille de l'écran */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    {/* Grille horizontale discrète */}
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,43,73,0.1)" />
                                    
                                    {/* Axes X (Mois) et Y (Montants) */}
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#002b49', fontWeight: 'bold', fontSize: 12}} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#002b49', fontWeight: 'bold', fontSize: 12}} 
                                    />
                                    
                                    {/* Tooltip (Bulle d'info au survol) stylisé en mode verre */}
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.2)'}}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255,255,255,0.8)', 
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '20px', 
                                            border: '1px solid white',
                                            fontWeight: 'bold',
                                            color: '#002b49'
                                        }}
                                    />

                                    {/* ReferenceLine : La ligne horizontale à 0 qui sépare positif et négatif */}
                                    <ReferenceLine y={0} stroke="#002b49" strokeOpacity={0.2} />

                                    {/* BARRE REVENUS : radius [10, 10, 0, 0] arrondit seulement le haut */}
                                    <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} barSize={25} />
                                    
                                    {/* BARRE DÉPENSES : radius [0, 0, 10, 10] arrondit seulement le bas */}
                                    <Bar dataKey="expense" fill="#ef4444" radius={[0, 0, 10, 10]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* TABLEAU DES OPÉRATIONS */}
                    <section className="bg-white/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 mb-10">
                        <div className="p-6 border-b border-white/20 bg-white/10">
                            <h3 className="text-xl font-black italic uppercase">Détails des opérations</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#002b49]/10 text-[#002b49] text-[10px] font-black uppercase italic tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Libellé</th>
                                        <th className="px-8 py-4 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {/* Condition : Si on a des transactions réelles, on les affiche, sinon placeholders */}
                                    {transactions.length > 0 ? transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-white/10 transition-colors">
                                            <td className="px-8 py-4 text-sm font-bold">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-4 text-sm font-black italic uppercase">{t.description || 'Transaction'}</td>
                                            <td className={`px-8 py-4 text-sm text-right font-black ${
                                                t.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {t.category.type === 'INCOME' ? '+' : '-'} {Number(t.amount).toFixed(2)} €
                                            </td>
                                        </tr>
                                    )) : (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="opacity-40">
                                                <td className="px-8 py-4 text-sm font-bold">01/05/2026</td>
                                                <td className="px-8 py-4 text-sm font-black italic uppercase">Exemple de dépense {i}</td>
                                                <td className="px-8 py-4 text-sm text-right font-black">- 00.00 €</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>

            <footer className="absolute bottom-0 left-0 w-full z-50">
                <Footer showIcons={true} />
            </footer>
        </main>
    );
}
