-- =============================================
-- FIX PPEO : colonnes manquantes + storage + RLS
-- A executer dans Supabase > SQL Editor
-- =============================================

-- 1. Ajouter les colonnes manquantes sur la table candidats
ALTER TABLE candidats ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE candidats ADD COLUMN IF NOT EXISTS whatsapp_conversations JSONB DEFAULT '[]'::jsonb;

-- 2. Creer le bucket storage "candidats" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidats', 'candidats', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Politique storage : upload public (landing pages)
CREATE POLICY "candidats_storage_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'candidats');

-- 4. Politique storage : lecture publique
CREATE POLICY "candidats_storage_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'candidats');

-- 5. Notifier PostgREST de recharger le schema (pour voir les nouvelles colonnes)
NOTIFY pgrst, 'reload schema';
