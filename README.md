# Airea — site vitrine multi-pages

## Arborescence livrée
- `index.html`
- `societe/index.html`
- `expertises/`
  - `amenagements-urbains.html`
  - `infrastructures-routieres.html`
  - `industries.html`
  - `chantiers.html`
  - `batiments.html`
  - `mobilites.html`
  - `conseil-expertise-formation.html`
- `contact/index.html`
- `recrutement/index.html`
- `blog/`
  - `index.html`
  - `micro-capteurs-qualite-air-exterieur.html`
  - `methaniseurs-nuisances-olfactives.html`
  - `quel-bilan-des-zfe-en-europe.html`
  - `pollution-air-et-covid-19.html`
  - `article-modele.html`
- `outils/teletravail/index.html`
- `outils/convertisseur/index.html`
- `mentions-legales/index.html`
- `assets/styles.css`
- `assets/script.js`
- `server/` : squelette Node.js pour les formulaires

## Points intégrés
- Header desktop/mobile
- Footer structuré
- Page d’accueil complète
- Pages expertises
- Page société
- Page contact
- Page recrutement
- Blog + gabarit d’article
- Emplacements prévus pour images / schémas / vidéos
- Carte OpenStreetMap intégrée sur l’accueil
- Chargement progressif des logos clients (`AME`, `AXE`, `BAT`, `CHA`, `IND`, `CON`, `MOB`)
- Outils `Télétravail` et `Convertisseur` laissés vides comme demandé
- Squelette Node.js / Express / Nodemailer prêt pour Infomaniak

## Images attendues
Le code pointe vers les chemins que tu as donnés :
- `images/airea/Favicon_Airea.webp`
- `images/airea/Logo_Airea_Horizontal.webp`
- `images/secteurs/...`
- `images/reseaux/...`
- `images/valeurs/...`
- le reste en `images/divers/...`

## Formulaires
Le front est prêt.
Le backend de démonstration est dans `server/`.

### Démarrage local
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Ensuite, soit :
- tu sers le front statique sur le même domaine avec reverse proxy vers Node,
- soit tu modifies `data-api-route` dans les formulaires pour pointer vers ton endpoint final.

## À compléter ensuite
- vraies URL externes (LinkedIn, etc.)
- politique de confidentialité RGPD
- visuels définitifs
- CAPTCHA réel
- configuration SMTP Infomaniak / domaine final
