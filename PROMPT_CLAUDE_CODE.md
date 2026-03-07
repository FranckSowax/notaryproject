# Prompt pour Claude Code - Analyse du Projet NotarialPro

## Contexte

Tu es un développeur senior qui doit analyser et comprendre la plateforme **NotarialPro**, un SaaS pour offices notariaux au Gabon. Cette plateforme permet de créer des landing pages pour des programmes immobiliers et de gérer les candidatures.

## Objectif

Analyse en profondeur l'architecture, les fonctionnalités et la structure du code pour pouvoir :
1. Comprendre le fonctionnement global
2. Identifier les composants clés
3. Proposer des améliorations ou modifications
4. Ajouter de nouvelles fonctionnalités

## Structure du Projet

```
/mnt/okcomputer/output/app/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Composants du dashboard admin
│   │   │   ├── Sidebar.tsx     # Navigation latérale
│   │   │   ├── StatsCards.tsx  # Cartes de statistiques
│   │   │   ├── ActivityFeed.tsx # Flux d'activité
│   │   │   ├── ProjetCard.tsx  # Carte projet
│   │   │   └── CandidatRow.tsx # Ligne candidat
│   │   └── ui/                 # Composants shadcn/ui
│   ├── pages/
│   │   ├── dashboard/          # Pages du dashboard
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── ProjetsList.tsx
│   │   │   ├── NouveauProjet.tsx
│   │   │   └── CandidatsList.tsx
│   │   └── landing/            # Landing pages publiques
│   │       ├── LandingPage.tsx      # Template générique
│   │       └── BolokoboueLanding.tsx # Template Bolokoboué
│   ├── hooks/
│   │   └── useSupabase.ts      # Hooks personnalisés Supabase
│   ├── lib/
│   │   └── supabase.ts         # Client Supabase
│   ├── types/
│   │   ├── index.ts            # Types TypeScript
│   │   └── database.ts         # Types Supabase
│   └── App.tsx                 # Router principal
├── supabase/
│   └── schema.sql              # Schéma de base de données
├── public/
│   ├── parcelle1.jpg           # Images Bolokoboué
│   ├── parcelle2.jpg
│   └── bolokoboue.html         # Landing page statique
└── package.json
```

## Architecture Technique

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Déploiement**: Static hosting

### Base de Données (Supabase)

Tables principales :
- `cabinets` - Informations des offices notariaux
- `utilisateurs` - Collaborateurs du cabinet
- `projets` - Programmes immobiliers
- `documents_requis` - Documents nécessaires par projet
- `candidats` - Candidatures reçues
- `chatbot_configs` - Configuration du chatbot
- `activity_logs` - Journal d'activité

### Types Principaux

```typescript
interface ProjetImmobilier {
  id: string;
  titre: string;
  slug: string;
  description: string;
  adresse: string;
  ville: string;
  code_postal: string;
  type_bien: 'terrain' | 'villa' | 'maison' | 'appartement' | 'commerce' | 'immeuble' | 'autre';
  prix: number;
  surface: number;
  nb_pieces: number;
  nb_chambres: number;
  statut: 'actif' | 'inactif' | 'suspendu' | 'termine';
  banner_image: string;
  images: string[];
  documents_requis: DocumentRequis[];
  conditions_eligibilite: string[];
  contact_email: string;
  contact_phone: string;
  cabinet_id: string;
  nombre_inscriptions: number;
  nombre_retenus: number;
}

interface Candidat {
  id: string;
  projet_id: string;
  statut: 'nouveau' | 'en_cours' | 'retenu' | 'refuse' | 'desiste';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  situation_familiale: string;
  adresse: string;
  ville: string;
  code_postal: string;
  profession: string;
  employeur: string;
  revenus_mensuels: number;
  type_contrat: string;
  anciennete_emploi: string;
  apport_personnel: number;
  montant_pret_sollicite: number;
  duree_pret: number;
  banque_actuelle: string;
  documents: DocumentFourni[];
  notes: string;
}
```

## Fonctionnalités Clés

### 1. Dashboard Admin
- Vue d'ensemble avec statistiques (projets, candidats, retenus)
- Liste des projets avec filtres et recherche
- Création de nouveau projet (4 étapes : infos, images, documents, conditions)
- Gestion des candidats (statuts, export CSV, contact WhatsApp)
- Journal d'activité en temps réel

### 2. Landing Pages Dynamiques
- Une page par projet avec slug unique
- Bannière personnalisable
- Galerie photos
- Caractéristiques du bien
- Formulaire de candidature multi-étapes
- Chatbot intégré
- Design responsive

