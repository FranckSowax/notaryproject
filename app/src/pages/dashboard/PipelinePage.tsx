import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, AlertTriangle, GripVertical, User } from 'lucide-react';
import {
  usePipelineCandidats,
  useUpdateEtape,
  getCandidatEtape,
  getCandidatEtapeDate,
  ETAPES_CONFIG,
  type EtapeDossier,
} from '@/hooks/usePipeline';
import type { Candidat } from '@/types';

function joursDepuis(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function PipelinePage() {
  const { projetId } = useParams<{ projetId: string }>();
  const navigate = useNavigate();
  const { candidats, loading } = usePipelineCandidats(projetId);
  const { updateEtape } = useUpdateEtape();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOverRef = useRef<EtapeDossier | null>(null);

  const candidatsParEtape = ETAPES_CONFIG.reduce((acc, etape) => {
    acc[etape.id] = candidats.filter(c => getCandidatEtape(c) === etape.id);
    return acc;
  }, {} as Record<EtapeDossier, Candidat[]>);

  const handleDragStart = (candidatId: string) => setDraggedId(candidatId);
  const handleDragOver = (e: React.DragEvent, etape: EtapeDossier) => {
    e.preventDefault();
    dragOverRef.current = etape;
  };
  const handleDrop = async (etape: EtapeDossier) => {
    if (!draggedId) return;
    const candidat = candidats.find(c => c.id === draggedId);
    if (candidat && getCandidatEtape(candidat) !== etape) {
      await updateEtape(candidat, etape);
    }
    setDraggedId(null);
    dragOverRef.current = null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pipeline des dossiers</h1>
          <p className="text-slate-500">{candidats.length} candidat{candidats.length > 1 ? 's' : ''} retenu{candidats.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPES_CONFIG.map(etape => (
          <div
            key={etape.id}
            className="flex-shrink-0 w-72"
            onDragOver={e => handleDragOver(e, etape.id)}
            onDrop={() => handleDrop(etape.id)}
          >
            <div className={`rounded-t-lg px-4 py-2 text-white font-medium flex items-center justify-between ${etape.color}`}>
              <span>{etape.label}</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {candidatsParEtape[etape.id]?.length || 0}
              </Badge>
            </div>
            <div className="bg-slate-100 rounded-b-lg p-2 min-h-[200px] space-y-2">
              {candidatsParEtape[etape.id]?.map(candidat => {
                const jours = joursDepuis(getCandidatEtapeDate(candidat));
                const alerte = jours > 7;
                return (
                  <Card
                    key={candidat.id}
                    draggable
                    onDragStart={() => handleDragStart(candidat.id)}
                    className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
                      draggedId === candidat.id ? 'opacity-50' : ''
                    } ${alerte ? 'border-red-300' : ''}`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-sm text-slate-800">
                              {candidat.prenom} {candidat.nom}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone className="w-3 h-3" />
                              {candidat.telephone}
                            </div>
                          </div>
                        </div>
                        {alerte && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{jours}j dans cette etape</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => navigate(`/dashboard/projets/${projetId}/candidats/${candidat.id}`)}
                        >
                          <User className="w-3 h-3 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(!candidatsParEtape[etape.id] || candidatsParEtape[etape.id].length === 0) && (
                <p className="text-center text-sm text-slate-400 py-8">Aucun dossier</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
