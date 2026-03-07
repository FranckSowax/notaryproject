-- Schema de base de données pour NotarialPro
-- Plateforme SaaS pour offices notariaux - Gestion des programmes immobiliers

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table des cabinets notariaux
CREATE TABLE cabinets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    telephone VARCHAR(20),
    email VARCHAR(255),
    siret VARCHAR(14) UNIQUE,
    logo TEXT,
    couleur_primaire VARCHAR(7) DEFAULT '#1e40af',
    couleur_secondaire VARCHAR(7) DEFAULT '#3b82f6',
    whapi_token TEXT,
    whapi_channel_id TEXT,
    actif BOOLEAN DEFAULT true
);

-- Table des utilisateurs (notaires collaborateurs)
CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cabinet_id UUID REFERENCES cabinets(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'collaborateur', -- 'admin', 'notaire', 'collaborateur', 'secretaire'
    telephone VARCHAR(20),
    actif BOOLEAN DEFAULT true,
    derniere_connexion TIMESTAMPTZ
);

-- Table des projets immobiliers
CREATE TABLE projets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cabinet_id UUID REFERENCES cabinets(id) ON DELETE CASCADE,
    created_by UUID REFERENCES utilisateurs(id),
    
    -- Informations de base
    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Localisation
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    
    -- Caractéristiques du bien
    type_bien VARCHAR(50), -- 'appartement', 'maison', 'villa', 'commerce', 'terrain', 'autre'
    prix DECIMAL(12,2),
    surface DECIMAL(8,2),
    nb_pieces INTEGER,
    nb_chambres INTEGER,
    
    -- Statut
    statut VARCHAR(50) DEFAULT 'actif', -- 'actif', 'inactif', 'suspendu', 'termine'
    date_ouverture DATE,
    date_cloture DATE,
    
    -- Médias
    banner_image TEXT,
    images JSONB DEFAULT '[]',
    
    -- Contact
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Compteurs
    nombre_inscriptions INTEGER DEFAULT 0,
    nombre_retenus INTEGER DEFAULT 0,
    
    -- Conditions d'éligibilité
    conditions_eligibilite JSONB DEFAULT '[]'
);

-- Table des documents requis par projet
CREATE TABLE documents_requis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    obligatoire BOOLEAN DEFAULT true,
    type_fichier JSONB DEFAULT '["pdf", "jpg", "png"]',
    taille_max INTEGER DEFAULT 10485760 -- 10MB en octets
);

-- Table des candidats
CREATE TABLE candidats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
    
    -- Statut
    statut VARCHAR(50) DEFAULT 'nouveau', -- 'nouveau', 'en_cours', 'retenu', 'refuse', 'desiste'
    
    -- Informations personnelles
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(255),
    nationalite VARCHAR(100),
    situation_familiale VARCHAR(50), -- 'celibataire', 'marie', 'pacse', 'divorce', 'veuf'
    
    -- Adresse
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    
    -- Situation professionnelle
    profession VARCHAR(100),
    employeur VARCHAR(255),
    revenus_mensuels DECIMAL(10,2),
    type_contrat VARCHAR(50), -- 'cdi', 'cdd', 'interim', 'freelance', 'entrepreneur', 'retraite', 'autre'
    anciennete_emploi VARCHAR(50),
    
    -- Situation financière
    apport_personnel DECIMAL(12,2),
    montant_pret_sollicite DECIMAL(12,2),
    duree_pret INTEGER, -- en mois
    banque_actuelle VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Score (pour le classement)
    score DECIMAL(5,2),
    
    -- Index pour recherche
    search_vector TSVECTOR
);

-- Table des documents fournis par les candidats
CREATE TABLE documents_fournis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    candidat_id UUID REFERENCES candidats(id) ON DELETE CASCADE,
    document_requis_id UUID REFERENCES documents_requis(id),
    nom_fichier VARCHAR(255),
    url_fichier TEXT NOT NULL,
    date_upload TIMESTAMPTZ DEFAULT NOW(),
    statut VARCHAR(50) DEFAULT 'en_attente', -- 'en_attente', 'valide', 'invalide'
    commentaire TEXT
);

-- Table des conversations WhatsApp
CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    candidat_id UUID REFERENCES candidats(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL, -- 'incoming', 'outgoing'
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'envoye', -- 'envoye', 'delivre', 'lu', 'echec'
    whapi_message_id VARCHAR(255)
);

-- Table de configuration du chatbot par projet
CREATE TABLE chatbot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    welcome_message TEXT DEFAULT 'Bonjour ! Je suis là pour vous aider avec votre candidature. Comment puis-je vous assister ?',
    faq JSONB DEFAULT '[]',
    suggestions JSONB DEFAULT '["Quels sont les documents requis ?", "Quel est le délai de traitement ?", "Comment contacter le cabinet ?"]'
);

-- Table des messages du chatbot
CREATE TABLE chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
    candidat_id UUID REFERENCES candidats(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    message TEXT NOT NULL,
    ip_address INET
);

