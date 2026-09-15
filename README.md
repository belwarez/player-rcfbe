# player-rcfbe

Habillage du Web Player Radioplayer pour **RCF Liège** (rpId 1013) : une iframe
qui remplace les widgets natifs du lecteur.

Ce dépôt est un brouillon publiable, pas la destination finale. Le dossier
`docs/iframe/` est déposable tel quel sur `rcf.be` le jour où l'accès existe.

---

## Mise en ligne

1. Envoyer le contenu de ce dossier sur `github.com/belwarez/player-rcfbe`.
2. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch →
   Branch : `main` → Folder : `/docs` → Save**.

Une minute plus tard, le site est à `https://belwarez.github.io/player-rcfbe/`.

Il n'y a **rien d'autre** à configurer : pas de workflow, pas d'Actions, pas de
Node à installer. GitHub sert le dossier `docs/` tel qu'il est.

---

## Les quatre pages publiées

| Adresse | Ce que c'est |
|---|---|
| `/diagnostic/` | **À ouvrir en premier.** Teste ce que ce domaine a le droit d'appeler chez RCF. |
| `/` | La console de test : le vrai lecteur Radioplayer, station 1013, avec l'habillage à la place des widgets. |
| `/iframe/` | L'habillage seul. C'est ce fichier qui irait sur `rcf.be`. |
| `/banc-essai/` | L'habillage dans une console **simulée**, avec le journal des `postMessage`. Pour travailler le design sans dépendre du vrai lecteur. |

Et, hors site, `docs/console-locale.html` : un fichier unique qui embarque tout,
à ouvrir par double-clic depuis le disque.

### Pourquoi le diagnostic d'abord

Toutes les mesures faites jusqu'ici l'ont été **depuis `rcf.be` lui-même** — même
origine, donc aucun contrôle CORS ne s'applique. Rien ne prouve encore que
`wp-json` accepte les appels venus d'ailleurs.

- **S'il les accepte** : l'habillage reste une page statique et interroge RCF
  directement dans le navigateur. Données fraîches, aucun serveur.
- **S'il les refuse** : il faut soit l'héberger sur `rcf.be`, soit passer par un
  intermédiaire qui relaie l'appel.

Cette page tranche la question en quelques secondes, et l'architecture en dépend.

---

## Structure

```
src/
  iframe.html            l'habillage — gabarit, sans les données
  console.html           la console de test (configuration Radioplayer)
  data-rcf-liege.json    la grille du jour, figée au 14/09/2026
  podcasts-liege.json    les podcasts par catégorie (rcf.digital, filtré Liège)
  podcasts-grille.json   les émissions à l'antenne absentes de ce catalogue —
                         surtout du RCF France, récupérées dans la grille
  logo-liege.txt         le logo RCF Liège détouré, en data URI
  logo-rcf.svg           le lettrage RCF générique, vectoriel
  fonts/                 (facultatif, non versionné) voir « Typographie »
tools/
  cors-test.html         le diagnostic
build.js                 fabrique docs/ — aucune dépendance
docs/                    le résultat, publié tel quel par GitHub Pages
```

## Typographie

Deux polices, deux rôles — et il ne faut pas les confondre.

**Open Sans** pour tout le texte : noms d'émissions, titres d'épisodes, horaires,
présentateurs, descriptions. Elle est sous licence libre et vient de Google Fonts.

**Brandon Grotesque Bold, en capitales**, uniquement pour la **titraille** :
titres de section, noms de catégories, pastille « EN DIRECT », sélecteur de
stations, pastilles « DIRECT », « À L'ANTENNE », « NOUVEAU », intitulé
« DERNIERS ÉPISODES ». C'est l'usage défini par la charte RCF.

Le fichier `src/fonts/brandon-bold.woff2` est un **sous-ensemble capitales** :
84 glyphes sur 234, 10,6 Ko au lieu de 41. Les bas-de-casse en sont absents,
puisqu'ils ne servent jamais.

### Ce qu'il faut savoir avant de publier

`src/fonts/` n'est pas versionné, mais la police est **intégrée en base64 dans
`docs/iframe/index.html`**, qui l'est. Sur un dépôt public, ses octets sont donc
téléchargeables — ce qui reste de la redistribution, même en sous-ensemble.

RCF détient une licence web pour cette police, ce qui couvre sans ambiguïté le
dépôt final sur `rcf.be`. Pour le brouillon public, deux options :

```bash
node build.js                 # la police est intégrée
node build.js --sans-police   # elle ne l'est pas, la titraille passe à Outfit
```

Utiliser `--sans-police` pour ce qui part sur GitHub et une construction normale
pour ce qui part sur `rcf.be` évite complètement la question.

### Sur les fichiers d'origine

Les `.woff` du dossier `RCF Archives design/Fonts/brandonG/` sont accompagnés de
fichiers `-demo.html` : c'est la signature du générateur de Font Squirrel, donc
des conversions faites depuis la police de bureau. Ils ne déclarent aucune
licence et portent `fsType 4` (« aperçu et impression »). Si HVD a fourni des
fichiers web officiels au titre de la licence, ce sont ceux-là qu'il vaut mieux
utiliser — il suffit de refaire le sous-ensemble à partir d'eux.

## Les couleurs de catégorie

