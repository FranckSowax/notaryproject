import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Banknote, FileText, MessageCircle, Save,
} from 'lucide-react';
import { useCandidatById, useUpdateCandidatNotes, parseNotesEtape, ETAPES_CONFIG, getCandidatEtape } from '@/hooks/usePipeline';
import { formatFCFA } from '@/lib/formatCurrency';
import { useUpdateCandidatStatut } from '@/hooks/useSupabase';
import type { Candidat } from '@/types';

const STATUT_OPTIONS: { value: Candidat['statut']; label: string; color: string }[] = [
  { value: 'nouveau', label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  { value: 'en_cours', label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  { value: 'retenu', label: 'Retenu', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'refuse', label: 'Refuse', color: 'bg-red-100 text-red-700' },
  { value: 'desiste', label: 'Desiste', color: 'bg-slate-100 text-slate-700' },
];

export function CandidatDetailPage() {
  const { projetId, candidatId } = useParams<{ projetId: string; candidatId: string }>();
  const navigate = useNavigate();
  const { candidat, loading, refresh } = useCandidatById(candidatId);
  const { updateNotes, loading: savingNotes } = useUpdateCandidatNotes();
  const { updateStatut } = useUpdateCandidatStatut();
  const [notesTexte, setNotesTexte] = useState<string | null>(null);
  const [notesModified, setNotesModified] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!candidat) return <div className="text-center py-12 text-slate-500">Candidat introuvable</div>;

  const { notesTexte: currentNotes } = parseNotesEtape(candidat.notes);
  const displayNotes = notesModified ? (notesTexte ?? '') : currentNotes;
  const etape = getCandidatEtape(candidat);
  const etapeConfig = ETAPES_CONFIG.find(e => e.id === etape);
  const statutConfig = STATUT_OPTIONS.find(s => s.value === candidat.statut);
  const phone = candidat.telephone?.replace(/[^0-9+]/g, '');

  const handleSaveNotes = async () => {
    if (!notesModified || notesTexte === null) return;
    await updateNotes(candidat, notesTexte);
    setNotesModified(false);
    refresh();
  };

  const handleStatutChange = async (statut: Candidat['statut']) => {
    await updateStatut(candidat.id, statut);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/projets/${projetId}/candidats`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{candidat.prenom} {candidat.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statutConfig?.color}>{statutConfig?.label}</Badge>
            {etapeConfig && <Badge variant="outline">{etapeConfig.label}</Badge>}
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />WhatsApp
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar resume */}
        <Card>
          <CardHeader><CardTitle className="text-base">Resume</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>{candidat.prenom} {candidat.nom}</span></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span>{candidat.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{candidat.telephone}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span>{candidat.adresse}, {candidat.ville}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /><span>{candidat.profession}</span></div>
            <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-slate-400" /><span>{candidat.revenus_mensuels ? formatFCFA(candidat.revenus_mensuels) : 'N/A'}/mois</span></div>
            <hr className="my-2" />
            <p className="text-xs text-slate-500">Changer le statut:</p>
            <div className="flex flex-wrap gap-1">
              {STATUT_OPTIONS.map(s => (
                <Button key={s.value} variant={candidat.statut === s.value ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => handleStatutChange(s.value)}>
                  {s.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personnel">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="personnel">Personnel</TabsTrigger>
              <TabsTrigger value="professionnel">Professionnel</TabsTrigger>
              <TabsTrigger value="financier">Financier</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="personnel">
              <Card><CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
                <Info label="Nom" value={candidat.nom} />
                <Info label="Prenom" value={candidat.prenom} />
                <Info label="Date de naissance" value={candidat.date_naissance} />
                <Info label="Lieu de naissance" value={candidat.lieu_naissance} />
                <Info label="Nationalite" value={candidat.nationalite} />
                <Info label="Situation familiale" value={candidat.situation_familiale} />
                <Info label="Email" value={candidat.email} />
                <Info label="Telephone" value={candidat.telephone} />
                <Info label="Adresse" value={candidat.adresse} className="col-span-2" />
                <Info label="Ville" value={candidat.ville} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="professionnel">
              <Card><CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
                <Info label="Profession" value={candidat.profession} />
                <Info label="Employeur" value={candidat.employeur} />
                <Info label="Revenus mensuels" value={candidat.revenus_mensuels ? formatFCFA(candidat.revenus_mensuels) : 'N/A'} />
                <Info label="Type de contrat" value={candidat.type_contrat} />
                <Info label="Anciennete" value={candidat.anciennete_emploi} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="financier">
              <Card><CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
                <Info label="Apport personnel" value={candidat.apport_personnel ? formatFCFA(candidat.apport_personnel) : 'N/A'} />
                <Info label="Montant pret sollicite" value={candidat.montant_pret_sollicite ? formatFCFA(candidat.montant_pret_sollicite) : 'N/A'} />
                <Info label="Duree du pret" value={candidat.duree_pret ? `${candidat.duree_pret} mois` : 'N/A'} />
                <Info label="Banque actuelle" value={candidat.banque_actuelle} />
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card><CardContent className="p-6 space-y-3">
                {candidat.documents && candidat.documents.length > 0 ? candidat.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{doc.nom_fichier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={doc.statut === 'valide' ? 'bg-emerald-100 text-emerald-700' : doc.statut === 'invalide' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                        {doc.statut === 'valide' ? 'Valide' : doc.statut === 'invalide' ? 'Invalide' : 'En attente'}
                      </Badge>
                      {doc.url_fichier && <Button variant="ghost" size="sm" asChild><a href={doc.url_fichier} target="_blank" rel="noopener noreferrer">Voir</a></Button>}
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">Aucun document fourni</p>}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card><CardContent className="p-6 space-y-4">
                <Textarea
                  value={displayNotes}
                  onChange={e => { setNotesTexte(e.target.value); setNotesModified(true); }}
                  placeholder="Ajouter des notes..."
                  rows={8}
                />
                <Button onClick={handleSaveNotes} disabled={!notesModified || savingNotes}>
                  <Save className="w-4 h-4 mr-2" />
                  {savingNotes ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, className = '' }: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="font-medium text-slate-800">{value || 'N/A'}</p>
    </div>
  );
}
