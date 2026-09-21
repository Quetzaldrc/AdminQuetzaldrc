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

// ── Stats ───────────────────────────────────────────────────
export async function fetchStats() {
  const raw = await callAppsScript({ action: "stats" });
  return {
    totalRevenue: pickNumber(raw, ["totalRevenue", "chiffreAffaires", "revenue"]),
    totalOrders: pickNumber(raw, ["totalOrders", "nombreCommandes", "orders"]),
    totalItems: pickNumber(raw, ["totalItems", "articlesVendus", "items"]),
    avgOrder: pickNumber(raw, ["avgOrder", "panierMoyen", "averageOrder"]),
  };
}

// ── Produits (utile pour un futur écran catalogue) ─────────
export async function fetchProducts() {
  const raw = await callAppsScript({ action: "products" });
  const list = Array.isArray(raw) ? raw : raw?.products || raw?.produits || [];
  return list.map((p) => ({
    id: pick(p, ["ID", "id"]),
    name: pick(p, ["Nom", "name"]),
    price: pickNumber(p, ["Prix", "Prix ($)", "price"]),
    category: pick(p, ["Catégorie", "category"]),
    description: pick(p, ["Description", "description"]),
    imageUrl: pick(p, ["Image URL", "imageUrl", "image"]),
    active: pick(p, ["Actif", "active"]),
    raw: p,
  }));
}

// ── Recherche de commandes ──────────────────────────────────
function normalizeOrder(o) {
  const itemsRaw = pick(o, ["items", "produits", "articles", "lignes"], []);
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => ({
        product: pick(it, ["Produit", "product", "nom"]),
        size: pick(it, ["Pointure", "size", "pointure"]),
        quantity: pickNumber(it, ["Quantité", "quantity", "qty"], 1),
        unitPrice: pickNumber(it, ["Prix unitaire", "unitPrice", "prixUnitaire"]),
        lineTotal: pickNumber(it, ["Prix total ligne", "lineTotal", "total"]),
      }))
    : [];

  return {
    orderNo: String(pick(o, ["Numéro de commande", "orderNo", "numero", "numeroCommande"])),
    date: pick(o, ["Date", "date"]),
    firstName: pick(o, ["Prénom", "firstName", "prenom"]),
    lastName: pick(o, ["Nom", "lastName", "nom"]),
    email: pick(o, ["Email", "email"]),
    whatsapp: pick(o, ["WhatsApp", "whatsapp", "telephone", "phone"]),
    address: pick(o, ["Adresse de livraison", "address", "adresse"]),
    city: pick(o, ["Ville de livraison", "city", "ville"]),
    payment: pick(o, ["Mode de paiement", "payment", "modePaiement"]),
    total: pickNumber(o, ["Prix total commande", "total", "totalCommande"]),
    items,
    raw: o,
  };
}

export async function searchOrders(query) {
  const raw = await callAppsScript({ action: "orders", q: query });
  const list = Array.isArray(raw) ? raw : raw?.orders || raw?.commandes || [];
  return list.map(normalizeOrder);
}

// ── Facture PDF ──────────────────────────────────────────────
export async function fetchInvoice(orderNo) {
  const raw = await callAppsScript({ action: "invoice", orderNo });
  const base64 = pick(raw, ["pdf", "base64", "data", "invoice"]);
  const filename = pick(raw, ["filename", "fileName"], `facture-${orderNo}.pdf`);
  if (!base64) {
    throw new Error("Le script n'a pas renvoyé de PDF pour cette commande.");
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
