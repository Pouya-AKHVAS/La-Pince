# Changelog — `feature/front/inscription-ui` vs `dev-connectBackFront`

## Résumé

Cette branche finalise l'interface de la page d'inscription : style, logique formulaire, et corrections de bugs. Toute la logique back-end (route, controller, validator) était déjà dans `dev-connectBackFront`.

---

## Nouveaux fichiers

### `src/client/src/components/auth/RegisterForm.tsx`
Composant formulaire d'inscription extrait de la page parente.
- Champs : prénom, nom, e-mail, mot de passe, confirmation
- Props : `onSubmit`, `isLoading`, `error`
- Accessibilité : `aria-invalid`, `aria-describedby`, `role="alert"` sur les messages d'erreur
- Affichage d'un spinner (`Loader2`) pendant le chargement

### `src/client/src/lib/utils.ts`
Utilitaire `cn()` basé sur `clsx` + `tailwind-merge` pour composer les classes CSS conditionnelles.

### `src/vite-env.d.ts`
Typage TypeScript pour `import.meta.env` :
```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}
```

---

## Fichiers modifiés

### `src/client/src/pages/auth/RegisterPage.tsx`
- Ajout de la gestion de photo de profil (state `photo`, input file caché, aperçu)
- Intégration du composant `RegisterForm` avec `isLoading` et `error`
- Mise en page responsive mobile / desktop complète (images, couches de couleur, logo, footer)

### `src/client/src/services/authApi.ts`
- Fonction `registerUser()` : appel `POST` vers `${VITE_API_BASE_URL}/auth/register`
- Gestion des erreurs API (`throw error` si `!response.ok`)

### `src/client/src/index.css`
- Suppression des styles globaux Vite/React de démo
- Reset minimal + imports Tailwind

### `src/client/vite.config.ts`
- Ajout du plugin `@tailwindcss/vite`

### `src/client/package.json`
Nouvelles dépendances :
- `clsx`, `tailwind-merge` — utilitaire `cn()`
- `lucide-react` — icône spinner
- `@tailwindcss/vite`, `tailwindcss` — intégration Tailwind

### `src/client/nginx.conf`
- Ajout du bloc `location /api/` pour proxifier les requêtes vers le service `api:3007`
- Correctif du bug 405 (nginx refusait les requêtes POST sur les fichiers statiques)

---

## Fichiers supprimés

### `src/client/src/App.tsx`
Suppression du boilerplate Vite de démo (compteur, liens React/Vite). Le routing est désormais géré par `src/client/src/router/index.tsx`.

---

## Corrections de bugs

| Commit | Description |
|--------|-------------|
| `acbbb52` | Accolade manquante dans `RegisterPage` |
| `8be4250` | Props `isLoading` et `error` manquantes sur `RegisterForm` |
| nginx fix | Proxy `/api/` absent → erreur 405 sur `POST /api/auth/register` |
