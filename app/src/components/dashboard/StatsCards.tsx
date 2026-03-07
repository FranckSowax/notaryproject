import { 
  FolderOpen, 
  Users, 
  UserCheck, 
  TrendingUp
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Projets Actifs',
      value: stats.projets_actifs,
      total: stats.total_projets,
      icon: FolderOpen,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Candidats',
      value: stats.total_candidats,
      icon: Users,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Candidats Retenus',
      value: stats.candidats_retenus,
      icon: UserCheck,
      color: 'bg-violet-500',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Nouveaux (7j)',
      value: stats.inscriptions_semaine,
      icon: TrendingUp,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4" />
            <div className="h-8 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className={`${card.lightColor} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
            {card.total !== undefined && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                sur {card.total}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
