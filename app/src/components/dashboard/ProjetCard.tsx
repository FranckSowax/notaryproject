import { Link } from 'react-router-dom';
import {
  MapPin,
  Banknote,
  Maximize,
  BedDouble,
  Users,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Edit,
  ExternalLink,
  Kanban,
  Wallet,
  FileText,
} from 'lucide-react';
import { formatFCFA } from '@/lib/formatCurrency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { ProjetImmobilier } from '@/types';

interface ProjetCardProps {
  projet: ProjetImmobilier;
  onToggleStatut: (id: string, statut: ProjetImmobilier['statut']) => void;
}

const statutLabels = {
  actif: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactif: { label: 'Inactif', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  suspendu: { label: 'Suspendu', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  termine: { label: 'Terminé', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

// Type de bien labels (pour usage futur)
// const typeBienLabels = {
//   appartement: 'Appartement',
//   maison: 'Maison',
//   villa: 'Villa',
//   commerce: 'Commerce',
//   terrain: 'Terrain',
//   autre: 'Autre',
// };

export function ProjetCard({ projet, onToggleStatut }: ProjetCardProps) {
  const statut = statutLabels[projet.statut];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        {projet.banner_image ? (
          <img
            src={projet.banner_image}
            alt={projet.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400">Aucune image</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={statut.color}>
            {statut.label}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projets/${projet.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/p/${projet.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir la page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projets/${projet.id}/pipeline`}>
                  <Kanban className="w-4 h-4 mr-2" />
                  Pipeline
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projets/${projet.id}/finances`}>
                  <Wallet className="w-4 h-4 mr-2" />
                  Finances
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projets/${projet.id}/documents`}>
                  <FileText className="w-4 h-4 mr-2" />
                  Documents
                </Link>
              </DropdownMenuItem>
              {projet.statut === 'actif' ? (
                <DropdownMenuItem onClick={() => onToggleStatut(projet.id, 'suspendu')}>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Suspendre
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onToggleStatut(projet.id, 'actif')}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Réactiver
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{projet.titre}</h3>
        </div>

        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {projet.quartier ? `${projet.quartier}, ` : ''}{projet.ville}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Banknote className="w-4 h-4 mx-auto mb-1 text-slate-400" />
            <p className="text-sm font-semibold text-slate-900">
              {projet.prix ? formatFCFA(projet.prix) : '—'}
            </p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Maximize className="w-4 h-4 mx-auto mb-1 text-slate-400" />
            <p className="text-sm font-semibold text-slate-900">{projet.surface} m²</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <BedDouble className="w-4 h-4 mx-auto mb-1 text-slate-400" />
            <p className="text-sm font-semibold text-slate-900">{projet.nb_pieces} pièces</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>{projet.nombre_inscriptions} candidats</span>
          </div>
          <Link
            to={`/dashboard/projets/${projet.id}/candidats`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir les candidats
          </Link>
        </div>

        {/* Quick access buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 mt-3">
          <Link
            to={`/dashboard/projets/${projet.id}/pipeline`}
            className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pipeline</span>
          </Link>
          <Link
            to={`/dashboard/projets/${projet.id}/finances`}
            className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finances</span>
          </Link>
          <Link
            to={`/dashboard/projets/${projet.id}/documents`}
            className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Documents</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
