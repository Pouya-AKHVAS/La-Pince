import RegisterForm from '../../components/auth/RegisterForm'
import { useState } from 'react'
import { registerUser } from '../../services/authApi'
import type { RegisterFormData, ApiError } from '../../types/auth'

export default function RegisterPage() {

  // isLoading : true pendant que l'appel API est en cours et false une fois que la réponse est reçue, ce qui permet d'afficher un indicateur de chargement ou de désactiver le formulaire pendant l'appel API.
  const [isLoading, setIsLoading] = useState(false);

// error : contient le message d'erreur si l'API répond avec une erreur 
// null si pas d'erreur 

const [error, setError] = useState<ApiError | null>(null);

const handleSubmit = async (data: RegisterFormData) => {
  setIsLoading(true);
  setError(null);
  try {
    await registerUser(data);
    // si l'inscription réussit, on peut rediriger l'utilisateur vers une autre page ou afficher un message de succès
    alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
  } catch (err) {
    // si l'API répond avec une erreur, on met à jour le state error pour afficher le message d'erreur à l'utilisateur
    setError(err as ApiError);
  } finally {
    setIsLoading(false);
  }

  return (
    <main>
      <h1>Créer un compte</h1>
      <RegisterForm 
        onSubmit={handleSubmit} // on passe la fonction handleSubmit en prop à RegisterForm, qui l'appellera avec les données du formulaire quand l'utilisateur le soumettra
        isLoading={isLoading} 
        error={error}
      />
      <p>
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </main>
  )
}}