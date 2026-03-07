# NotarialPro - Plateforme SaaS pour Offices Notariaux

NotarialPro est une plateforme complète de gestion des programmes immobiliers pour offices notariaux. Elle permet de créer des landing pages dynamiques, collecter les candidatures, gérer les dossiers et communiquer avec les candidats via WhatsApp.

## 🚀 Fonctionnalités

### Pour le Cabinet Notarial

- **Dashboard complet** : Vue d'ensemble des projets, candidats et statistiques
- **Gestion des projets immobiliers** : Création, modification, suspension de programmes
- **Landing pages dynamiques** : Génération automatique d'une page par projet
- **Gestion des candidats** : Suivi complet des dossiers avec statuts (nouveau, en cours, retenu, refusé)
- **Collecte de documents** : Upload sécurisé des pièces justificatives
- **Chatbot intégré** : Assistant virtuel pour guider les candidats
- **Intégration WhatsApp** : Communication directe avec les candidats
- **Export CSV** : Export des données candidats
- **Synchronisation temps réel** : Mises à jour instantanées via Supabase

### Pour les Candidats

- **Landing page attractive** : Présentation claire du programme immobilier
- **Formulaire de candidature** : Processus en 4 étapes simple
- **Upload de documents** : Dépose sécurisée des pièces requises
- **Chatbot d'aide** : Réponses instantanées aux questions fréquentes
- **Suivi de candidature** : Visualisation du statut du dossier

## 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Intégrations** : WhatsApp API (Whapi)
- **Déploiement** : Static hosting

## 📁 Structure du Projet

```
app/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Composants du dashboard admin
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ProjetCard.tsx
│   │   │   └── CandidatRow.tsx
│   │   └── ui/                 # Composants shadcn/ui
│   ├── pages/
│   │   ├── dashboard/          # Pages du dashboard
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── ProjetsList.tsx
│   │   │   ├── NouveauProjet.tsx
│   │   │   └── CandidatsList.tsx
│   │   └── landing/            # Landing pages publiques
│   │       └── LandingPage.tsx
│   ├── hooks/
│   │   └── useSupabase.ts      # Hooks personnalisés Supabase
│   ├── lib/
│   │   └── supabase.ts         # Client Supabase
│   ├── types/
│   │   ├── index.ts            # Types TypeScript
│   │   └── database.ts         # Types Supabase
│   ├── App.tsx                 # Router principal
│   └── main.tsx                # Point d'entrée
├── supabase/
│   └── schema.sql              # Schéma de base de données
└── package.json
```

## 🗄️ Structure de la Base de Données

### Tables principales

- **cabinets** : Informations des offices notariaux
- **utilisateurs** : Collaborateurs du cabinet
- **projets** : Programmes immobiliers
- **documents_requis** : Documents nécessaires par projet
- **candidats** : Candidatures reçues
- **documents_fournis** : Documents uploadés par les candidats
- **whatsapp_conversations** : Historique des messages WhatsApp
- **chatbot_configs** : Configuration du chatbot par projet
- **chatbot_messages** : Historique des conversations chatbot
- **activity_logs** : Journal d'activité

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir les variables dans `.env` :
- `VITE_SUPABASE_URL` : URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

### 4. Configurer Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Exécuter le script SQL dans `supabase/schema.sql`
3. Configurer les buckets de stockage :
   - `projets` : Images des projets (public)
   - `candidats` : Documents des candidats (private)

### 5. Lancer le serveur de développement

```bash
npm run dev
```

### 6. Build pour production

```bash
npm run build
```

## 📱 Utilisation

### Connexion

- URL : `/login`
- Démo : `demo@notarialpro.fr` / `demo`

### Créer un nouveau projet

1. Aller dans "Nouveau Projet"
2. Remplir les informations du bien immobilier
3. Uploader la bannière et les photos
4. Définir les documents requis
5. Ajouter les conditions d'éligibilité
6. Publier le projet

### Partager la landing page

Une fois le projet créé, la landing page est accessible à :
```
https://votre-domaine.com/p/{slug-du-projet}
```

### Gérer les candidats

1. Aller dans "Candidats"
2. Filtrer par projet ou statut
3. Cliquer sur un candidat pour voir son dossier complet
4. Changer le statut (nouveau → en cours → retenu/refusé)
5. Contacter via WhatsApp directement

## 🔧 Configuration du Chatbot

Le chatbot est automatiquement activé sur chaque landing page. Il répond aux questions fréquentes sur :
- Les documents requis
- Le prix et les caractéristiques du bien
- Les conditions d'éligibilité
- Les délais de traitement
- Les coordonnées du cabinet

## 📞 Intégration WhatsApp

Pour activer l'intégration WhatsApp :

1. Créer un compte sur [Whapi](https://whapi.io)
2. Obtenir un token API
3. Renseigner le token dans les paramètres du cabinet
4. Les messages peuvent alors être envoyés depuis la fiche candidat

## 🔒 Sécurité

- Authentification JWT via Supabase Auth
- Row Level Security (RLS) sur toutes les tables
- Stockage sécurisé des documents
- Validation des fichiers uploadés (type et taille)

## 📈 Fonctionnalités à venir

- [ ] Notifications email
- [ ] Signature électronique
- [ ] Génération de documents (PDF)
- [ ] Statistiques avancées
- [ ] API publique
- [ ] Application mobile

## 📝 Licence

Propriétaire - Tous droits réservés

## 🤝 Support

Pour toute question ou assistance, contactez :
- Email : support@notarialpro.fr
- Téléphone : 01 23 45 67 89
