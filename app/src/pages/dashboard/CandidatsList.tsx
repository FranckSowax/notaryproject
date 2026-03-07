import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CandidatRow } from '@/components/dashboard/CandidatRow';
import { useProjets, useCandidats, useUpdateCandidatStatut } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Candidat } from '@/types';

const statutFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'nouveau', label: 'Nouveaux' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'retenu', label: 'Retenus' },
  { value: 'refuse', label: 'Refusés' },
  { value: 'desiste', label: 'Désistés' },
];

export function CandidatsList() {
  const { cabinetId } = useAuth();
  const { projets } = useProjets(cabinetId ?? undefined);
  const [selectedProjet, setSelectedProjet] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('all');
  
  // Récupérer les candidats du projet sélectionné ou de tous les projets du cabinet
  const { candidats, loading, error, refresh } = useCandidats(
    selectedProjet !== 'all' ? selectedProjet : undefined,
    cabinetId
  );
  const { updateStatut } = useUpdateCandidatStatut();

  const handleUpdateStatut = async (id: string, statut: Candidat['statut']) => {
    await updateStatut(id, statut);
    refresh();
  };

  const handleSendWhatsApp = (telephone: string, message: string) => {
    // Ouvrir WhatsApp Web avec le numéro
    const whatsappUrl = `https://wa.me/${telephone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredCandidats = candidats.filter((candidat) => {
    const matchesSearch = 
      candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = statutFilter === 'all' || candidat.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const exportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Profession', 'Revenus', 'Date inscription'];
    const rows = filteredCandidats.map(c => [
      c.nom,
      c.prenom,
      c.email,
      c.telephone,
      c.statut,
      c.profession,
      c.revenus_mensuels,
      new Date(c.created_at).toLocaleDateString('fr-FR'),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidats_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidats</h1>
          <p className="text-slate-500 mt-1">
            {candidats.length} candidat{candidats.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedProjet}
          onChange={(e) => setSelectedProjet(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les projets</option>
          {projets.map((projet) => (
            <option key={projet.id} value={projet.id}>
              {projet.titre}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
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

      {/* Table des candidats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Profession
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredCandidats.length > 0 ? (
                filteredCandidats.map((candidat) => (
                  <CandidatRow
                    key={candidat.id}
                    candidat={candidat}
                    onUpdateStatut={handleUpdateStatut}
                    onSendWhatsApp={handleSendWhatsApp}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Aucun candidat trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
