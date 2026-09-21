# Quetzal — Site admin

Site d'administration indépendant pour la boutique Quetzal : aperçu des
ventes, recherche de commandes, détail et téléchargement de facture PDF.
Connecté au même Google Sheet que le site boutique via Google Apps Script.

Stack : Vite + React + Tailwind CSS, déployé sur GitHub Pages via GitHub
Actions (build automatique à chaque `git push` sur `main`).

---

## 1. Logo

Le vrai logo Quetzal est déjà en place :
- `public/logo.png` — le pictogramme seul (Q + oiseau), utilisé dans l'en-tête et comme favicon
- `public/logo-full.png` — le logo complet (pictogramme + "Quetzal" + signature), utilisé sur la page de connexion
- `assets-source/quetzal-logo-officiel.png` — le fichier original fourni, conservé comme référence (non utilisé par le site, tu peux le supprimer ou t'en servir pour regénérer d'autres découpes plus tard)

Si tu changes de logo un jour, remplace ces fichiers en gardant les mêmes noms.

## 2. Vérifier le mapping des données (`src/lib/api.js`)

**Étape importante avant la mise en ligne.** Ce site a été construit sans
connaître la forme exacte du JSON renvoyé par ton Apps Script. Toute la
logique de correspondance entre les champs de ton script et l'affichage
est centralisée dans `src/lib/api.js`, dans les fonctions `normalizeOrder`,
`fetchStats`, `fetchProducts`.

Pour vérifier / corriger :

1. Ouvre dans ton navigateur :
   `<TON_URL_APPS_SCRIPT>/exec?action=stats`
   `<TON_URL_APPS_SCRIPT>/exec?action=orders&q=` (avec un vrai numéro ou nom)
   `<TON_URL_APPS_SCRIPT>/exec?action=invoice&orderNo=XXX`
2. Compare les noms de clés réels avec ceux listés dans les fonctions
   `pick(obj, [...])` de `src/lib/api.js`.
3. Si un champ ne s'affiche pas (ex : ville vide), ajoute le nom de clé
   réel dans la liste correspondante.

Le site tourne en local avec `npm run dev` pour tester ces ajustements
rapidement (voir section 5).

## 3. Configurer l'URL du script et le mot de passe

Deux façons de faire, au choix :

**A. En local (fichier `.env`)** — utile pour tester avant de pousser sur
GitHub :

```bash
cp .env.example .env
# puis édite .env avec l'URL de ton Apps Script et ton mot de passe
```

**B. Sur GitHub (secrets du dépôt)** — nécessaire pour que le site
déployé utilise les bonnes valeurs (le fichier `.env` n'est jamais poussé
sur GitHub, il est ignoré par git) :

1. Sur GitHub, va dans **Settings → Secrets and variables → Actions**
2. Ajoute deux secrets :
   - `VITE_APPS_SCRIPT_URL` → l'URL de ton Apps Script (se termine par `/exec`)
   - `VITE_ADMIN_PASSWORD` → le mot de passe que tu veux utiliser

Si tu ne configures pas ces secrets, le site utilisera les valeurs par
défaut codées dans `src/lib/config.js` (à modifier directement si tu
préfères cette méthode, plus simple mais le mot de passe apparaît alors
dans le code source du dépôt).

## 4. Créer le dépôt GitHub et activer Pages

```bash
# depuis le dossier du projet
git init
git add .
git commit -m "Site admin Quetzal - version initiale"
git branch -M main
git remote add origin https://github.com/<TON_COMPTE>/<NOM_DU_DEPOT>.git
git push -u origin main
```

Puis sur GitHub :

1. Va dans **Settings → Pages**
2. Dans "Build and deployment" → Source, choisis **GitHub Actions**
3. Le premier push déclenche automatiquement le workflow
   (`.github/workflows/deploy.yml`) — regarde l'onglet **Actions** du
   dépôt pour suivre la progression.
4. Une fois terminé, le site est visible à
   `https://<TON_COMPTE>.github.io/<NOM_DU_DEPOT>/`

Chaque `git push` sur `main` redéclenche automatiquement le build et la
mise à jour du site.

## 5. Développer en local

```bash
npm install
npm run dev
```

Le site est alors accessible sur `http://localhost:5173`.

## 6. Structure du projet

```
src/
  lib/
    config.js     → URL Apps Script + mot de passe (valeurs par défaut)
    api.js        → appels au Apps Script + mapping des champs (à ajuster)
    auth.jsx      → connexion simple par mot de passe (sessionStorage)
  components/
    Header.jsx
    StatsOverview.jsx   → les 4 cartes de statistiques
    OrderSearch.jsx     → barre de recherche
    OrderCard.jsx       → carte de commande (détail + bouton facture)
  pages/
    Login.jsx
    Dashboard.jsx
```

## En cas d'erreur "impossible de contacter le script"

Si les requêtes échouent une fois le site en ligne (mais fonctionnent en
local), vérifie que ton Apps Script est bien déployé avec l'accès
"Tout le monde" (Anyone) et non restreint à ton compte Google — sinon le
navigateur bloque la requête depuis le domaine GitHub Pages (CORS).
Comme le site boutique principal utilise déjà ce même script avec
succès, ce réglage est probablement déjà correct.

## Note sur la sécurité

Comme convenu : c'est un site 100% statique, le mot de passe est présent
dans le code JavaScript compilé et peut être retrouvé par n'importe qui
saurait où chercher. Cela suffit à décourager un visiteur curieux qui
tombe sur le lien, mais ce n'est pas une protection contre quelqu'un de
déterminé. Pour une vraie protection, il faudrait un minimum de backend
(authentification côté serveur), ce qui sort du cadre "site statique
GitHub Pages" demandé ici.
