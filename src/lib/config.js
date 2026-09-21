// ─────────────────────────────────────────────────────────────
// Configuration du site admin Quetzal
// ─────────────────────────────────────────────────────────────
// Ces deux valeurs peuvent être définies via des variables
// d'environnement au moment du build (fichier .env, voir .env.example)
// ou modifiées directement ici.

// URL de base de ton Google Apps Script (se termine par /exec)
export const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbwppp-AYKpPL5WRuU1hUtg-ymOFLnCWhGE-y0mGUdNouxJbHpv9RbIKwRbMUhf1ynEM/exec";

// Mot de passe simple pour l'accès admin.
// ⚠️ Ce n'est PAS une vraie sécurité (site 100% statique, le mot de
// passe est visible dans le code compilé) : cela sert uniquement à
// décourager les visiteurs curieux, comme demandé.
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || "quetzal-admin-2026";

// Clé utilisée dans sessionStorage pour retenir la connexion
// (effacée à la fermeture de l'onglet)
export const SESSION_KEY = "quetzal_admin_session";
