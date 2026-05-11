interface ProgressBarProps {
  percent: number;      // Pour la largeur de la barre (max 100)
  realPercent: number;  // Pour la logique de couleur (peut être > 100)
}

export function BudgetProgressBar({ percent, realPercent }: ProgressBarProps) {
  // Logique de couleur dynamique demandée par le ticket
  let barColor = "bg-cyan-400"; // Couleur "Safe" < 70%
  
  if (realPercent >= 70 && realPercent <= 90) {
    barColor = "bg-orange-400"; // Couleur "Warning"
  } else if (realPercent > 90) {
    barColor = "bg-red-500";    // Couleur "Danger"
  }

  return (
    // Conteneur : On utilise bg-white/30 pour garder l'aspect translucide du projet
    <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}