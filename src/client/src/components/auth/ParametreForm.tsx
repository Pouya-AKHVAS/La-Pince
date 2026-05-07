import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../../services/user";

/**
 * ------------------------------------------------------------
 * Composant ParametreForm
 *
 * Objectif :
 *  - Afficher les informations du profil utilisateur
 *  - Permettre la modification du nom, email et mot de passe
 *  - Afficher des messages de confirmation, succès et erreur
 *  - Gérer la suppression du compte
 *
 * Ce composant est indépendant de ParametrePage.
 * ParametrePage ne fait qu'afficher ce formulaire.
 * ------------------------------------------------------------
 */
export default function ParametreForm() {
  /**
   * ------------------------------------------------------------
   * State du formulaire
   * name      → combinaison de first_name + last_name
   * email     → email actuel
   * password  → nouveau mot de passe (optionnel)
   * confirm   → confirmation du mot de passe
   * ------------------------------------------------------------
   */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  /**
   * ------------------------------------------------------------
   * State pour gérer les erreurs renvoyées par le backend
   * field → champ concerné (email, password…)
   * message → message d’erreur lisible
   * ------------------------------------------------------------
   */
  const [apiError, setApiError] = useState<{
    field?: string;
    message: string;
  } | null>(null);

  /**
   * ------------------------------------------------------------
   * Indique si une requête API est en cours
   * ------------------------------------------------------------
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ------------------------------------------------------------
   * handleChange
   * Met à jour le state du formulaire à chaque saisie
   * ------------------------------------------------------------
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setApiError(null); // Efface l’erreur quand l’utilisateur modifie un champ
  };

  /**
   * ------------------------------------------------------------
   * Chargement automatique du profil utilisateur
   * via GET /users/me
   *
   * On combine first_name + last_name dans un seul champ "name"
   * ------------------------------------------------------------
   */
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await fetchUserProfile();

        setForm({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          password: "",
          confirm: "",
        });
      } catch (err) {
        console.error("Erreur lors du chargement du profil :", err);
      }
    }

    loadProfile();
  }, []);

  /**
   * ------------------------------------------------------------
   * handleSubmit
   * Étapes :
   *  1. Demander confirmation à l'utilisateur
   *  2. Séparer "Nom Prénom" en first_name + last_name
   *  3. Envoyer les données au backend
   *  4. Afficher un message de succès ou d’erreur
   * ------------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Empêche le rechargement automatique de la page lors de la soumission du formulaire
    e.preventDefault();

    // ------------------------------------------------------------
    // 1) Demander une confirmation à l'utilisateur
    // ------------------------------------------------------------
    // Une boîte de dialogue apparaît pour vérifier que l'utilisateur
    // souhaite réellement modifier ses informations.
    const confirmed = confirm(
      "Êtes-vous sûr de vouloir modifier vos informations ?",
    );

    // Si l'utilisateur clique sur "Annuler", on arrête la fonction ici
    if (!confirmed) return;

    // Active l'état de chargement (désactive le bouton + affiche le loader)
    setIsLoading(true);

    // Réinitialise les erreurs API affichées sous les champs
    setApiError(null);

    try {
      // ------------------------------------------------------------
      // 2) Séparer le champ "Nom Prénom" en first_name + last_name
      // ------------------------------------------------------------
      // On découpe la chaîne en utilisant l'espace comme séparateur.
      // Exemple : "Jean Dupont" → first_name = "Jean", last_name = "Dupont"
      const [first_name, ...rest] = form.name.trim().split(" ");
      const last_name = rest.join(" ");

      // ------------------------------------------------------------
      // 3) Vérification simple du mot de passe
      // ------------------------------------------------------------
      // Si l'utilisateur a saisi un mot de passe, on vérifie que
      // la confirmation correspond. Sinon, on affiche une erreur.
      if (form.password && form.password !== form.confirm) {
        setApiError({
          field: "confirm",
          message: "Les mots de passe ne correspondent pas.",
        });

        // On arrête ici et on désactive le loader
        setIsLoading(false);
        return;
      }

      // ------------------------------------------------------------
      // 4) Envoi des données au backend via updateUserProfile()
      // ------------------------------------------------------------
      await updateUserProfile({
        first_name,
        last_name,
        email: form.email,
        password: form.password || undefined, // envoyé seulement si rempli
      });

      // ------------------------------------------------------------
      // 5) Message de succès
      // ------------------------------------------------------------
      alert("Vos informations ont été mises à jour avec succès !");

      // ------------------------------------------------------------

      await updateUserProfile({
        first_name,
        last_name,
        email: form.email,
        password: form.password || undefined,
      });

      alert("Vos informations ont été mises à jour avec succès !");
    } catch (err) {
      const error = err as { message: string; field?: string };

      setApiError({
        field: error.field,
        message: error.message || "Erreur inconnue",
      });
    }

    setIsLoading(false);
  };

  /**
   * ------------------------------------------------------------
   * handleDelete
   * Supprime définitivement le compte utilisateur
   * ------------------------------------------------------------
   */
  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer votre compte ?")) return;

    try {
      await deleteUserAccount();
      alert("Compte supprimé");
      window.location.href = "/login";
    } catch (err) {
      alert("Erreur lors de la suppression : " + err);
    }
  };

  /**
   * ------------------------------------------------------------
   * Styles utilitaires
   * ------------------------------------------------------------
   */
  const inputStyle =
    "w-full px-4 py-2 rounded-full bg-white/80 border-none text-[12px] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-[#002b49]";
  const labelStyle =
    "block text-[11px] font-black ml-4 mb-0.5 italic uppercase text-[#002b49]";

  /**
   * ------------------------------------------------------------
   * Rendu du formulaire
   * ------------------------------------------------------------
   */
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Champ Nom complet */}
      <div>
        <label className={labelStyle}>Nom Prénom</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Nom prénom"
        />

        {/* Erreurs liées au prénom ou nom */}
        {(apiError?.field === "first_name" ||
          apiError?.field === "last_name") && (
          <p className="text-red-500 text-xs ml-4">{apiError.message}</p>
        )}
      </div>

      {/* Champ Email */}
      <div>
        <label className={labelStyle}>e-mail</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={inputStyle}
          placeholder="e-mail"
        />

        {apiError?.field === "email" && (
          <p className="text-red-500 text-xs ml-4">{apiError.message}</p>
        )}
      </div>

      {/* Nouveau mot de passe */}
      <div>
        <label className={labelStyle}>Nouveau mot de passe</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className={inputStyle}
          placeholder="mot de passe"
        />

        {apiError?.field === "password" && (
          <p className="text-red-500 text-xs ml-4">{apiError.message}</p>
        )}
      </div>

      {/* Confirmation du mot de passe */}
      <div>
        <label className={labelStyle}>Confirmer le mot de passe</label>
        <input
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          className={inputStyle}
          placeholder="mot de passe"
        />

        {apiError?.field === "confirm" && (
          <p className="text-red-500 text-xs ml-4">{apiError.message}</p>
        )}
      </div>

      {/* Bouton Soumettre */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-fit px-10 py-2 bg-[#002b49] text-white rounded-full font-bold text-sm shadow-lg hover:bg-[#003b63] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            "Soumettre"
          )}
        </button>
      </div>

      {/* Bouton Supprimer le compte */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={handleDelete}
          className="text-[11px] text-red-600 font-bold underline italic opacity-80"
        >
          Se désinscrire
        </button>
      </div>
    </form>
  );
}
