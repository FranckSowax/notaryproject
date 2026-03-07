import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Users,
  PlusCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProjetCard } from '@/components/dashboard/ProjetCard';
import { useProjets, useDashboardStats, useActivityLogs, useToggleProjetStatut } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjetImmobilier } from '@/types';
import { AlertCircle } from 'lucide-react';

export function DashboardHome() {
  const navigate = useNavigate();
  const { cabinetId } = useAuth();
  const { projets, loading: projetsLoading, error: projetsError, refresh: refreshProjets } = useProjets(cabinetId ?? undefined);
  const { stats, loading: statsLoading } = useDashboardStats(cabinetId ?? undefined);
  const { logs, loading: logsLoading } = useActivityLogs(cabinetId ?? undefined, 10);
  const { toggleStatut } = useToggleProjetStatut();

  const handleToggleStatut = async (id: string, statut: ProjetImmobilier['statut']) => {
    await toggleStatut(id, statut);
  };

  const recentProjets = projets.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Bienvenue sur votre espace de gestion immobilière
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/nouveau-projet')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Erreur */}
      {projetsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement des donnees. Veuillez reessayer.
            <Button variant="outline" size="sm" className="ml-4" onClick={refreshProjets}>
              Reessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projets récents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Projets récents</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projets')}>
              Voir tous
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {projetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentProjets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentProjets.map((projet) => (
                <ProjetCard
                  key={projet.id}
                  projet={projet}
                  onToggleStatut={handleToggleStatut}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Aucun projet pour le moment
              </h3>
              <p className="text-slate-500 mb-4">
                Créez votre premier programme immobilier pour commencer
              </p>
              <Button onClick={() => navigate('/dashboard/nouveau-projet')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div>
          <ActivityFeed logs={logs} loading={logsLoading} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard/nouveau-projet')}
            className="flex items-center gap-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Nouveau projet</p>
              <p className="text-sm text-slate-400">Créer un programme immobilier</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/candidats')}
            className="flex items-center gap-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Gérer les candidats</p>
              <p className="text-sm text-slate-400">Voir et traiter les dossiers</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/projets')}
            className="flex items-center gap-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-violet-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">Statistiques</p>
              <p className="text-sm text-slate-400">Analyser les performances</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
