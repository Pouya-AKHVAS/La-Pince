import { describe, it, expect, vi } from "vitest";

import { render, screen, fireEvent } from "@testing-library/react";

import "@testing-library/jest-dom";

import RegisterForm from "./RegisterForm";

describe("🔴 Tests du composant d'inscription - La Pince", () => {

// Créer des fonctions et variables factices à passer aux props du composant
const mockOnSubmit = vi.fn();
const mockIsLoading = false;
const mockError = null;

// Test 1 : Vérifier la présence des champs et du bouton
it("Les champs et le bouton sont présents", () => {
render(

<RegisterForm
onSubmit={mockOnSubmit}
isLoading={mockIsLoading}
error={mockError}
/>
);

// Remplacer /Email/i par /E-mail/i pour correspondre à votre libellé réel
expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
expect(screen.getByRole("button", { name: /S'inscrire|Register/i })).toBeInTheDocument();

});

// Test 2: Le bouton du formulaire est-il cliquable?

it("le bouton est cliquable", async () => {

render(

<RegisterForm
onSubmit={mockOnSubmit}
isLoading={mockIsLoading}
error={mockError}
/>

);

const submitButton = screen.getByRole("button", { name: /S'inscrire|Register/i });

fireEvent.click(submitButton);

expect(submitButton).toBeInTheDocument();

});

});