Chaque ligne de podcasts porte la couleur de sa rubrique. Les valeurs sont dans
`src/podcasts-liege.json`, champ `couleur` de chaque catégorie, avec leur origine
dans `_couleur`.

| Catégorie | Couleur | Origine |
|---|---|---|
| Actualité | `#BC1220` | Rouge profond — charte, P 7620C |
| Vie Spirituelle | `#EE8FA7` | Rose audacieux — charte, P 183C |
| Culture | `#EB732B` | Orange héritage — charte, P 172C |
| Économie et Société | `#28A8B4` | Cyan — hors charte |
| Écologie et Solidarité | `#748438` | Vert olive — hors charte |

Ces valeurs sont **relevées au pixel sur les visuels de `rcf.fr`** (captures de la
page Liège, 15/09/2026), pas déduites. Les vignettes d'émission portent le nom de
leur rubrique en capitales sur un aplat de sa couleur : le système se lit
directement. Trois des cinq tombent exactement sur les couleurs identitaires de la
charte de 2014 (écart de 4 à 5 sur 255, soit le bruit de capture) ; le cyan et
l'olive lui sont postérieurs. Détail de la mesure dans la fiche de connaissance
`24-la-couleur-des-rubriques.md`.

**Le rouge de l'Actualité.** RCF donne le rouge à l'info, et l'en-tête du player
est rouge aussi. L'Actualité prend donc le rouge **profond** `#BC1220` — l'extrémité
sombre du dégradé que RCF utilise déjà sur ces visuels — assez éloigné du `#E2001A`
de la station pour ne pas être confondu avec un élément de direct. Arbitrage à
faire confirmer.

Chaque catégorie a aussi un `couleurTexte` : la même teinte assombrie jusqu'à 4,5:1
sur blanc, pour tout ce qui porte des lettres. Le rose fait exception — assombri à
saturation pleine il vire au cramoisi et redevient confondable avec le rouge, il
est donc désaturé de 30 % d'abord.

**Chaque catégorie est une bande.** Un aplat de sa couleur à 7,5 % sur blanc
contient le titre, le carrousel et le panneau d'épisodes, et grandit avec eux
quand une émission s'ouvre. C'est l'aplat qui fait contenant : le panneau
d'épisodes n'a donc pas de cadre, il est simplement posé en blanc dessus.

L'aplat est tiré de `couleurTexte`, pas de `couleur`. Les teintes de charte n'ont
pas la même clarté : à 7,5 % sur blanc, le rose audacieux était invisible (13 de
delta) quand le rouge profond se voyait bien (18). Les variantes assombries sont
toutes à ~4,5:1, donc leurs voiles pèsent le même poids — mesuré entre 13 et 18.

Le reste de la couleur : le trait devant le nom de la catégorie, l'anneau de la
tuile ouverte, le nom de l'émission dans l'en-tête du panneau, la pastille
« nouveau », le bouton de lecture au survol, et le fond de secours d'une tuile
dont le visuel manque.

`docs/iframe/?sans-bandes=1` retire les aplats, pour comparer.

---

Après toute modification dans `src/` ou `tools/` :

```bash
node build.js
```

puis renvoyer `docs/`. **Le dossier `docs/` est versionné** — c'est lui qui est
publié, il ne faut donc pas l'ignorer.

---

## Ce qui reste à renseigner

- **RCF Sud Belgique.** Le sélecteur affiche trois stations, mais seules Liège et
  Bruxelles ont une console Radioplayer. Parcours du 15/09/2026 sur
  `rcf.be/wp-content/maradio/` : il n'existe que `RCF Liege`, `RCF-Bruxelles` et
  `1RCF`. Aucune pour Namur, Bastogne ou Sud Belgique.
- **Le code station `wp-json` de Bruxelles** est supposé (`RCFBruxelles`), pas
  testé. Seul celui de Liège est vérifié.
- **Les données en direct.** Figées pour l'instant, délibérément, pour que le
  rendu soit reproductible tant qu'on travaille le design. Le branchement dépend
  du diagnostic.

## Un bug repéré chez RCF, indépendant de ce dépôt

La console de **RCF Bruxelles** déclare son flux en `http://` alors qu'elle est
servie en `https://`. Les navigateurs bloquent ce mélange : son audio est
probablement muet aujourd'hui. Une seule ligne à corriger de leur côté.

## Ce qu'il faut savoir avant de toucher au code

- **Le son n'appartient pas à l'iframe.** Aucune balise `<audio>` : tout passe par
  `postMessage` vers le lecteur Radioplayer. Ajouter un lecteur audio ici ferait
  jouer deux flux en parallèle.
- **Aucun message ne charge un épisode.** La lecture à la demande se fait en
  rechargeant la console avec `?rpOdId={id}&rpSt={rpId}&rpSrp=index`. Le
  changement de station suit la même logique : on charge la console de l'autre
  station.
- **La fente fait 300 × 507** en `widgetOverrides`, verrouillée. En
  `widgets: ["IF"]` elle prend toute la largeur ; la hauteur ne bouge pas.
  L'iframe défile à l'intérieur, mais les 507 premiers pixels doivent suffire à
  comprendre où on est et à lancer le son.
- **Le lecteur doit être seul sur sa page.** L'intégrer dans une page de contenu
  est une rupture des conditions d'utilisation de Radioplayer.
