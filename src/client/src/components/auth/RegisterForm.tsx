import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { RegisterFormData, ApiError } from "../../types/auth";

/**
 * Interface décrivant les props attendues par le composant.
 */
interface RegisterFormProps {
  /** Fonction appelée lors de la validation du formulaire avec les données saisies */
  onSubmit: (data: RegisterFormData) => void;
  /** État indiquant si une requête API est en cours */
  isLoading: boolean;
  /** Objet contenant l'erreur retournée par l'API (message et champ concerné) */
  error: ApiError | null;
}

export default function RegisterForm({
  onSubmit,
  isLoading,
  error,
}: RegisterFormProps) {
  /**
   * Gère la soumission du formulaire et extrait les données des inputs.
   */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Empêche le rechargement de la page
    const formElement = event.currentTarget; // Accès au DOM du formulaire

    const data: RegisterFormData = {
      first_name: (
        formElement.elements.namedItem("first_name") as HTMLInputElement
      ).value,
      last_name: (
        formElement.elements.namedItem("last_name") as HTMLInputElement
      ).value,
      email: (formElement.elements.namedItem("email") as HTMLInputElement)
        .value,
      password: (formElement.elements.namedItem("password") as HTMLInputElement)
        .value,
    };

    onSubmit(data); // Appelle la fonction parent avec les données collectées
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-slate-50 p-4">
      {/* Carte principale stylisée selon le wireframe */}
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100">
        {/* En-tête avec la photo et les titres */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full mb-3 flex items-center justify-center border-2 border-dashed border-gray-200">
            <span className="text-gray-400 text-xs italic">Photo</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            Inscription
          </h2>
          <p className="text-gray-400 font-medium text-sm italic">La Pince</p>
        </div>

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {/* Champs dynamiques du formulaire */}
          {[
            {
              id: "first_name",
              label: "Prénom",
              type: "text",
              placeholder: "Votre prénom",
            },
            {
              id: "last_name",
              label: "Nom",
              type: "text",
              placeholder: "Votre nom",
            },
            {
              id: "email",
              label: "Email",
              type: "email",
              placeholder: "votre@email.com",
            },
            {
              id: "password",
              label: "Mot de passe",
              type: "password",
              placeholder: "••••••••",
            },
          ].map((field) => (
            <div key={field.id} className="space-y-1">
              <label
                htmlFor={field.id}
                className="block text-xs font-bold text-gray-700 ml-5 italic"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                disabled={isLoading}
                className={cn(
                  "w-full px-6 py-2.5 rounded-full bg-gray-50 border-2 border-transparent transition-all duration-300",
                  "focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100",
                  "placeholder:text-gray-300 placeholder:italic text-sm",
                  // Applique une bordure rouge si une erreur concerne ce champ spécifique
                  error?.field === field.id && "border-red-400 bg-red-50/30",
                )}
                required
              />
              {/* Affiche le message d'erreur spécifique au champ juste en-dessous */}
              {error?.field === field.id && (
                <p className="text-[10px] text-red-500 ml-5 font-bold italic animate-in slide-in-from-top-1">
                  {error.message}
                </p>
              )}
            </div>
          ))}

          {/* Bouton de soumission avec état de chargement */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 rounded-full font-black text-lg tracking-widest uppercase transition-all mt-4 shadow-sm",
              "active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="text-sm italic">Inscription...</span>
              </div>
            ) : (
              "Envoyer"
            )}
          </button>

          {/* Affiche une erreur générale si aucun champ spécifique n'est ciblé */}
          {error && !error.field && (
            <p className="text-center text-xs text-red-500 font-bold mt-2 animate-bounce">
              {error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
