// Types pour la plateforme NotarialPro

export interface ProjetImmobilier {
  id: string;
  created_at: string;
  updated_at: string;
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  quartier: string;
  lien_localisation: string | null;
  type_bien: 'appartement' | 'maison' | 'villa' | 'commerce' | 'terrain' | 'autre';
  prix: number;
  surface: number;
  nb_pieces: number;
  nb_chambres: number;
  statut: 'actif' | 'inactif' | 'suspendu' | 'termine';
  date_ouverture: string;
  date_cloture: string | null;
  banner_image: string;
  images: string[];
  documents_requis: DocumentRequis[];
  conditions_eligibilite: string[];
  contact_email: string;
  contact_phone: string;
  cabinet_id: string;
  slug: string;
  nombre_inscriptions: number;
  nombre_retenus: number;
}

export interface DocumentRequis {
  id: string;
  nom: string;
  description: string;
  obligatoire: boolean;
  type_fichier: string[];
  taille_max: number;
}

export interface Candidat {
  id: string;
  created_at: string;
  updated_at: string;
  projet_id: string;
  statut: 'nouveau' | 'en_cours' | 'retenu' | 'refuse' | 'desiste';
  
  // Informations personnelles
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  situation_familiale: 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf';
  
  // Adresse
  adresse: string;
  ville: string;
  code_postal: string;
  
  // Situation professionnelle
  profession: string;
  employeur: string;
  revenus_mensuels: number;
  type_contrat: 'cdi' | 'cdd' | 'interim' | 'freelance' | 'entrepreneur' | 'retraite' | 'autre';
  anciennete_emploi: string;
  
  // Situation financière
  apport_personnel: number;
  montant_pret_sollicite: number;
  duree_pret: number;
  banque_actuelle: string;
  
  // Documents fournis
  documents: DocumentFourni[];
  
  // Notes et commentaires
  notes: string;
  
  // WhatsApp
  whatsapp_conversations: WhatsAppMessage[];
}

export interface DocumentFourni {
  id: string;
  type_document_id: string;
  nom_fichier: string;
  url_fichier: string;
  date_upload: string;
  statut: 'en_attente' | 'valide' | 'invalide';
  commentaire: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: 'incoming' | 'outgoing';
  message: string;
  timestamp: string;
  statut: 'envoye' | 'delivre' | 'lu' | 'echec';
}

export interface CabinetNotarial {
  id: string;
  created_at: string;
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  telephone: string;
  email: string;
  siret: string;
  logo: string | null;
  couleur_primaire: string;
  couleur_secondaire: string;
  whapi_token: string | null;
  whapi_channel_id: string | null;
}

export interface ChatbotConfig {
  id: string;
  projet_id: string;
  enabled: boolean;
  welcome_message: string;
  faq: FAQItem[];
  suggestions: string[];
}

export interface FAQItem {
  question: string;
  reponse: string;
}

export interface ChatMessage {
  id: string;
  projet_id: string;
  candidat_id: string | null;
  session_id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  total_projets: number;
  projets_actifs: number;
  total_candidats: number;
  candidats_nouveaux: number;
  candidats_retenus: number;
  inscriptions_semaine: number;
}

export interface ActivityLog {
  id: string;
  created_at: string;
  type: 'inscription' | 'document_upload' | 'statut_change' | 'message' | 'projet_cree' | 'projet_modifie';
  description: string;
  projet_id: string | null;
  candidat_id: string | null;
  user_id: string;
}
