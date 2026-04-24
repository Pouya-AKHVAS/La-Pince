// Types liés à l'authentification
// correpond aux champs de la route POST /auth/register 
//C'est la forme des données dans le formulaire React, côté front. Quand l'utilisateur tape son prénom, son nom, son email et son mot de passe, ces 4 champs forment un objet de type RegisterFormData.
export interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
} 

//C'est la forme de l'utilisateur après que le back a répondu. 
// Quand l'inscription réussit, le serveur renvoie les infos du compte créé — mais sans le mot de passe, jamais
export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// C'est la forme de l'erreur que le serveur peut renvoyer en cas de problème, par exemple si l'email est déjà utilisé ou si le mot de passe est trop court.
export interface ApiError {
  message: string;
  field?: string; // Permet de savoir quel champ est en erreur, par exemple "email" si l'email est déjà pris.
}

