import { useState, useEffect, useMemo } from "react";
import { fetchBudgetsStats } from "../../services/budgetApi";
import { BudgetProgressBar } from "./BudgetProgressBar";

export default function BudgetProgressList({ month, year }: { month?: number, year?: number }) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchBudgetsStats(month, year);
        // On s'assure que data est bien un tableau
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur stats:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [month, year]);

  // PROTECTION : useMemo avec valeurs de secours (0) pour éviter le crash .toFixed()
  const processedStats = useMemo(() => {
    return stats.map(s => {
      const spent = s.spentAmount || 0;
      const limit = s.limitAmount || 0;
      const isOver = spent > limit;

      return {
        ...s,
        spent,
        limit,
        isOver,
        // Sécurisation du toFixed ici
        remainingText: isOver 
          ? "Budget dépassé !" 
          : `Il vous reste ${(limit - spent).toFixed(2)}€`
      };
    });
  }, [stats]);

  if (loading) return <div className="p-4 text-center text-[#002b49] font-bold animate-pulse">Analyse de vos plafonds...</div>;

  if (stats.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 text-center flex flex-col items-center gap-3">
        <p className="text-[#002b49] font-bold italic text-sm opacity-80">
          "Vous n'avez pas encore défini d'objectifs pour cette période."
        </p>
        <button className="bg-[#E06B56] text-white px-8 py-2.5 rounded-full font-black uppercase text-[10px] shadow-lg">
          Fixer un Budget
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 w-full mt-4 pb-10">
      <h2 className="text-[#002b49] font-black text-2xl tracking-tighter px-2">
        📈 Mon Suivi Budgétaire
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {processedStats.map((item) => (
          <div key={item.id} className="bg-white/60 backdrop-blur-lg rounded-[30px] p-5 shadow-sm border border-white/20 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <img src="/WEBP/Icones/Lapince-budget.webp" className="w-4 h-4 object-contain" alt="" />
                </div>
                <div>
                  <h4 className="text-[#002b49] font-black uppercase text-[11px] leading-none">{item.categoryName}</h4>
                  <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase">Objectif : {item.limitAmount?.toFixed(2) || '0.00'}€</p>
                </div>
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full ${item.isOver ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {item.remainingText}
              </span>
            </div>

            {/* percent et realPercent ont déjà des fallback 0 côté Back-end, mais on peut être prudent */}
            <BudgetProgressBar percent={item.percent || 0} realPercent={item.realPercent || 0} />

            <div className="flex justify-between items-center px-1">
               {/* SÉCURISATION : (item.spent || 0).toFixed(2) */}
               <span className="text-[10px] font-bold text-[#002b49]">Consommé : {(item.spent || 0).toFixed(2)}€</span>
               <span className="text-[10px] font-black text-[#E06B56]">{Math.round(item.realPercent || 0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
