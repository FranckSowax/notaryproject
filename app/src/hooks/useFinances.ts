import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Candidat } from '@/types';

export interface Echeance {
  montant: number;
  date: string;
  reference: string;
}

export interface FinanceData {
  statut: 'en_attente' | 'partiellement_paye' | 'solde';
  montant_verse: number;
  echeances: Echeance[];
}

export interface CandidatFinance {
  candidat: Candidat;
  finance: FinanceData;
  parcelle: string;
}

const DEFAULT_FINANCE: FinanceData = { statut: 'en_attente', montant_verse: 0, echeances: [] };

export function parseFinanceData(notes: string | null): FinanceData {
  if (!notes) return DEFAULT_FINANCE;
  // Try to find paiement data in notes JSON prefix
  const pipeIndex = notes.indexOf('|');
  const jsonStr = pipeIndex >= 0 ? notes.substring(0, pipeIndex) : notes;
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed?.paiement) return parsed.paiement as FinanceData;
  } catch { /* not JSON */ }
  return DEFAULT_FINANCE;
}

export function parseParcelle(notes: string | null): string {
  if (!notes) return '';
  // Try to extract "Produit choisi:" from notes text
  const pipeIndex = notes.indexOf('|');
  const textPart = pipeIndex >= 0 ? notes.substring(pipeIndex + 1) : notes;
  const match = textPart.match(/Produit choisi\s*:\s*(.+?)(?:\n|$)/i);
  return match ? match[1].trim() : '';
}

export function updateFinanceInNotes(notes: string | null, finance: FinanceData): string {
  const pipeIndex = notes?.indexOf('|') ?? -1;
  let jsonObj: Record<string, unknown> = {};
  let textPart = '';

  if (notes && pipeIndex >= 0) {
    try { jsonObj = JSON.parse(notes.substring(0, pipeIndex)); } catch { /* */ }
    textPart = notes.substring(pipeIndex + 1);
  } else if (notes) {
    try { jsonObj = JSON.parse(notes); } catch { textPart = notes; }
  }

  jsonObj.paiement = finance;
  const json = JSON.stringify(jsonObj);
  return textPart ? `${json}|${textPart}` : json;
}

export function useFinanceCandidats(projetId?: string) {
  const [data, setData] = useState<CandidatFinance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projetId) return;
    try {
      setLoading(true);
      const { data: candidats, error } = await supabase
        .from('candidats').select('*').eq('projet_id', projetId).eq('statut', 'retenu').order('nom');
      if (error) throw error;
      const result = ((candidats as Candidat[]) || []).map(c => ({
        candidat: c,
        finance: parseFinanceData(c.notes),
        parcelle: parseParcelle(c.notes),
      }));
      setData(result);
    } catch (err) {
      console.error('Erreur finances:', err);
    } finally {
      setLoading(false);
    }
  }, [projetId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useEnregistrerPaiement() {
  const [loading, setLoading] = useState(false);

  const enregistrer = async (candidat: Candidat, echeance: Echeance) => {
    try {
      setLoading(true);
      const finance = parseFinanceData(candidat.notes);
      finance.echeances.push(echeance);
      finance.montant_verse += echeance.montant;
      // Auto-detect statut
      finance.statut = finance.montant_verse > 0 ? 'partiellement_paye' : 'en_attente';
      const newNotes = updateFinanceInNotes(candidat.notes, finance);
      const { error } = await supabase.from('candidats').update({ notes: newNotes } as never).eq('id', candidat.id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur paiement:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const marquerSolde = async (candidat: Candidat) => {
    try {
      setLoading(true);
      const finance = parseFinanceData(candidat.notes);
      finance.statut = 'solde';
      const newNotes = updateFinanceInNotes(candidat.notes, finance);
      const { error } = await supabase.from('candidats').update({ notes: newNotes } as never).eq('id', candidat.id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { enregistrer, marquerSolde, loading };
}