### 3. Template Bolokoboué
- Landing page spécifique pour le programme immobilier Bolokoboué
- 2 types de parcelles (525m² et 1050m²)
- Prix en FCFA
- Formulaire d'inscription en 4 étapes
- Chatbot avec FAQ

### 4. Gestion des Candidats
- Suivi des statuts (nouveau → en cours → retenu/refusé)
- Upload de documents
- Contact WhatsApp
- Export CSV

### 5. Chatbot
- Réponses automatiques aux questions fréquentes
- Configuration par projet
- Historique des conversations

## Hooks Personnalisés

### useProjets(cabinetId)
Récupère les projets d'un cabinet avec souscription temps réel

### useProjetBySlug(slug)
Récupère un projet par son slug pour les landing pages

### useCandidats(projetId)
Récupère les candidats d'un projet (ou tous si pas d'ID)

### useDashboardStats(cabinetId)
Calcule les statistiques pour le dashboard

### useCreateCandidat()
Hook pour créer une nouvelle candidature

### useUpdateCandidatStatut()
Hook pour mettre à jour le statut d'un candidat

### useToggleProjetStatut()
Hook pour suspendre/réactiver un projet

## Flux de Données

```
1. Cabinet crée un projet → Supabase
2. Landing page générée avec slug unique
3. Candidats s'inscrivent via le formulaire
4. Données synchronisées en temps réel
5. Cabinet gère les candidats dans le dashboard
6. Chatbot répond aux questions
7. Contact WhatsApp possible
```

## Configuration Supabase

### Storage Buckets
- `projets` - Images des projets (public)
- `candidats` - Documents des candidats (private)

### RLS Policies
- Lecture/écriture selon le cabinet_id
- Candidats : insertion publique, lecture/modification restreinte

### Triggers
- Mise à jour du compteur d'inscriptions
- Création des logs d'activité
- Mise à jour du search_vector pour la recherche

## Points d'Attention

### Sécurité
- Authentification JWT via Supabase Auth
- Row Level Security sur toutes les tables
- Validation des fichiers uploadés

### Performance
- Souscriptions temps réel pour les mises à jour
- Lazy loading des images
- Animations optimisées

### Adaptation Gabon
- Devise FCFA
- Documents requis adaptés (CNI gabonaise, certificat de résidence)
- Types de biens : terrain, villa, maison prioritaires

## Tâches Courantes

### Ajouter un nouveau type de bien
1. Modifier `typeBienOptions` dans NouveauProjet.tsx
2. Mettre à jour le type dans types/index.ts

### Modifier le design d'une landing page
1. Modifier le composant dans pages/landing/
2. Adapter les couleurs, polices, layout

### Ajouter un champ au formulaire candidat
1. Modifier l'interface Candidat dans types/index.ts
2. Ajouter le champ dans le formulaire de LandingPage.tsx
3. Mettre à jour la table candidats dans schema.sql

### Créer un nouveau template de landing page
1. Créer un nouveau composant dans pages/landing/
2. Copier la structure de BolokoboueLanding.tsx
3. Adapter le contenu et le design
4. Ajouter la route dans App.tsx

## Commandes Utiles

```bash
# Installation
cd /mnt/okcomputer/output/app && npm install

# Développement
npm run dev

# Build
npm run build

# Déploiement
# Le dossier dist/ est déployé automatiquement
```

## URLs Importantess

- **Dashboard**: `/dashboard`
- **Login**: `/login` (demo@notarialpro.fr / demo)
- **Landing Page Générique**: `/p/:slug`
- **Landing Page Bolokoboué**: `/bolokoboue.html`

## Questions à Se Poser

1. Comment fonctionne la synchronisation temps réel avec Supabase ?
2. Quelle est la structure des données pour un projet complet ?
3. Comment le chatbot répond-il aux questions ?
4. Quels sont les points d'extension possibles ?
5. Comment ajouter une nouvelle fonctionnalité sans casser l'existant ?

## Ressources

- Schéma SQL: `/mnt/okcomputer/output/app/supabase/schema.sql`
- Types: `/mnt/okcomputer/output/app/src/types/`
- Hooks: `/mnt/okcomputer/output/app/src/hooks/useSupabase.ts`
- Composants Dashboard: `/mnt/okcomputer/output/app/src/components/dashboard/`

---

## Instructions pour l'Analyse

1. Lis d'abord le fichier `src/App.tsx` pour comprendre le routing
2. Analyse `src/types/index.ts` pour les structures de données
3. Examine `src/hooks/useSupabase.ts` pour comprendre les interactions avec la BDD
4. Regarde les composants du dashboard pour l'interface admin
5. Étudie les landing pages pour l'interface publique
6. Consulte le schéma SQL pour la structure de la BDD

Pose-moi des questions sur ce que tu ne comprends pas, et je t'expliquerai en détail.
