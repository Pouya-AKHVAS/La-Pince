import { useEffect, useRef, useState, useMemo } from "react";
import { fetchTransactions, type Transaction } from "../../services/transactionApi";
import { fetchCategories } from "../../services/categoryApi"; // Ajout de l'API catégorie
import type { Category } from "../../types/category"; // Ajout du type catégorie
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

import Footer from "../../components/Footer/footer";
import AlertPopup from "../../components/Alert/AlertPopup";
import type { Alert } from "../../types/alert";
import { fetchAlerts, markAlertAsRead } from "../../services/alertApi";

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
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // État pour stocker les catégories
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number | null>(null);

  // --- ÉTATS DES FILTRES ---
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); // Multi-sélection de catégories

  const loadData = async () => {
    try {
      // Chargement en parallèle pour l'efficacité
      const [transData, alertData, catData] = await Promise.all([
        fetchTransactions(),
        fetchAlerts(),
        fetchCategories()
      ]);

      setTransactions(transData);
      setCategories(catData);

      const unread = alertData.filter((a) => !a.isRead);
      if (unread.length > 0) {
        setAlerts(unread);
        setCurrentAlertIndex(0);
      }
    } catch (error) {
      console.error("Erreur chargement des données :", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (footerRef.current) setFooterHeight(footerRef.current.offsetHeight);
    });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Filtre par type
      const matchesType = filterType === "ALL" || t.category.type === filterType;

      // 2. Filtre par recherche textuelle
      const matchesSearch = t.description?.toLowerCase().includes(search.toLowerCase());

      // 3. Filtre par date
      const tDate = new Date(t.date).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      const matchesDate = tDate >= start && tDate <= end;

      // 4. Filtre par catégories (Multi-sélection)
      // Si aucune catégorie n'est sélectionnée, on affiche tout.
      const matchesCategory = selectedCategoryIds.length === 0 || selectedCategoryIds.includes(t.category.id);

      return matchesType && matchesSearch && matchesDate && matchesCategory;
    });
  }, [transactions, filterType, search, startDate, endDate, selectedCategoryIds]);

  /**
   * Ajoute ou retire une catégorie de la sélection
   */
  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  // --- LOGIQUE GRAPHIQUE ET STATS ---
  const chartData = useMemo(() => {
    if (transactions.length === 0) return MOCK_DATA;
    const monthlyMap: Record<string, { name: string, income: number, expense: number }> = {};
    [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
      const month = new Date(t.date).toLocaleString('fr-FR', { month: 'short' });
      if (!monthlyMap[month]) monthlyMap[month] = { name: month, income: 0, expense: 0 };
      const amount = Number(t.amount);
      if (t.category.type === 'INCOME') monthlyMap[month].income += amount;
      else monthlyMap[month].expense -= amount;
    });
    return Object.values(monthlyMap);
  }, [transactions]);

  const stats = useMemo(() => {
    if (transactions.length === 0) return { income: 4500.50, expense: 2300.20, balance: 2200.30 };
    const income = transactions.reduce((acc, t) => t.category.type === 'INCOME' ? acc + Number(t.amount) : acc, 0);
    const expense = transactions.reduce((acc, t) => t.category.type === 'EXPENSE' ? acc + Number(t.amount) : acc, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  function handleCloseAlert() {
    if (currentAlertIndex === null) return;
    markAlertAsRead(alerts[currentAlertIndex].id).catch(console.error);
    const next = currentAlertIndex + 1;
    setCurrentAlertIndex(next < alerts.length ? next : null);
  }

  const currentAlert = currentAlertIndex !== null ? alerts[currentAlertIndex] : null;

  return (
    <main className="fixed inset-0 w-full h-full bg-[#cbd5e1] overflow-hidden font-sans text-[#002b49]">
      <img
        src="/WEBP/Desktop/Lapince-Hero-Background-Desktop.webp"
        className="absolute bottom-0 left-0 w-[60vw] opacity-20 object-contain origin-bottom-left z-0 pointer-events-none select-none"
        aria-hidden="true"
        alt=""
      />
      <div className="absolute inset-0 bg-white/30 z-10 pointer-events-none" aria-hidden="true" />

      <img src="/WEBP/Mobile/Lapince-Logo-Mobile.webp" className="absolute top-6 left-6 w-28 z-50 md:hidden" alt="Logo" />
      <img src="/WEBP/Desktop/Lapince-Logo-Desktop.webp" className="absolute top-10 left-15 w-24 lg:w-60 z-50 transition-all hidden md:block" alt="Logo" />

      <div className="relative z-20 flex flex-col h-full overflow-y-auto scrollbar-hide" style={{ paddingBottom: footerHeight + 40 }}>
        <header className="flex flex-col items-center pt-10 pb-8 shrink-0">
          <h1 className="text-[35px] md:text-[50px] lg:text-[60px] font-black uppercase leading-none tracking-tighter italic">Tableau de bord</h1>
          <p className="text-base font-bold mt-1 opacity-80">Analyse de vos flux financiers</p>
        </header>

        <div className="max-w-6xl mx-auto w-full px-6 space-y-8">
          
          {/* STATS CARDS */}
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
              <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-[#002b49]' : 'text-red-600'}`}>{stats.balance.toLocaleString()} €</p>
            </div>
          </div>

          {/* GRAPH SECTION */}
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
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.2)'}} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '15px', border: 'none', fontWeight: 'bold' }} />
                  <ReferenceLine y={0} stroke="#002b49" strokeOpacity={0.2} />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[0, 0, 6, 6]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* SECTION : DÉTAILS DES OPÉRATIONS (AVEC FILTRES) */}
          <section className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/40 mb-10">
            <div className="p-6 border-b border-white/20 bg-white/10 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-black italic uppercase">Détails des opérations</h3>
                
                {/* --- BARRE DE FILTRES PRINCIPAUX --- */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="px-5 py-2.5 rounded-full bg-white/50 border border-white/20 text-sm font-bold focus:outline-none focus:bg-white/80 transition-all w-48 shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  
                  <select 
                    className="px-5 py-2.5 rounded-full bg-white/50 border border-white/20 text-sm font-bold focus:outline-none focus:bg-white/80 transition-all shadow-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="ALL">Tous les types</option>
                    <option value="INCOME">Revenus</option>
                    <option value="EXPENSE">Dépenses</option>
                  </select>

                  <div className="flex items-center gap-2 bg-white/30 px-5 py-2.5 rounded-full border border-white/20 shadow-sm">
                    <span className="text-xs font-black uppercase opacity-60">Du</span>
                    <input type="date" className="bg-transparent text-xs font-bold outline-none cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <span className="text-xs font-black uppercase opacity-60">Au</span>
                    <input type="date" className="bg-transparent text-xs font-bold outline-none cursor-pointer" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* --- FILTRE PAR CATÉGORIES (MULTI-SÉLECTION) --- */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black uppercase tracking-widest opacity-50 text-center md:text-left">Filtrer par catégories :</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {/* Bouton "Toutes" */}
                  <button
                    onClick={() => setSelectedCategoryIds([])}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all border ${
                      selectedCategoryIds.length === 0 
                      ? "bg-[#002b49] text-white border-[#002b49] shadow-md scale-105" 
                      : "bg-white/20 text-[#002b49] border-white/30 hover:bg-white/40"
                    }`}
                  >
                    Toutes
                  </button>

                  {/* Liste des catégories */}
                  {categories
                    .filter(c => filterType === "ALL" || c.type === filterType)
                    .map(cat => ( // Filtrer les catégories selon le type sélectionné
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all border flex items-center gap-2 ${
                          selectedCategoryIds.includes(cat.id)
                          ? "bg-white text-[#002b49] border-white shadow-lg scale-105" 
                          : "bg-white/20 text-[#002b49] border-white/30 hover:bg-white/40"
                        }`}
                      >
                        {cat.color && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        )}
                        {cat.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#002b49]/10 text-[#002b49] text-[10px] font-black uppercase italic tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Libellé</th>
                    <th className="px-8 py-4">Catégorie</th>
                    <th className="px-8 py-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <td className="px-8 py-4 text-sm font-bold">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-8 py-4 text-sm font-black italic uppercase">{t.description || 'Transaction'}</td>
                        <td className="px-8 py-4">
                           <span className="px-2 py-1 rounded-full bg-white/30 text-[10px] font-black uppercase border border-white/20">
                            {t.category.name}
                           </span>
                        </td>
                        <td className={`px-8 py-4 text-sm text-right font-black ${t.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.category.type === 'INCOME' ? '+' : '-'} {Number(t.amount).toFixed(2)} €
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-8 py-10 text-center opacity-40 italic font-bold">Aucun résultat pour ces filtres</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {currentAlert && <AlertPopup key={currentAlert.id} alert={currentAlert} onClose={handleCloseAlert} />}
      <footer ref={footerRef} className="absolute bottom-0 left-0 w-full z-[60]">
        <Footer showIcons activeIds={["landingpage", "params",  "transactions"]} />
      </footer>
    </main>
  );
}
