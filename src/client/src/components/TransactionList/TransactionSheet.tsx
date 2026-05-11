import { useRef, useState, useMemo } from "react";
import { ChevronUp, Search } from "lucide-react";
import type { Transaction } from "../../types/transaction.js";
import TransactionLine from "./TransactionLine.js";

// La hauteur visible quand le panneau esy "fermé"
// Si modification ajuster cette constante

const HANDLE_HEIGHT = 56;

type Props = {
  transactions: Transaction[];
  footerHeight: number;
  // --- AJOUT : callbacks fournis par le parent ---
  onDelete: (id: number) => void;
  onUpdate: (t: Transaction) => void;
};

export default function TransactionSheet({
  transactions,
  footerHeight,
  onDelete,
  onUpdate,
}: Props) {
  const COLLAPSED_HEIGHT = footerHeight + HANDLE_HEIGHT;

  // --- ÉTATS (States) ---
  // Gère l'ouverture du panneau (vrai = ouvert, faux = réduit)
  const [isOpen, setIsOpen] = useState(false);

  // Valeur tapée dans la barre de recherche
  const [searchTerm, setSearchTerm] = useState("");

  // Type sélectionné : ALL (Tout), INCOME (Revenus), EXPENSE (Dépenses)
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );

  // Tableau des IDs des catégories sélectionnées pour le filtre multi-sélection
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Gère l'affichage du petit menu déroulant des catégories
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // --- AJOUT : transaction en cours d’édition ---
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // useRef : On utilise des refs pour le drag-and-drop car changer un state
  // à chaque pixel déplacé ferait ramer l'application (trop de re-renders).
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false); // Distingue un simple clic d'un glissement réel

  // --- LOGIQUE DE FILTRAGE ---

  /**
   * 1. On calcule la liste des catégories DISPONIBLES.
   * On ne veut afficher que les catégories qui existent dans les transactions actuelles.
   * Si l'utilisateur filtre par "Dépenses", on ne montre que les catégories de dépenses.
   */
  const availableCategories = useMemo(() => {
    const cats = new Map<number, { id: number; name: string; type: string }>();
    transactions.forEach((t) => {
      if (filterType === "ALL" || t.category.type === filterType) {
        cats.set(t.category.id, t.category);
      }
    });
    return Array.from(cats.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [transactions, filterType]);

  // --- AJOUT : catégories valides selon le type ---
  const validSelectedCategories =
    filterType === "ALL"
      ? selectedCategories
      : selectedCategories.filter((id) => {
          const cat = transactions.find((t) => t.category.id === id)?.category;
          return cat ? cat.type === filterType : false;
        });

  /**
   * 2. On calcule les transactions FILTRÉES.
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "ALL" || t.category.type === filterType;

      const matchesCategory =
        validSelectedCategories.length === 0 ||
        validSelectedCategories.includes(t.category.id);

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, validSelectedCategories]);

  /**
   * 3. Gestion de la sélection d'une catégorie.
   */
  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // --- GESTION DU GLISSEMENT (DRAG) ---
  function onDragStart(clientY: number) {
    dragStartY.current = clientY;
    isDragging.current = false;
  }

  function onDragMove(clientY: number) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - clientY;
    if (Math.abs(delta) > 5) isDragging.current = true;
  }

  function onDragEnd(clientY: number) {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - clientY;

    if (!isDragging.current) {
      setIsOpen((prev) => !prev);
    } else if (delta > 40) {
      setIsOpen(true);
    } else if (delta < -40) {
      setIsOpen(false);
    }
    dragStartY.current = null;
    isDragging.current = false;
  }

  // --- AJOUT : ouverture du modal d’édition ---
  function handleEdit(t: Transaction) {
    setEditingTransaction(t);
  }

  // --- AJOUT : suppression (appel parent) ---
  async function handleDelete(id: number) {
    onDelete(id);
  }

  // --- AJOUT : sauvegarde (appel parent) ---
  async function handleUpdateTransaction() {
    if (!editingTransaction) return;
    onUpdate(editingTransaction);
    setEditingTransaction(null);
  }

  return (
    <div
      style={{
        height: "85vh",
        transform: isOpen
          ? "translateY(0)"
          : `translateY(calc(85vh - ${COLLAPSED_HEIGHT}px))`,
      }}
      className="fixed bottom-0 left-0 w-full bg-[#1e3a5f] text-white rounded-t-2xl shadow-2xl flex flex-col z-[55] transition-transform duration-300 ease-in-out"
    >
      {/* --- ENTÊTE / POIGNÉE DE DRAG --- */}
      {/* (toutes les lignes originales sont conservées) */}

      <div
        className="flex flex-col items-center pt-3 pb-2 shrink-0 cursor-pointer select-none group hover:bg-white/5 transition-colors rounded-t-2xl"
        onMouseDown={(e) => onDragStart(e.clientY)}
        onMouseMove={(e) => {
          if (e.buttons === 1) onDragMove(e.clientY);
        }}
        onMouseUp={(e) => onDragEnd(e.clientY)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
        onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientY)}
      >
        <div className="w-10 h-1 bg-white/40 rounded-full mb-2" />

        <div className="flex items-center gap-1.5">
          <ChevronUp
            size={14}
            className={`text-white/70 transition-transform duration-300 group-hover:text-white ${isOpen ? "rotate-180" : ""}`}
          />
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors whitespace-nowrap">
            Toutes mes transactions
          </p>

          {/* BARRE DE RECHERCHE */}
          <div
            className="relative flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/20 focus-within:bg-white/20 transition-all max-w-[120px] ml-2"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Search size={12} className="text-white/50 mr-2" />
            <input
              type="text"
              placeholder="Filtrer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-wider placeholder:text-white/30 w-full"
            />
          </div>

          {/* SÉLECTEUR DE TYPE */}
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "ALL" | "INCOME" | "EXPENSE")
            }
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/10 border border-white/20 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:bg-white/20 transition-all cursor-pointer ml-1"
          >
            <option value="ALL" className="bg-[#1e3a5f]">
              Tout
            </option>
            <option value="INCOME" className="bg-[#1e3a5f]">
              Revenus
            </option>
            <option value="EXPENSE" className="bg-[#1e3a5f]">
              Dépenses
            </option>
          </select>

          {/* MULTI-SÉLECT DE CATÉGORIES */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCategoryMenuOpen(!isCategoryMenuOpen);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider outline-none hover:bg-white/20 transition-all cursor-pointer ml-1 whitespace-nowrap ${validSelectedCategories.length > 0 ? "border-[#74BAC2] text-[#74BAC2]" : ""}`}
            >
              Catégories{" "}
              {validSelectedCategories.length > 0
                ? `(${validSelectedCategories.length})`
                : ""}
            </button>

            {isCategoryMenuOpen && (
              <div
                className="absolute bottom-full mb-2 right-0 w-48 bg-[#1e3a5f] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[60]"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <span className="text-[10px] font-black uppercase opacity-60">
                    Filtrer
                  </span>
                  {validSelectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-[9px] font-black uppercase text-[#BC8787] hover:brightness-125"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto p-1 scrollbar-hide">
                  {availableCategories.length === 0 ? (
                    <p className="text-[10px] text-center py-4 opacity-40 italic">
                      Aucune catégorie
                    </p>
                  ) : (
                    availableCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={validSelectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-3 h-3 rounded border-white/20 bg-transparent accent-[#74BAC2]"
                        />
                        <span className="text-[10px] font-bold uppercase truncate">
                          {cat.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ChevronUp
            size={14}
            className={`text-white/70 transition-transform duration-300 group-hover:text-white ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* --- LISTE DES TRANSACTIONS --- */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-white/50 mt-8 text-sm italic">
            {searchTerm ||
            validSelectedCategories.length > 0 ||
            filterType !== "ALL"
              ? "Aucune transaction ne correspond à vos filtres."
              : "Aucune transaction pour le moment."}
          </p>
        ) : (
          filteredTransactions.map((t) => (
            <TransactionLine
              key={t.id}
              transaction={t}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* --- AJOUT : MODAL D’ÉDITION DE TRANSACTION --- */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white text-[#002b49] p-6 rounded-2xl w-[90%] max-w-[350px] shadow-xl">
            <h2 className="text-lg font-bold mb-4">Modifier la transaction</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTransaction();
              }}
              className="space-y-3"
            >
              {/* Champ Description */}
              <input
                type="text"
                defaultValue={editingTransaction.description ?? ""}
                onChange={(e) =>
                  setEditingTransaction((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev,
                  )
                }
                className="w-full px-3 py-2 rounded bg-gray-100"
                placeholder="Description"
              />

              {/* Champ Montant */}
              <input
                type="number"
                defaultValue={editingTransaction.amount}
                onChange={(e) =>
                  setEditingTransaction((prev) =>
                    prev ? { ...prev, amount: Number(e.target.value) } : prev,
                  )
                }
                className="w-full px-3 py-2 rounded bg-gray-100"
                placeholder="Montant"
              />

              {/* Bouton Enregistrer */}
              <button
                type="submit"
                className="w-full bg-[#002b49] text-white py-2 rounded font-bold"
              >
                Enregistrer
              </button>

              {/* Bouton Annuler */}
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="w-full bg-gray-300 text-[#002b49] py-2 rounded font-bold mt-2"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
