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
 * Rôle :
 *  - Afficher les informations du profil utilisateur
 *  - Permettre la modification du nom, email et mot de passe
 *  - Envoyer les modifications au backend (PATCH /users/me)
 *  - Permettre la suppression du compte (DELETE /users/me)
 *
 * Notes importantes :
 *  - Les données sont chargées automatiquement via useEffect
 *  - Le formulaire est contrôlé via useState
 *  - Les cookies (accessToken) sont envoyés automatiquement
 *    grâce à credentials: "include" dans les services
 * ------------------------------------------------------------
 */
export default function ParametreForm() {
  /**
   * ------------------------------------------------------------
   * State du formulaire
   *  - name : nom complet (first_name + last_name)
   *  - email : email de l'utilisateur
   *  - password : nouveau mot de passe (optionnel)
   *  - confirm : confirmation du mot de passe
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
   * Indique si une requête API est en cours
   * Permet d'afficher un loader et de désactiver les boutons
   * ------------------------------------------------------------
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ------------------------------------------------------------
   * handleChange
   * Met à jour le state du formulaire à chaque frappe clavier.
   *
   * e.target.name → correspond au champ (name, email, password…)
   * e.target.value → nouvelle valeur saisie
   * ------------------------------------------------------------
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * ------------------------------------------------------------
   * Chargement automatique du profil utilisateur
   * via GET /users/me (fetchUserProfile)
   *
   * Objectif :
   *  - Pré-remplir le formulaire avec les données actuelles
   *  - Laisser les champs password vides (sécurité)
   *
   * Note :
   *  user.first_name + user.last_name → champ "name"
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
   * Envoie les modifications au backend via PATCH /users/me
   *
   * Étapes :
   *  1. Empêcher le rechargement de la page
   *  2. Activer le loader
   *  3. Séparer le champ "name" en first_name + last_name
   *  4. Envoyer les données au backend
   *  5. Afficher un message de succès ou d'erreur
   * ------------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Découper "Nom Prénom" en first_name + last_name
      const [first_name, ...rest] = form.name.split(" ");
      const last_name = rest.join(" ");

      await updateUserProfile({
        first_name,
        last_name,
        email: form.email,
        password: form.password || undefined, // envoyé seulement si rempli
      });

      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + err);
    }

    setIsLoading(false);
  };

  /**
   * ------------------------------------------------------------
   * handleDelete
   * Supprime définitivement le compte utilisateur
   * via DELETE /users/me
   *
   * Étapes :
   *  - Demander confirmation
   *  - Appeler deleteUserAccount()
   *  - Rediriger vers la page de connexion
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
   * Styles utilitaires pour les inputs et labels
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
      </div>

      {/* Nouveau mot de passe */}
      <div>
        <label className={labelStyle}>mot de passe</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className={inputStyle}
          placeholder="mot de passe"
        />
      </div>

      {/* Confirmation du mot de passe */}
      <div>
        <label className={labelStyle}>Changer de mot de passe</label>
        <input
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          className={inputStyle}
          placeholder="mot de passe"
        />
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
      <div className="text-center">
        <button
          type="button"
          onClick={handleDelete}
          className="text-[11px] text-[#002b49] font-bold underline italic opacity-80"
        >
          Se désinscrire
        </button>
      </div>
    </form>
  );
}
