import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Candidat } from '@/types';

export type EtapeDossier =
  | 'retenu'
  | 'verification_docs'
  | 'montage_dossier'
  | 'validation_juridique'
  | 'rdv_notaire'
  | 'signature'
  | 'cloture';

export interface EtapeInfo {
  etape: EtapeDossier;
  etape_date: string;
}

export const ETAPES_CONFIG: { id: EtapeDossier; label: string; color: string }[] = [
  { id: 'retenu', label: 'Retenu', color: 'bg-blue-500' },
  { id: 'verification_docs', label: 'Verification docs', color: 'bg-amber-500' },
  { id: 'montage_dossier', label: 'Montage dossier', color: 'bg-indigo-500' },
  { id: 'validation_juridique', label: 'Validation juridique', color: 'bg-purple-500' },
  { id: 'rdv_notaire', label: 'RDV Notaire', color: 'bg-orange-500' },
  { id: 'signature', label: 'Signature', color: 'bg-emerald-500' },
  { id: 'cloture', label: 'Cloture', color: 'bg-slate-500' },
];

export function parseNotesEtape(notes: string | null): { etapeInfo: EtapeInfo | null; notesTexte: string } {
  if (!notes) return { etapeInfo: null, notesTexte: '' };
  const pipeIndex = notes.indexOf('|');
  if (pipeIndex === -1) {
    try {
      const parsed = JSON.parse(notes);
      if (parsed?.etape) return { etapeInfo: parsed as EtapeInfo, notesTexte: '' };
    } catch { /* plain text */ }
    return { etapeInfo: null, notesTexte: notes };
  }
  try {
    const parsed = JSON.parse(notes.substring(0, pipeIndex));
    if (parsed?.etape) return { etapeInfo: parsed as EtapeInfo, notesTexte: notes.substring(pipeIndex + 1) };
  } catch { /* malformed */ }
  return { etapeInfo: null, notesTexte: notes };
}

export function serializeNotesEtape(etapeInfo: EtapeInfo, notesTexte: string): string {
  const json = JSON.stringify(etapeInfo);
  return notesTexte ? `${json}|${notesTexte}` : json;
}

export function getCandidatEtape(candidat: Candidat): EtapeDossier {
  return parseNotesEtape(candidat.notes).etapeInfo?.etape || 'retenu';
}

export function getCandidatEtapeDate(candidat: Candidat): string {
  return parseNotesEtape(candidat.notes).etapeInfo?.etape_date || candidat.updated_at || candidat.created_at;
}

export function usePipelineCandidats(projetId?: string) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidats = useCallback(async () => {
    if (!projetId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidats')
        .select('*')
        .eq('projet_id', projetId)
        .eq('statut', 'retenu')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCandidats((data as Candidat[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [projetId]);

  useEffect(() => {
    fetchCandidats();
    const sub = supabase
      .channel(`pipeline_${projetId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidats', filter: `projet_id=eq.${projetId}` }, () => fetchCandidats())
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [projetId, fetchCandidats]);

  return { candidats, loading, error, refresh: fetchCandidats };
}

export function useUpdateEtape() {
  const [loading, setLoading] = useState(false);
  const updateEtape = async (candidat: Candidat, newEtape: EtapeDossier) => {
    try {
      setLoading(true);
      const { notesTexte } = parseNotesEtape(candidat.notes);
      const newNotes = serializeNotesEtape({ etape: newEtape, etape_date: new Date().toISOString().split('T')[0] }, notesTexte);
      const { error } = await supabase.from('candidats').update({ notes: newNotes } as never).eq('id', candidat.id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur mise a jour etape:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { updateEtape, loading };
}

export function useCandidatById(candidatId?: string) {
  const [candidat, setCandidat] = useState<Candidat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidat = useCallback(async () => {
    if (!candidatId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from('candidats').select('*').eq('id', candidatId).single();
      if (error) throw error;
      setCandidat(data as Candidat);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Candidat non trouve');
    } finally {
      setLoading(false);
    }
  }, [candidatId]);

  useEffect(() => { fetchCandidat(); }, [fetchCandidat]);
  return { candidat, loading, error, refresh: fetchCandidat };
}

export function useUpdateCandidatNotes() {
  const [loading, setLoading] = useState(false);
  const updateNotes = async (candidat: Candidat, newNotesTexte: string) => {
    try {
      setLoading(true);
      const { etapeInfo } = parseNotesEtape(candidat.notes);
      const newNotes = etapeInfo ? serializeNotesEtape(etapeInfo, newNotesTexte) : newNotesTexte;
      const { error } = await supabase.from('candidats').update({ notes: newNotes } as never).eq('id', candidat.id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur mise a jour notes:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { updateNotes, loading };
}
