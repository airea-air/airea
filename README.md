# Airea — refonte statique

Site construit à partir des documents Word, du menu HTML, du footer et des médias fournis. Il comprend 30 pages, dont 14 articles, ainsi qu’une page 404. Les contenus principaux sont présents dans le HTML généré. Il n’utilise ni Wix ni dépendance JavaScript de production.

## Lancer le site

Prérequis : Node.js 22 ou supérieur. Aucune installation de paquet n’est nécessaire.

```sh
npm run build
npm run check
npm run dev
```

Ouvrir http://localhost:4173. Après une modification de contenu ou de style, relancer `npm run build`, puis actualiser le navigateur. Le serveur ne surveille pas automatiquement les fichiers. Pour changer le port : `PORT=3000 npm run dev`.

Le générateur copie les ressources et écrit les pages dans `dist/`. Ce dossier est reproductible et n’est pas versionné. `npm run check` contrôle les pages, les destinations locales, les identifiants, le blog et les formulaires.

## Modifier le site

| Élément | Fichier ou emplacement |
| --- | --- |
| Textes des pages et articles | `src/pages/`, un fragment HTML par document Word |
| Accueil | fonction `home()` de `scripts/build.mjs` ; les paragraphes de présentation proviennent de `src/data/source-paragraphs.json` |
| Routes, titres et descriptions | `src/data/pages.json` |
| Menu fourni | `src/components/menu-source.html` ; liens adaptés par le générateur |
| Footer et formulaires partagés | fonctions `footer()` et `form()` de `scripts/build.mjs` |
| Couleurs, espacements, responsive | `public/assets/site.css`, variables au début du fichier |
| Comportements communs | `public/assets/site.js` |
| Images et logos d’origine | `public/Images/` |
| Versions d’images adaptées aux écrans | `public/assets/responsive/` et `src/data/image-sizes.json` |
| Montserrat locale et licence | `public/assets/fonts/` |
| Convertisseur, VLEP/VLCT et graphique carbone | `public/embeds/` ; composants isolés dans des iframes locales |
| Données VLEP/VLCT fournies | `public/data/Export_VLEP_VLCT.csv` |

Les URL du menu fourni sont converties en chemins du nouveau site. Les anciens liens internes présents dans les Word ont été adaptés ; leur correspondance est conservée dans `src/data/internal-link-map.json`. Les rubriques qui regroupent des liens n’ont pas de page supplémentaire.

Les logos de l’accueil sont dédupliqués par nom normalisé et empreinte de fichier, puis mélangés dans un ordre déterministe. Chaque secteur utilise son dossier. Le défilement s’arrête au survol, au focus, avec le bouton de pause et lorsque la préférence de réduction des animations est active. Pour ajouter des destinations clients, créer `src/data/logo-links.json` avec une correspondance `"Nom_du_logo.webp": "https://…"`. Aucune destination n’a été inventée.

Pour ajouter ou remplacer une image, conserver son nom et son sous-dossier dans `public/Images/`. Les variantes optimisées sont facultatives : le générateur utilise uniquement les variantes réellement disponibles et conserve toujours la référence à l’image d’origine. Les médias absents sont indiqués par des commentaires `Ressource attendue` à leur emplacement dans les fragments HTML ; voir `docs/points-a-valider.md`. Ajouter le fichier et remplacer le commentaire par l’élément image ou vidéo correspondant. L’accueil utilise provisoirement des liens textuels pour les trois valeurs dont les images manquent.

La vidéo de l’article Marseille est laissée hors du dépôt à la demande du propriétaire. Pour l’intégrer, ajouter `public/Images/Article_RSD_Marseille_video1.mp4`, puis lancer `npm run build`. Son emplacement est conservé dans le fragment de l’article ; le générateur masque le lecteur tant que le fichier est absent.

## Formulaires

Les formulaires de devis de l’accueil et de la page contact utilisent exactement la même fonction. Le recrutement utilise sa variante. Les boutons d’envoi sont désactivés, aucune action de formulaire ni requête d’envoi n’est configurée, et un message indique cet état. Les pièces jointes restent dans le navigateur.

Pour une connexion ultérieure sur Vercel, créer un endpoint de réception, valider les champs et pièces jointes côté serveur, configurer les secrets hors du code, puis raccorder le traitement de soumission dans `site.js`. Activer le bouton et reCAPTCHA seulement lorsque cette connexion fonctionne. Aucun endpoint ou compte externe n’a été configuré ici.

## Hébergement futur

`vercel.json` définit `npm run build` comme commande de construction et `dist` comme dossier de sortie. Les liens absolus supposent un hébergement à la racine du domaine. Le sitemap et les URL canoniques ciblent `https://www.airea.fr/` et doivent être adaptés si le domaine définitif change. Aucune publication ni bascule du domaine n’a été effectuée.

Voir `docs/pages.md` pour la liste des pages et `docs/points-a-valider.md` pour les éléments incomplets et les choix éditoriaux à confirmer.

## Import du code sans médias

Les images, logos et vidéos sont ajoutés séparément par le propriétaire. Aucun de ces fichiers n’est inclus dans cet import. Copier le contenu du dossier **Images** fourni dans `public/Images/`, en conservant les sous-dossiers (notamment `Secteurs/` et `Logos_clients_…/`) et les noms exacts. Éviter un dossier imbriqué `public/Images/Images/`.

La construction fonctionne même si `public/Images/` n’existe pas encore. Les carrousels de logos apparaissent après ajout des logos et reconstruction. Les images absentes conservent leur référence ; la vidéo Marseille est masquée jusqu’à son ajout. Les variantes de `public/assets/responsive/` ne sont pas nécessaires.

Après ajout des médias :

```sh
npm run build
npm run check
```

Les pages complètes sont générées dans `dist/`, dossier de sortie configuré pour l’hébergement. `dist/medias-manquants.json` liste les médias encore absents ; ce rapport ne bloque pas la construction. Les contrôles échouent toujours pour une page, un script, une feuille de style ou une donnée locale manquante.

## Publication sur GitHub Pages

Le workflow `.github/workflows/pages.yml` construit et vérifie le site avec Node.js, puis publie le contenu de `dist/`. Aucun Node.js n’est nécessaire sur le PC des visiteurs ou du propriétaire pour cette publication automatique.

Dans le dépôt GitHub : **Settings → Pages → Build and deployment → Source → GitHub Actions**. Puis dans **Actions → Publier le site Airea → Run workflow → main → Run workflow**. Les prochains commits sur `main` déclenchent la publication automatiquement.

Le workflow utilise `BASE_PATH=/airea` et `SITE_ORIGIN=https://www.airea-air.com`, pour publier sous `/airea/`. Ces options adaptent les liens, les médias, les polices, les outils intégrés, les URL canoniques et le sitemap. Elles ne changent ni le DNS ni les réglages du domaine. En local et sur un hébergement à la racine, `npm run build` conserve des chemins sans préfixe.
