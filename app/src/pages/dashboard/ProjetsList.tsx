import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ProjetCard } from '@/components/dashboard/ProjetCard';
import { useProjets, useToggleProjetStatut } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjetImmobilier } from '@/types';

const statutFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'actif', label: 'Actifs' },
  { value: 'suspendu', label: 'Suspendus' },
  { value: 'inactif', label: 'Inactifs' },
  { value: 'termine', label: 'Terminés' },
];

export function ProjetsList() {
  const navigate = useNavigate();
  const { cabinetId } = useAuth();
  const { projets, loading, error, refresh } = useProjets(cabinetId ?? undefined);
  const { toggleStatut } = useToggleProjetStatut();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleToggleStatut = async (id: string, statut: ProjetImmobilier['statut']) => {
    await toggleStatut(id, statut);
  };

  const filteredProjets = projets.filter((projet) => {
    const matchesSearch = 
      projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.ville.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = statutFilter === 'all' || projet.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Projets</h1>
          <p className="text-slate-500 mt-1">
            {projets.length} programme{projets.length > 1 ? 's' : ''} immobilier{projets.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/nouveau-projet')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {statutFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatutFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statutFilter === filter.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement des donnees. Veuillez reessayer.
            <Button variant="outline" size="sm" className="ml-4" onClick={refresh}>
              Reessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des projets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProjets.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProjets.map((projet) => (
            <ProjetCard
              key={projet.id}
              projet={projet}
              onToggleStatut={handleToggleStatut}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">
            {searchTerm || statutFilter !== 'all'
              ? 'Aucun projet ne correspond à vos critères'
              : 'Aucun projet pour le moment'}
          </p>
          {(searchTerm || statutFilter !== 'all') && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setStatutFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
