import { useEffect, useRef, useState, useMemo } from "react";
import { fetchTransactions, type Transaction } from "../../services/transactionApi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

import Footer from "../../components/Footer/footer";
import AlertPopup from "../../components/Alert/AlertPopup";
import type { Alert } from "../../types/alert";
import { fetchAlerts, markAlertAsRead } from "../../services/alertApi";

/**
 * DONNÉES DE SECOURS (MOCK)
 * Utilisées uniquement si l'utilisateur n'a aucune transaction en base.
 * Permet de garder une interface "vivante" lors de la première utilisation.
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
  // --- RÉFÉRENCES ET ÉTATS ---
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number | null>(null);

  /**
   * Chargement initial des données depuis l'API
   */
  const loadData = async () => {
    try {
      // 1. Récupération des transactions réelles
      const transData = await fetchTransactions();
      setTransactions(transData);

      // 2. Récupération des alertes non lues
      const alertData = await fetchAlerts();
      const unread = alertData.filter((a) => !a.isRead);
      if (unread.length > 0) {
        setAlerts(unread);
        setCurrentAlertIndex(0);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Calcul dynamique de la hauteur du footer pour ajuster le padding du contenu
   */
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (footerRef.current) setFooterHeight(footerRef.current.offsetHeight);
    });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- LOGIQUE MÉTIER (MÉMORISÉE) ---

  /**
   * Transformation des transactions pour le graphique Recharts.
   * On groupe les montants par mois : { income: total, expense: -total }
   */
  const chartData = useMemo(() => {
    // Si vide, on renvoie le mock pour la démo
    if (transactions.length === 0) return MOCK_DATA;
    
    const monthlyMap: Record<string, { name: string, income: number, expense: number }> = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
      const month = new Date(t.date).toLocaleString('fr-FR', { month: 'short' });
      if (!monthlyMap[month]) monthlyMap[month] = { name: month, income: 0, expense: 0 };
      
      const amount = Number(t.amount);
      if (t.category.type === 'INCOME') {
        monthlyMap[month].income += amount;
      } else {
        // L'axe négatif de Recharts nécessite une valeur négative
        monthlyMap[month].expense -= amount;
      }
    });
    return Object.values(monthlyMap);
  }, [transactions]);

  /**
   * Calcul des indicateurs clés (KPIs)
   */
  const stats = useMemo(() => {
    // Si vide, on renvoie des valeurs de démo
    if (transactions.length === 0) {
      return { income: 4500.50, expense: 2300.20, balance: 2200.30 };
    }
    const income = transactions.reduce((acc, t) => t.category.type === 'INCOME' ? acc + Number(t.amount) : acc, 0);
    const expense = transactions.reduce((acc, t) => t.category.type === 'EXPENSE' ? acc + Number(t.amount) : acc, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  /**
   * Gestion de la fermeture des alertes (marquage comme lu en base)
   */
  function handleCloseAlert() {
    if (currentAlertIndex === null) return;
    markAlertAsRead(alerts[currentAlertIndex].id).catch(console.error);
    const next = currentAlertIndex + 1;
    setCurrentAlertIndex(next < alerts.length ? next : null);
  }

  const currentAlert = currentAlertIndex !== null ? alerts[currentAlertIndex] : null;

  return (
    <main className="fixed inset-0 w-full h-full bg-[#cbd5e1] overflow-hidden font-sans text-[#002b49]">
      {/* 1. ÉLÉMENTS VISUELS DE FOND (Branding La Pince) */}
      <img
        src="/WEBP/Desktop/Lapince-Hero-Background-Desktop.webp"
        className="absolute bottom-0 left-0 w-[60vw] opacity-20 object-contain origin-bottom-left z-0 pointer-events-none select-none"
        aria-hidden="true"
        alt=""
      />
      <div className="absolute inset-0 bg-white/30 z-10 pointer-events-none" aria-hidden="true" />

      {/* 2. LOGOS (Mobile et Desktop) */}
      <img src="/WEBP/Mobile/Lapince-Logo-Mobile.webp" className="absolute top-6 left-6 w-28 z-50 md:hidden" alt="Logo" />
      <img src="/WEBP/Desktop/Lapince-Logo-Desktop.webp" className="absolute top-10 left-15 w-24 lg:w-60 z-50 transition-all hidden md:block" alt="Logo" />

      {/* 3. ZONE DE CONTENU PRINCIPAL (Scrollable) */}
      <div 
        className="relative z-20 flex flex-col h-full overflow-y-auto scrollbar-hide"
        style={{ paddingBottom: footerHeight + 40 }}
      >
        {/* En-tête de page */}
        <header className="flex flex-col items-center pt-10 pb-8 shrink-0">
          <h1 className="text-[35px] md:text-[50px] lg:text-[60px] font-black uppercase leading-none tracking-tighter italic">
            Tableau de bord
          </h1>
          <p className="text-base font-bold mt-1 opacity-80">Analyse de vos flux financiers</p>
        </header>

        <div className="max-w-6xl mx-auto w-full px-6 space-y-8">
          
          {/* GRILLE DES CARTES DE STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/40">
              <p className="text-xs font-black uppercase italic opacity-70 mb-1">Total Revenus</p>
              <p className="text-2xl font-black text-green-600">+{stats.income.toLocaleString()} €</p>
            </div>
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/40">
              <p className="text-xs font-black uppercase italic opacity-70 mb-1">Total Dépenses</p>
              <p className="text-2xl font-black text-red-600">-{stats.expense.toLocaleString()} €</p>
            </div>
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/40">
              <p className="text-xs font-black uppercase italic opacity-70 mb-1">Balance Nette</p>
              <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-[#002b49]' : 'text-red-600'}`}>
                {stats.balance.toLocaleString()} €
              </p>
            </div>
          </div>

          {/* SECTION GRAPHIQUE (Recharts) */}
          <section className="bg-white/50 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/50">
            <header className="mb-8 text-center md:text-left">
              <h3 className="text-xl font-black italic uppercase">Analyse Mensuelle</h3>
              <p className="text-xs font-bold opacity-60">Visualisation des Revenus vs Dépenses par mois</p>
            </header>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,43,73,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#002b49', fontWeight: 'bold', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#002b49', fontWeight: 'bold', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.2)'}}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}
                  />
                  <ReferenceLine y={0} stroke="#002b49" strokeOpacity={0.2} />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[0, 0, 6, 6]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* TABLEAU RÉCAPITULATIF DES OPÉRATIONS */}
          <section className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 mb-10">
            <div className="p-6 border-b border-white/20 bg-white/10">
              <h3 className="text-xl font-black italic uppercase text-center md:text-left">Détails des opérations</h3>
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
                  {transactions.length > 0 ? (
                    transactions.slice(0, 10).map(t => (
                      <tr key={t.id} className="hover:bg-white/10 transition-colors">
                        <td className="px-8 py-4 text-sm font-bold">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-8 py-4 text-sm font-black italic uppercase">{t.description || 'Transaction'}</td>
                        <td className={`px-8 py-4 text-sm text-right font-black ${t.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.category.type === 'INCOME' ? '+' : '-'} {Number(t.amount).toFixed(2)} €
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-8 py-10 text-center opacity-40 italic font-bold">Aucune transaction à afficher</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* 4. POPUPS D'ALERTE (S'affiche par dessus tout si nécessaire) */}
      {currentAlert && <AlertPopup key={currentAlert.id} alert={currentAlert} onClose={handleCloseAlert} />}

      {/* 5. PIED DE PAGE (Fixe) */}
      <footer ref={footerRef} className="absolute bottom-0 left-0 w-full z-[60]">
        <Footer showIcons activeIds={["landingpage", "params",  "transactions"]} />
      </footer>
    </main>
  );
}
