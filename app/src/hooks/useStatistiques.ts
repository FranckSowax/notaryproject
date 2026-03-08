import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Candidat, ProjetImmobilier } from '@/types';

export interface StatistiquesAvancees {
  projetsActifs: number;
  totalCandidats: number;
  tauxConversion: number;
  delaiMoyenTraitement: number;
  candidatsParStatut: Record<string, number>;
  inscriptionsParSemaine: { semaine: string; count: number }[];
  dossiersAlerte: { id: string; nom: string; prenom: string; projet_titre: string; statut: string; updated_at: string; jours_inactivite: number }[];
  repartitionParProjet: { titre: string; count: number }[];
}

export function useStatistiques(cabinetId?: string) {
  const [stats, setStats] = useState<StatistiquesAvancees | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!cabinetId) return;
    try {
      setLoading(true);
      const { data: projets } = await supabase.from('projets').select('id, titre, statut').eq('cabinet_id', cabinetId);
      const projetsList = (projets as Pick<ProjetImmobilier, 'id' | 'titre' | 'statut'>[]) || [];
      const projetIds = projetsList.map(p => p.id);
      const projetsActifs = projetsList.filter(p => p.statut === 'actif').length;

      if (projetIds.length === 0) {
        setStats({ projetsActifs: 0, totalCandidats: 0, tauxConversion: 0, delaiMoyenTraitement: 0, candidatsParStatut: {}, inscriptionsParSemaine: [], dossiersAlerte: [], repartitionParProjet: [] });
        setLoading(false); return;
      }

      const { data: candidats } = await supabase.from('candidats').select('id, nom, prenom, statut, projet_id, created_at, updated_at').in('projet_id', projetIds);
      const all = (candidats as Pick<Candidat, 'id' | 'nom' | 'prenom' | 'statut' | 'projet_id' | 'created_at' | 'updated_at'>[]) || [];

      const parStatut: Record<string, number> = { nouveau: 0, en_cours: 0, retenu: 0, refuse: 0, desiste: 0 };
      all.forEach(c => { if (c.statut in parStatut) parStatut[c.statut]++; });

      const tauxConversion = all.length > 0 ? Math.round((parStatut.retenu / all.length) * 100) : 0;

      const retenus = all.filter(c => c.statut === 'retenu');
      let delai = 0;
      if (retenus.length > 0) {
        delai = Math.round(retenus.reduce((s, c) => s + (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / 86400000, 0) / retenus.length);
      }

      const now = new Date();
      const semaines: { semaine: string; count: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const debut = new Date(now); debut.setDate(now.getDate() - (i + 1) * 7);
        const fin = new Date(now); fin.setDate(now.getDate() - i * 7);
        semaines.push({ semaine: i === 0 ? 'Cette sem.' : `S-${i}`, count: all.filter(c => { const d = new Date(c.created_at); return d >= debut && d < fin; }).length });
      }

      const projetMap = new Map(projetsList.map(p => [p.id, p.titre]));
      const alertes = retenus
        .map(c => ({ id: c.id, nom: c.nom, prenom: c.prenom, projet_titre: projetMap.get(c.projet_id) || '', statut: c.statut, updated_at: c.updated_at, jours_inactivite: Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / 86400000) }))
        .filter(d => d.jours_inactivite > 7)
        .sort((a, b) => b.jours_inactivite - a.jours_inactivite);

      const repartition = projetsList.map(p => ({ titre: p.titre, count: all.filter(c => c.projet_id === p.id).length })).filter(r => r.count > 0);

      setStats({ projetsActifs, totalCandidats: all.length, tauxConversion, delaiMoyenTraitement: delai, candidatsParStatut: parStatut, inscriptionsParSemaine: semaines, dossiersAlerte: alertes, repartitionParProjet: repartition });
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, loading, refresh: fetchStats };
}

export function generateCSV(stats: StatistiquesAvancees): string {
  const l: string[] = ['Statistiques PPEO', '',
    '--- KPI ---', `Projets actifs;${stats.projetsActifs}`, `Total candidats;${stats.totalCandidats}`, `Taux conversion;${stats.tauxConversion}%`, `Delai moyen (j);${stats.delaiMoyenTraitement}`, '',
    '--- Par statut ---', 'Statut;Nombre'];
  Object.entries(stats.candidatsParStatut).forEach(([k, v]) => l.push(`${k};${v}`));
  l.push('', '--- Inscriptions/semaine ---', 'Semaine;Nombre');
  stats.inscriptionsParSemaine.forEach(s => l.push(`${s.semaine};${s.count}`));
  l.push('', '--- Alertes ---', 'Nom;Prenom;Projet;Jours inactivite');
  stats.dossiersAlerte.forEach(d => l.push(`${d.nom};${d.prenom};${d.projet_titre};${d.jours_inactivite}`));
  return l.join('\n');
}
