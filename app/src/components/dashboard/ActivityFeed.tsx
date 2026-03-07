import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  UserPlus, 
  FileUp, 
  CheckCircle, 
  MessageSquare, 
  FolderPlus,
  Edit3
} from 'lucide-react';
import type { ActivityLog } from '@/types';

interface ActivityFeedProps {
  logs: ActivityLog[];
  loading?: boolean;
}

const activityIcons = {
  inscription: UserPlus,
  document_upload: FileUp,
  statut_change: CheckCircle,
  message: MessageSquare,
  projet_cree: FolderPlus,
  projet_modifie: Edit3,
};

const activityColors = {
  inscription: 'bg-emerald-100 text-emerald-600',
  document_upload: 'bg-blue-100 text-blue-600',
  statut_change: 'bg-violet-100 text-violet-600',
  message: 'bg-amber-100 text-amber-600',
  projet_cree: 'bg-cyan-100 text-cyan-600',
  projet_modifie: 'bg-slate-100 text-slate-600',
};

export function ActivityFeed({ logs, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Activité récente</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Activité récente</h3>
        <p className="text-slate-500 text-center py-8">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Activité récente</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {logs.map((log) => {
          const Icon = activityIcons[log.type] || Edit3;
          const colorClass = activityColors[log.type] || 'bg-slate-100 text-slate-600';

          return (
            <div key={log.id} className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">{log.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true,
                    locale: fr 
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