-- Table des logs d'activité
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type VARCHAR(50) NOT NULL, -- 'inscription', 'document_upload', 'statut_change', 'message', 'projet_cree', 'projet_modifie'
    description TEXT NOT NULL,
    projet_id UUID REFERENCES projets(id) ON DELETE SET NULL,
    candidat_id UUID REFERENCES candidats(id) ON DELETE SET NULL,
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'
);

-- Table des paramètres de l'application
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_projets_cabinet ON projets(cabinet_id);
CREATE INDEX idx_projets_statut ON projets(statut);
CREATE INDEX idx_projets_slug ON projets(slug);
CREATE INDEX idx_candidats_projet ON candidats(projet_id);
CREATE INDEX idx_candidats_statut ON candidats(statut);
CREATE INDEX idx_candidats_email ON candidats(email);
CREATE INDEX idx_candidats_search ON candidats USING GIN(search_vector);
CREATE INDEX idx_documents_candidat ON documents_fournis(candidat_id);
CREATE INDEX idx_whatsapp_candidat ON whatsapp_conversations(candidat_id);
CREATE INDEX idx_chatbot_messages_session ON chatbot_messages(session_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_projet ON activity_logs(projet_id);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_cabinets_updated_at BEFORE UPDATE ON cabinets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_utilisateurs_updated_at BEFORE UPDATE ON utilisateurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON projets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidats_updated_at BEFORE UPDATE ON candidats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_fournis_updated_at BEFORE UPDATE ON documents_fournis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_configs_updated_at BEFORE UPDATE ON chatbot_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour le compteur d'inscriptions
CREATE OR REPLACE FUNCTION update_projet_inscriptions()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projets SET nombre_inscriptions = nombre_inscriptions + 1 WHERE id = NEW.projet_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projets SET nombre_inscriptions = nombre_inscriptions - 1 WHERE id = OLD.projet_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_inscriptions
    AFTER INSERT OR DELETE ON candidats
    FOR EACH ROW EXECUTE FUNCTION update_projet_inscriptions();

-- Fonction pour mettre à jour le search_vector des candidats
CREATE OR REPLACE FUNCTION update_candidat_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('french', COALESCE(NEW.nom, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.prenom, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.email, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(NEW.ville, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_search_vector
    BEFORE INSERT OR UPDATE ON candidats
    FOR EACH ROW EXECUTE FUNCTION update_candidat_search_vector();

-- Fonction pour logger les activités
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'candidats' THEN
        INSERT INTO activity_logs (type, description, projet_id, candidat_id, metadata)
        VALUES ('inscription', 'Nouveau candidat: ' || NEW.prenom || ' ' || NEW.nom, NEW.projet_id, NEW.id, 
                jsonb_build_object('email', NEW.email, 'telephone', NEW.telephone));
    ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'candidats' AND OLD.statut != NEW.statut THEN
        INSERT INTO activity_logs (type, description, projet_id, candidat_id, metadata)
        VALUES ('statut_change', 'Statut changé de ' || OLD.statut || ' à ' || NEW.statut, NEW.projet_id, NEW.id,
                jsonb_build_object('ancien_statut', OLD.statut, 'nouveau_statut', NEW.statut));
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_candidat_activity
    AFTER INSERT OR UPDATE ON candidats
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

ALTER TABLE cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_requis ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidats ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_fournis ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour eviter la recursion RLS (SECURITY DEFINER contourne les policies)
CREATE OR REPLACE FUNCTION get_user_cabinet_id(user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT cabinet_id FROM utilisateurs WHERE id = user_id;
$$;

-- Politiques pour les cabinets
CREATE POLICY cabinets_select ON cabinets
    FOR SELECT USING (id = get_user_cabinet_id(auth.uid()));

-- Politiques pour les utilisateurs (lecture de son propre profil + collegues du cabinet)
CREATE POLICY utilisateurs_select_own ON utilisateurs
    FOR SELECT USING (id = auth.uid());

CREATE POLICY utilisateurs_cabinet_read ON utilisateurs
    FOR SELECT USING (cabinet_id = get_user_cabinet_id(auth.uid()));

-- Politiques pour les projets
CREATE POLICY projets_cabinet_all ON projets
    FOR ALL USING (cabinet_id = get_user_cabinet_id(auth.uid()));

-- Politiques pour les candidats (lecture publique pour les landing pages)
CREATE POLICY candidats_insert_policy ON candidats
    FOR INSERT WITH CHECK (true);

CREATE POLICY candidats_select_policy ON candidats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u
            JOIN projets p ON p.cabinet_id = u.cabinet_id
            WHERE u.id = auth.uid() AND p.id = candidats.projet_id
        )
    );

CREATE POLICY candidats_update_policy ON candidats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u
            JOIN projets p ON p.cabinet_id = u.cabinet_id
            WHERE u.id = auth.uid() AND p.id = candidats.projet_id
        )
    );

-- Projets: lecture publique pour les projets actifs (landing pages)
CREATE POLICY "projets_public_read" ON projets
  FOR SELECT USING (statut = 'actif');

-- Documents requis: lecture publique via projets actifs
CREATE POLICY "documents_requis_public_read" ON documents_requis
  FOR SELECT USING (projet_id IN (
    SELECT id FROM projets WHERE statut = 'actif'
  ));

-- Documents requis: gestion pour les utilisateurs du cabinet
CREATE POLICY "documents_requis_cabinet_all" ON documents_requis
  FOR ALL USING (projet_id IN (
    SELECT id FROM projets WHERE cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- Documents fournis: insertion publique (depuis les landing pages)
CREATE POLICY "documents_fournis_public_insert" ON documents_fournis
  FOR INSERT WITH CHECK (true);

-- Documents fournis: lecture/modification pour le cabinet
CREATE POLICY "documents_fournis_cabinet_read" ON documents_fournis
  FOR SELECT USING (candidat_id IN (
    SELECT c.id FROM candidats c
    JOIN projets p ON p.id = c.projet_id
    WHERE p.cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- Documents fournis: mise à jour pour le cabinet
CREATE POLICY "documents_fournis_cabinet_update" ON documents_fournis
  FOR UPDATE USING (candidat_id IN (
    SELECT c.id FROM candidats c
    JOIN projets p ON p.id = c.projet_id
    WHERE p.cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- WhatsApp conversations: lecture pour le cabinet
CREATE POLICY "whatsapp_conversations_cabinet_read" ON whatsapp_conversations
  FOR SELECT USING (candidat_id IN (
    SELECT c.id FROM candidats c
    JOIN projets p ON p.id = c.projet_id
    WHERE p.cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- WhatsApp conversations: insertion pour le cabinet
CREATE POLICY "whatsapp_conversations_cabinet_insert" ON whatsapp_conversations
  FOR INSERT WITH CHECK (candidat_id IN (
    SELECT c.id FROM candidats c
    JOIN projets p ON p.id = c.projet_id
    WHERE p.cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- Chatbot configs: gestion pour les utilisateurs du cabinet
CREATE POLICY "chatbot_configs_cabinet_all" ON chatbot_configs
  FOR ALL USING (projet_id IN (
    SELECT id FROM projets WHERE cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- Chatbot configs: lecture publique pour les projets actifs (widget chatbot)
CREATE POLICY "chatbot_configs_public_read" ON chatbot_configs
  FOR SELECT USING (projet_id IN (
    SELECT id FROM projets WHERE statut = 'actif'
  ));

-- Chatbot messages: insertion publique (depuis le chatbot des landing pages)
CREATE POLICY "chatbot_messages_public_insert" ON chatbot_messages
  FOR INSERT WITH CHECK (true);

-- Chatbot messages: lecture pour le cabinet
CREATE POLICY "chatbot_messages_cabinet_read" ON chatbot_messages
  FOR SELECT USING (projet_id IN (
    SELECT id FROM projets WHERE cabinet_id IN (
      SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
    )
  ));

-- Activity logs: lecture pour le cabinet uniquement
CREATE POLICY "activity_logs_cabinet_read" ON activity_logs
  FOR SELECT USING (
    projet_id IN (
      SELECT id FROM projets WHERE cabinet_id IN (
        SELECT cabinet_id FROM utilisateurs WHERE id = auth.uid()
      )
    )
  );

-- Activity logs: insertion automatique (via triggers, donc service role)
CREATE POLICY "activity_logs_insert" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

INSERT INTO app_settings (key, value, description) VALUES
('app_name', 'NotarialPro', 'Nom de l''application'),
('app_version', '1.0.0', 'Version de l''application'),
('max_file_size', '10485760', 'Taille maximale des fichiers en octets (10MB)'),
('allowed_file_types', '["pdf","jpg","jpeg","png","doc","docx"]', 'Types de fichiers autorises'),
('whatsapp_enabled', 'false', 'Activation de l''integration WhatsApp'),
('chatbot_enabled', 'true', 'Activation du chatbot par defaut');

-- ============================================
-- VUES POUR LE DASHBOARD
-- ============================================

-- Vue des statistiques par projet
CREATE VIEW vue_stats_projets AS
SELECT 
    p.id as projet_id,
    p.titre,
    p.statut,
    COUNT(c.id) as total_candidats,
    COUNT(CASE WHEN c.statut = 'nouveau' THEN 1 END) as nouveaux_candidats,
    COUNT(CASE WHEN c.statut = 'en_cours' THEN 1 END) as candidats_en_cours,
    COUNT(CASE WHEN c.statut = 'retenu' THEN 1 END) as candidats_retenus,
    COUNT(CASE WHEN c.statut = 'refuse' THEN 1 END) as candidats_refuses,
    COUNT(CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as inscriptions_7jours
FROM projets p
LEFT JOIN candidats c ON c.projet_id = p.id
GROUP BY p.id, p.titre, p.statut;

-- Vue des activités récentes
CREATE VIEW vue_activites_recentes AS
SELECT 
    al.*,
    p.titre as projet_titre,
    c.nom as candidat_nom,
    c.prenom as candidat_prenom
FROM activity_logs al
LEFT JOIN projets p ON p.id = al.projet_id
LEFT JOIN candidats c ON c.id = al.candidat_id
ORDER BY al.created_at DESC
LIMIT 100;
