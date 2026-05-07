import type { AuthUser } from "../types/auth";

export async function fetchUserProfile(): Promise<AuthUser> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/users/me`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de charger le profil utilisateur");
  }

  const data = await response.json();
  return data.user;
}

export async function updateUserProfile(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  photo?: string | null;
}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/users/me`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erreur lors de la mise à jour");
  }

  const data = await response.json();
  return data.user;
}

export async function deleteUserAccount(): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/users/me`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du compte");
  }
}
