import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface RendezVous {
  id: string;
  created_at: string;
  type: string;
  description: string;
  projet_id: string | null;
  candidat_id: string | null;
  metadata: {
    date_rdv: string;
    heure: string;
    type_rdv: 'verification' | 'signature' | 'remise_cles' | 'autre';
    candidat_nom: string;
    notes: string;
    statut: 'planifie' | 'confirme' | 'annule' | 'termine';
  };
}

export interface NoteInterne {
  id: string;
  created_at: string;
  description: string;
  projet_id: string | null;
  candidat_id: string | null;
  metadata: { auteur: string };
}

export function useRendezVous(cabinetId: string | null, mois: Date) {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRdvs = useCallback(async () => {
    if (!cabinetId) return;
    try {
      setLoading(true);
      const { data: projets } = await supabase.from('projets').select('id').eq('cabinet_id', cabinetId);
      const projetIds = (projets as any[])?.map(p => p.id) || [];
      if (projetIds.length === 0) { setRdvs([]); setLoading(false); return; }

      const debut = format(startOfMonth(mois), 'yyyy-MM-dd');
      const fin = format(endOfMonth(mois), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('activity_logs').select('*').eq('type', 'rendez_vous').in('projet_id', projetIds)
        .gte('metadata->>date_rdv', debut).lte('metadata->>date_rdv', fin)
        .order('created_at', { ascending: true });
      setRdvs((data as RendezVous[]) || []);
    } catch (err) {
      console.error('Erreur RDV:', err);
    } finally {
      setLoading(false);
    }
  }, [cabinetId, mois]);

  useEffect(() => { fetchRdvs(); }, [fetchRdvs]);
  return { rdvs, loading, refresh: fetchRdvs };
}

export function useCreateRendezVous() {
  const [loading, setLoading] = useState(false);
  const createRdv = async (params: {
    projetId: string; candidatId: string; candidatNom: string;
    typeRdv: RendezVous['metadata']['type_rdv']; dateRdv: string; heure: string; notes: string; description: string;
  }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('activity_logs').insert({
        type: 'rendez_vous', description: params.description,
        projet_id: params.projetId, candidat_id: params.candidatId,
        metadata: { date_rdv: params.dateRdv, heure: params.heure, type_rdv: params.typeRdv, candidat_nom: params.candidatNom, notes: params.notes, statut: 'planifie' },
      } as any).select().single();
      if (error) throw error;
      return data as RendezVous;
    } catch (err) {
      console.error('Erreur creation RDV:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  return { createRdv, loading };
}

export function useNotesInternes(candidatId: string, projetId: string) {
  const [notes, setNotes] = useState<NoteInterne[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!candidatId) return;
    try {
      setLoading(true);
      const { data } = await supabase.from('activity_logs').select('*')
        .eq('type', 'note_interne').eq('candidat_id', candidatId).eq('projet_id', projetId)
        .order('created_at', { ascending: true });
      setNotes((data as NoteInterne[]) || []);
    } catch (err) {
      console.error('Erreur notes:', err);
    } finally {
      setLoading(false);
    }
  }, [candidatId, projetId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  return { notes, loading, refresh: fetchNotes };
}

export function useAddNote() {
  const [loading, setLoading] = useState(false);
  const addNote = async (params: { candidatId: string; projetId: string; contenu: string; auteur: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('activity_logs').insert({
        type: 'note_interne', description: params.contenu,
        candidat_id: params.candidatId, projet_id: params.projetId,
        metadata: { auteur: params.auteur },
      } as any);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur note:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return { addNote, loading };
}
