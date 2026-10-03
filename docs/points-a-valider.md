# Points à valider

## Médias absents des archives reçues

Les noms ont été recherchés dans l’ensemble du dossier Images. Aucun média de remplacement n’a été inventé. Les emplacements manquants ne déclenchent pas de requête vers un fichier absent.

| Page | Référence attendue |
| --- | --- |
| Airea et accueil | `Valeurs_Airea_Technicite.webp` |
| Airea et accueil | `Valeurs_Airea_Independance.webp` |
| Airea et accueil | `Valeurs_Airea_Proximite.webp` |
| Aménagements urbains | `Amenagements_urbains_modelisation3D.webp` |
| Radar pollution | `Schema_Radar_Pollution.webp` |
| Radar pollution | `Radar_pollution_PL_peage.webp` |
| Chantiers | `Chantiers_video1.mp4` |
| Défense & Armement | `Leclerc.webp` |

Les trois images des valeurs sont également référencées sur l’accueil. Le triptyque y conserve les trois libellés et les liens vers la section valeurs, en attendant les images rondes demandées.

## Sources et décisions éditoriales

- Les dates de publication ne sont pas suffisamment définies pour établir la chronologie complète du blog. Le menu conserve sa sélection explicite : modélisation 3D, méthaniseurs et microcapteurs. La grille commence par cette sélection ; l’ordre des autres articles reste à confirmer. Aucune date de publication n’a été ajoutée.
- Le footer mentionne « Calculer vos réductions d'émissions et vos économies réalisées », mais aucun code de cet outil n’a été reçu. Son texte est conservé sans lien. La structure principale et le menu reçus présentent seulement les deux autres outils. Une ancienne ligne « Télétravail » demeure dans la liste de chemins de l’arborescence : ce point reste à clarifier.
- Aucun tableau de correspondance entre logos et URL clients n’a été fourni. Les logos sont donc affichés sans lien ; ils reprennent leurs couleurs au survol.
- Les noms réels des dossiers de logos contiennent notamment `Logos_clients_AME`, `Logos_clients_AXE`, `Logos_clients_ICPE`, `Logos_clients_CHA`, `Logos_clients_FOR`, `Logos_clients_BAT` et `Logos_client_ARM`. Ils ont été utilisés sans renommer les fichiers. AME → urbains, AXE → routiers, ICPE → industries, CHA → chantiers, ARM → défense, FOR → conseil/formation, BAT → bâtiments. Aucun dossier spécifique Radar pollution n’a été fourni.
- Les chiffres des documents ont été conservés tels quels : accueil « 25 ans », « +500 entreprises », « +1500 interventions » ; page Airea « 27 », « 325 », « 1600 », « 8000 ». Leur cohérence doit être confirmée avant publication.
- Les mentions légales fournies citent encore Wix comme hébergeur. Ce texte a été conservé ; il faudra le mettre à jour après le choix effectif de l’hébergement.
- Le footer indique le code postal 93360 ; les mentions légales fournies indiquent 93660. Aucun des deux textes n’a été corrigé sans instruction.
- Les titres de pages reprennent les titres réels. Les descriptions SEO ont été proposées pour cette refonte à partir du contenu fourni ; elles sont modifiables dans `src/data/pages.json`. Les descriptions des outils sont des intitulés descriptifs.

## Éléments externes et périmètre de vérification

Les cartes uMap et vidéos YouTube demandées restent des contenus externes chargés dans des iframes. Les contrôles navigateur ont isolé ces appels pour vérifier le site local de façon reproductible ; leur disponibilité externe n’a pas été validée. La vidéo MP4 reçue pour l’article Marseille sera ajoutée séparément par le propriétaire dans `public/Images/Article_RSD_Marseille_video1.mp4` ; elle est exclue de cette branche. Le lecteur apparaîtra à la prochaine construction après ajout du fichier.

Le CSV et les calculs fournis ont été intégrés et testés en fonctionnement. Ces tests portent sur l’intégration et ne constituent pas une vérification scientifique ou réglementaire indépendante du contenu de la base.

Les formulaires sont volontairement non connectés. Aucun envoi réel ne doit être attendu à ce stade.
