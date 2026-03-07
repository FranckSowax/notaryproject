import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ProjetImmobilier,
  Candidat,
  CabinetNotarial,
  DashboardStats,
  ActivityLog,
  ChatbotConfig,
  ChatMessage
} from '@/types';

// Hook pour récupérer les projets d'un cabinet
export function useProjets(cabinetId?: string) {
  const [projets, setProjets] = useState<ProjetImmobilier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjets = useCallback(async () => {
    if (!cabinetId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('cabinet_id', cabinetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjets((data as ProjetImmobilier[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => {
    fetchProjets();

    // Souscription temps réel
    const subscription = supabase
      .channel('projets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projets',
          filter: `cabinet_id=eq.${cabinetId}`,
        },
        () => fetchProjets()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [cabinetId, fetchProjets]);

  return { projets, loading, error, refresh: fetchProjets };
}

// Hook pour récupérer un projet par slug (pour landing page)
export function useProjetBySlug(slug: string) {
  const [projet, setProjet] = useState<ProjetImmobilier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjet() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projets')
          .select(`
            *,
            documents_requis (*)
          `)
          .eq('slug', slug)
          .eq('statut', 'actif')
          .single();

        if (error) throw error;
        setProjet(data as ProjetImmobilier);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Projet non trouvé');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchProjet();
  }, [slug]);

  return { projet, loading, error };
}

// Hook pour récupérer les candidats d'un projet ou de tous les projets d'un cabinet
export function useCandidats(projetId?: string, cabinetId?: string | null) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidats = useCallback(async () => {
    if (!projetId) {
      // Récupérer tous les candidats des projets du cabinet
      if (!cabinetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: projets } = await supabase
          .from('projets')
          .select('id')
          .eq('cabinet_id', cabinetId);

        const projetIds = (projets as any[])?.map(p => p.id) || [];

        if (projetIds.length === 0) {
          setCandidats([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('candidats')
          .select('*')
          .in('projet_id', projetIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCandidats((data as Candidat[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidats')
        .select('*')
        .eq('projet_id', projetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidats((data as Candidat[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [projetId, cabinetId]);

  useEffect(() => {
    fetchCandidats();

    const subscription = supabase
      .channel('candidats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidats',
        },
        () => fetchCandidats()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projetId, fetchCandidats]);

  return { candidats, loading, error, refresh: fetchCandidats };
}

// Hook pour les statistiques du dashboard
export function useDashboardStats(cabinetId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    total_projets: 0,
    projets_actifs: 0,
    total_candidats: 0,
    candidats_nouveaux: 0,
    candidats_retenus: 0,
    inscriptions_semaine: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!cabinetId) return;

      try {
        // Total projets
        const { count: totalProjets } = await supabase
          .from('projets')
          .select('*', { count: 'exact', head: true })
          .eq('cabinet_id', cabinetId);

        // Projets actifs
        const { count: projetsActifs } = await supabase
          .from('projets')
          .select('*', { count: 'exact', head: true })
          .eq('cabinet_id', cabinetId)
          .eq('statut', 'actif');

        // Récupérer tous les projets du cabinet
        const { data: projets } = await supabase
          .from('projets')
          .select('id')
          .eq('cabinet_id', cabinetId);

        const projetIds = (projets as any[])?.map(p => p.id) || [];

        if (projetIds.length > 0) {
          // Total candidats
          const { count: totalCandidats } = await supabase
            .from('candidats')
            .select('*', { count: 'exact', head: true })
            .in('projet_id', projetIds);

          // Candidats nouveaux
          const { count: candidatsNouveaux } = await supabase
            .from('candidats')
            .select('*', { count: 'exact', head: true })
            .in('projet_id', projetIds)
            .eq('statut', 'nouveau');

          // Candidats retenus
          const { count: candidatsRetenus } = await supabase
            .from('candidats')
            .select('*', { count: 'exact', head: true })
            .in('projet_id', projetIds)
            .eq('statut', 'retenu');

          // Inscriptions cette semaine
          const debutSemaine = new Date();
          debutSemaine.setDate(debutSemaine.getDate() - 7);

          const { count: inscriptionsSemaine } = await supabase
            .from('candidats')
            .select('*', { count: 'exact', head: true })
            .in('projet_id', projetIds)
            .gte('created_at', debutSemaine.toISOString());

          setStats({
            total_projets: totalProjets || 0,
            projets_actifs: projetsActifs || 0,
            total_candidats: totalCandidats || 0,
            candidats_nouveaux: candidatsNouveaux || 0,
            candidats_retenus: candidatsRetenus || 0,
            inscriptions_semaine: inscriptionsSemaine || 0,
          });
        }
      } catch (err) {
        console.error('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [cabinetId]);

  return { stats, loading };
}

// Hook pour les logs d'activité
export function useActivityLogs(cabinetId?: string, limit = 20) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!cabinetId) return;

      try {
        const { data: projets } = await supabase
          .from('projets')
          .select('id')
          .eq('cabinet_id', cabinetId);

        const projetIds = (projets as any[])?.map(p => p.id) || [];

        if (projetIds.length > 0) {
          const { data } = await supabase
            .from('activity_logs')
            .select('*')
            .in('projet_id', projetIds)
            .order('created_at', { ascending: false })
            .limit(limit);

          setLogs((data as ActivityLog[]) || []);
        }
      } catch (err) {
        console.error('Erreur logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [cabinetId, limit]);

  return { logs, loading };
}

// Hook pour la configuration du chatbot
export function useChatbotConfig(projetId?: string) {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      if (!projetId) return;

      try {
        const { data, error } = await supabase
          .from('chatbot_configs')
          .select('*')
          .eq('projet_id', projetId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setConfig(data as ChatbotConfig);
        } else {
          // Créer une config par défaut
          const { data: newConfig } = await supabase
            .from('chatbot_configs')
            .insert({ projet_id: projetId, enabled: true } as any)
            .select()
            .single();
          setConfig((newConfig as unknown) as ChatbotConfig);
        }
      } catch (err) {
        console.error('Erreur config chatbot:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [projetId]);

  return { config, loading };
}

// Hook pour créer un candidat
export function useCreateCandidat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCandidat = async (candidat: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidats')
        .insert(candidat)
        .select()
        .single();

      if (error) throw error;
      return data as Candidat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création candidat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCandidat, loading, error };
}

// Hook pour mettre à jour le statut d'un candidat
export function useUpdateCandidatStatut() {
  const [loading, setLoading] = useState(false);

  const updateStatut = async (candidatId: string, statut: Candidat['statut']) => {
    try {
      setLoading(true);
      const updateData: Record<string, unknown> = { statut };
      const { error } = await supabase
        .from('candidats')
        .update(updateData as never)
        .eq('id', candidatId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatut, loading };
}

// Hook pour suspendre/réactiver un projet
export function useToggleProjetStatut() {
  const [loading, setLoading] = useState(false);

  const toggleStatut = async (projetId: string, nouveauStatut: ProjetImmobilier['statut']) => {
    try {
      setLoading(true);
      const updateData: Record<string, unknown> = { statut: nouveauStatut };
      const { error } = await supabase
        .from('projets')
        .update(updateData as never)
        .eq('id', projetId)
        .select();

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erreur changement statut projet:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatut, loading };
}

// Hook pour récupérer le cabinet courant
export function useCurrentCabinet(cabinetId: string | null) {
  const [cabinet, setCabinet] = useState<CabinetNotarial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCabinet() {
      if (!cabinetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cabinets')
          .select('*')
          .eq('id', cabinetId)
          .single();

        if (error) throw error;
        setCabinet(data as CabinetNotarial);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du cabinet');
      } finally {
        setLoading(false);
      }
    }

    fetchCabinet();
  }, [cabinetId]);

  return { cabinet, loading, error };
}

// Hook pour les messages (chatbot + whatsapp)
export function useMessages(cabinetId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      if (!cabinetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Récupérer les projets du cabinet
        const { data: projets } = await supabase
          .from('projets')
          .select('id')
          .eq('cabinet_id', cabinetId);

        const projetIds = (projets as any[])?.map(p => p.id) || [];

        if (projetIds.length === 0) {
          setMessages([]);
          setLoading(false);
          return;
        }

        // Récupérer les messages chatbot avec le nom du candidat
        const { data, error } = await supabase
          .from('chatbot_messages')
          .select(`
            *,
            candidats ( nom, prenom )
          `)
          .in('projet_id', projetIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages((data as ChatMessage[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [cabinetId]);

  return { messages, loading, error };
}

// Hook pour mettre à jour les paramètres du cabinet
export function useUpdateCabinetSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = async (cabinetId: string, settings: Partial<CabinetNotarial>) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase
        .from('cabinets')
        .update(settings as never)
        .eq('id', cabinetId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateSettings, loading, error };
}
