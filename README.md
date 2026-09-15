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
  iframe.html           l'habillage — gabarit, sans les données
  console.html          la console de test (configuration Radioplayer)
  data-rcf-liege.json   données réelles figées au 14/09/2026
  logo-b64.txt          le logo RCF Liège en data URI
tools/
  cors-test.html        le diagnostic
build.js                fabrique docs/ — aucune dépendance
docs/                   le résultat, publié tel quel par GitHub Pages
```

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
