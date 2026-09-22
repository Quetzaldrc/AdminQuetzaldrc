import { APPS_SCRIPT_URL } from "./config";

// ─────────────────────────────────────────────────────────────
// Couche d'accès aux données (Google Apps Script)
// ─────────────────────────────────────────────────────────────
// ⚠️ IMPORTANT : les noms de champs exacts renvoyés par ton Apps
// Script n'étaient pas connus au moment de la construction de ce
// site. Toute la logique de "traduction" entre ce que renvoie ton
// script et ce qu'utilisent les composants React est regroupée
// ICI, dans les fonctions normalize*() ci-dessous. Si un champ ne
// s'affiche pas correctement (ex: la ville de livraison reste
// vide), c'est ICI qu'il faut corriger — pas dans les composants.
//
// Comment ajuster : ouvre dans ton navigateur
//   <TON_URL>/exec?action=orders
// regarde les vrais noms de clés dans le JSON renvoyé, puis
// ajoute-les dans les listes `pick(...)` correspondantes ci-dessous
// (elles essaient déjà plusieurs variantes courantes).

async function callAppsScript(params = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  let response;
  try {
    response = await fetch(url.toString(), { redirect: "follow" });
  } catch (err) {
    throw new Error(
      "Impossible de contacter le Google Apps Script. Vérifie ta connexion ou l'URL configurée."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Le serveur a renvoyé une erreur (${response.status}). Vérifie que le script est bien déployé publiquement.`
    );
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      "Réponse inattendue du script (pas du JSON valide). Vérifie le déploiement de l'Apps Script."
    );
  }
}

// Prend un objet et une liste de noms de clés possibles, renvoie
// la première valeur trouvée (ou fallback).
function pick(obj, keys, fallback = "") {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return fallback;
}

function pickNumber(obj, keys, fallback = 0) {
  const val = pick(obj, keys, fallback);
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.,-]/g, "").replace(",", "."));
  return Number.isFinite(num) ? num : fallback;
}

// ── Stats (reflète le filtre courant : recherche + période) ──
export async function fetchStats({ q, start, end } = {}) {
  const raw = await callAppsScript({ action: "stats", q, start, end });
  return {
    totalRevenue: pickNumber(raw, ["totalRevenue"]),
    totalOrders: pickNumber(raw, ["totalOrders"]),
    totalItems: pickNumber(raw, ["totalItems"]),
    avgOrder: pickNumber(raw, ["avgOrder"]),
  };
}

// ── Produits (utile pour un futur écran catalogue) ─────────
export async function fetchProducts() {
  const raw = await callAppsScript({ action: "products" });
  const list = Array.isArray(raw) ? raw : raw?.products || [];
  return list.map((p) => ({
    id: pick(p, ["id", "ID"]),
    name: pick(p, ["name", "Nom"]),
    price: pickNumber(p, ["price", "Prix", "Prix ($)"]),
    category: pick(p, ["category", "Catégorie"]),
    description: pick(p, ["desc", "Description", "description"]),
    imageUrl: pick(p, ["img", "Image URL", "imageUrl"]),
    active: pick(p, ["Actif", "active"]),
    raw: p,
  }));
}

// ── Recherche de commandes ──────────────────────────────────
function normalizeOrder(o) {
  const itemsRaw = pick(o, ["items"], []);
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => ({
        product: pick(it, ["produit", "Produit", "product"]),
        size: pick(it, ["pointure", "Pointure", "size"]),
        quantity: pickNumber(it, ["quantite", "Quantité", "quantity"], 1),
        unitPrice: pickNumber(it, ["prixUnitaire", "Prix unitaire ($)", "unitPrice"]),
        lineTotal: pickNumber(it, ["prixTotalLigne", "Prix total ligne ($)", "lineTotal"]),
      }))
    : [];

  return {
    orderNo: String(pick(o, ["orderNo", "Numéro de commande"])),
    date: pick(o, ["date", "Date"]),
    firstName: pick(o, ["prenom", "Prénom", "firstName"]),
    lastName: pick(o, ["nom", "Nom", "lastName"]),
    email: pick(o, ["email", "Email"]),
    whatsapp: pick(o, ["whatsapp", "WhatsApp"]),
    address: pick(o, ["adresse", "Adresse de livraison", "address"]),
    city: pick(o, ["ville", "Ville de livraison", "city"]),
    payment: pick(o, ["paiement", "Mode de paiement", "payment"]),
    total: pickNumber(o, ["total", "Prix total commande ($)"]),
    items,
    raw: o,
  };
}

export async function fetchOrders({ q, start, end } = {}) {
  const raw = await callAppsScript({ action: "orders", q, start, end });
  const list = Array.isArray(raw) ? raw : raw?.orders || [];
  return list.map(normalizeOrder);
}

// Conservé pour compatibilité si référencé ailleurs
export const searchOrders = (q) => fetchOrders({ q });

// ── Facture PDF ──────────────────────────────────────────────
export async function fetchInvoice(orderNo) {
  const raw = await callAppsScript({ action: "invoice", orderNo });
  const base64 = pick(raw, ["pdf", "base64", "data", "invoice"]);
  const filename = pick(raw, ["filename", "fileName"], `facture-${orderNo}.pdf`);
  if (!base64) {
    throw new Error(raw?.error || "Le script n'a pas renvoyé de PDF pour cette commande.");
  }
  return { base64, filename };
}

// ── Rapport PDF (stats + liste des commandes du filtre courant) ──
export async function fetchReport({ q, start, end } = {}) {
  const raw = await callAppsScript({ action: "report", q, start, end });
  const base64 = pick(raw, ["pdf"]);
  const filename = pick(raw, ["filename"], "rapport-quetzal.pdf");
  if (!base64) {
    throw new Error(raw?.error || "Le script n'a pas renvoyé de rapport.");
  }
  return { base64, filename };
}

// Déclenche le téléchargement d'un PDF à partir d'une chaîne base64
export function downloadBase64Pdf(base64, filename) {
  const cleaned = base64.includes(",") ? base64.split(",").pop() : base64;
  const byteChars = atob(cleaned);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
