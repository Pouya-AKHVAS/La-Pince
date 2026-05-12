// src/client/src/context/AuthContext.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import type { AuthUser } from "../types/auth";
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"

// Note : describe, it, expect, beforeEach, afterEach, vi sont globaux
// grâce à globals: true dans vite.config.ts — pas besoin de les importer.


// 1. MOCK DU MODULE authApi
//    vi.mock() est TOUJOURS au niveau du module — jamais dans une classe ou
//    une fonction. Vitest le "hisse" automatiquement avant l'import du module.
vi.mock("../services/authApi", () => ({
    fetchCurrentUser: vi.fn(),
    fetchLogout: vi.fn(),
    refreshSession: vi.fn(),
}));

// On importe APRÈS le mock pour que les fonctions soient déjà interceptées
import { fetchCurrentUser, refreshSession } from "../services/authApi";


// 2. COMPOSANT CONSOMMATEUR DE TEST
//      Un mini-composant qui affiche l'état du context en HTML.
//      React Testing Library ne test pas les hooks  directement - elle teste ce qui est rendu dans le DOM.


function TestConsumer() {
    const { user, isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) return <span data-testid="loading">chargement...</span>;

    return (
        <div>
            <span data-testid="status">
                {isAuthenticated ? "connecté " : "déconnecté"}
            </span>
            {user && <span data-testid="email">{user.email}</span>}
        </div>
    )
}


// 3. CLASSE FIXTURE
// Approche POO
// Chaque méthode retourne 'this', on peut chaîner les appels.


class AuthContextFixture {

    // Un Faux utilisateur réaliste, conforme au type AuthUser du projet
    readonly fakeUser: AuthUser = {
        id: 1,
        first_name: "Alice",
        last_name: "Ecila",
        email: "Alice.ecila@test.com",
        photo: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
    };

    // - Gestion des cookies
    
    withSessionCookie(): this {
        document.cookie ="sessionExists=1"
        return this;
    }

    withoutSessionCookie(): this {
        // Pour "supprimer" un cookie on le fait expirer dans le passé
        document.cookie = "sessionExists=; expires=Thu; 01 Jan 1970 00:00:00 GMT; path=/"
        return this;
    }

    // -- Configuration des mocks API -----------

    mockApiSuccess(): this {
        // fetchCurrentUser() retourne directement un AuthUSer (le service unwrap data.user)
        vi.mocked(fetchCurrentUser).mockResolvedValue(this.fakeUser);
        return this
    }

    mockApiFailure(): this {
        vi.mocked(fetchCurrentUser).mockRejectedValue(new Error("Non authentifié"));
        return this
    }

    mockRefreshSuccess(): this {
        vi.mocked(refreshSession).mockResolvedValue(undefined);
        return this
    }

    mockRefreshFailure(): this {
        vi.mocked(refreshSession).mockRejectedValue(new Error("Refresh token expiré"));
        return this
    }

    // Rendu

    render() {
        return render(
            <AuthProvider>
                <TestConsumer/>
            </AuthProvider>
        );
    }

    // Nettoyage

    cleanup() {
        // Expire tous les cookies présents dans jsdom
        document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();
            document.cookie = `${name} = expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        })
        vi.clearAllMocks();
    }
}

// 4 Les Tests

describe("AuthContext", () => {
  let fixture: AuthContextFixture;

  beforeEach(() => {
    // Nouvelle instance propre avant chaque test
    fixture = new AuthContextFixture();
  });

  afterEach(() => {
    // Cookies et mocks nettoyés après chaque test
    fixture.cleanup();
  });


  // ── Cas 1 ─────────────────────────────────────────────────────────────────
  it("ne fait aucun appel API si le cookie sessionExists est absent", async () => {
    fixture.withoutSessionCookie();
    fixture.render();

    // On attend que isInitializing passe à false
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    // Aucun appel réseau ne doit avoir eu lieu
    expect(fetchCurrentUser).not.toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("déconnecté");
  });


  // ── Cas 2 ─────────────────────────────────────────────────────────────────
  it("connecte l'utilisateur si le cookie est présent et /users/me répond OK", async () => {
    fixture.withSessionCookie().mockApiSuccess();
    fixture.render();

    // On attend que le prénom apparaisse dans le DOM
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("connecté");
    });

    expect(screen.getByTestId("email")).toHaveTextContent("Alice.ecila@test.com");
    expect(fetchCurrentUser).toHaveBeenCalledTimes(1);
  });


  // ── Cas 3 ─────────────────────────────────────────────────────────────────
  it("retry via refresh si /users/me échoue avec 401 mais que le refresh réussit", async () => {
    // AuthContext appelle fetchCurrentUser() DEUX fois dans ce chemin :
    //   1. dans le try principal → doit échouer (simule le 401)
    //   2. dans le catch, après refreshSession() → doit réussir
    // On configure les deux appels séquentiellement avec mockResolvedValueOnce.
    vi.mocked(fetchCurrentUser)
      .mockRejectedValueOnce(new Error("401"))  // 1er appel → échoue
      .mockResolvedValueOnce(fixture.fakeUser); // 2ème appel → OK

    fixture.withSessionCookie().mockRefreshSuccess();
    fixture.render();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("connecté");
    });

    expect(fetchCurrentUser).toHaveBeenCalledTimes(2);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });


  // ── Cas 4 ─────────────────────────────────────────────────────────────────
  it("reste déconnecté et ne plante pas si /users/me ET le refresh échouent", async () => {
    fixture
      .withSessionCookie()
      .mockApiFailure()
      .mockRefreshFailure();

    fixture.render();

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("déconnecté");
    // Aucune exception non catchée → le composant est toujours dans le DOM
    expect(screen.getByTestId("status")).toBeInTheDocument();
  });
});





