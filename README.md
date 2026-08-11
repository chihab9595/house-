# HOUSE

Application web PWA d'aide à la révision pour les étudiants en médecine (1ère à 7ème année).

## Démarrer

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## État actuel

Squelette du projet + tableau de bord d'accueil (données fictives dans `/data`). L'import de cours,
le scan OCR des annales, la génération de quiz, le suivi de progression, l'assistant vocal HOUSE et
le planning de révision seront ajoutés dans de prochaines sessions.

## Structure

- `app/` — routes et layout Next.js (App Router)
- `components/` — composants React réutilisables (`layout/`, `dashboard/`, `pwa/`)
- `data/` — données fictives (mock) en attendant les vraies sources
- `lib/` — types partagés et utilitaires
- `design/` — maquettes de référence (HTML)
- `public/icons/` — icônes PWA

## PWA

Le manifeste (`app/manifest.ts`) et le service worker (`public/sw.js`) sont configurés.
Le service worker ne s'enregistre qu'en build de production :

```bash
npm run build
npm run start
```
