import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Printer, Eye } from 'lucide-react';
import { usePipelineCandidats } from '@/hooks/usePipeline';
import { useAuth } from '@/contexts/AuthContext';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DEMO_CANDIDATS } from '@/lib/demoData';
import {
  generateAttestation,
  generatePromesse,
  generateConvocation,
  generateRecu,
} from '@/lib/documentTemplates';
import { CABINET_DEFAULT } from '@/lib/cabinetDefaults';

const TEMPLATES = [
  { id: 'attestation', label: 'Attestation de Reservation', icon: FileText },
  { id: 'promesse', label: 'Promesse de Vente', icon: FileText },
  { id: 'convocation', label: 'Convocation a la Signature', icon: FileText },
  { id: 'recu', label: 'Recu de Paiement', icon: FileText },
] as const;

type TemplateId = (typeof TEMPLATES)[number]['id'];

export function DocumentsGenerationPage() {
  const { projetId } = useParams<{ projetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { candidats: realCandidats, loading } = usePipelineCandidats(projetId);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isDemo = !loading && realCandidats.length === 0;
  const candidats = isDemo ? DEMO_CANDIDATS : realCandidats;

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('attestation');
  const [selectedCandidatId, setSelectedCandidatId] = useState<string>('');
  const [dateRdv, setDateRdv] = useState('');
  const [paiementMontant, setPaiementMontant] = useState('');
  const [paiementDate, setPaiementDate] = useState('');
  const [paiementRef, setPaiementRef] = useState('');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const cabinet = {
    nom: CABINET_DEFAULT.nom,
    adresse: CABINET_DEFAULT.adresse,
    ville: CABINET_DEFAULT.ville,
    telephone: CABINET_DEFAULT.telephone,
    email: user?.email || CABINET_DEFAULT.email,
  };

  const selectedCandidat = candidats.find(c => c.id === selectedCandidatId);

  // Minimal projet info from candidat's project context
  const projet = { titre: '', adresse: '', ville: '', surface: '', prix: 0, type_bien: '' };

  const handleGenerate = () => {
    if (!selectedCandidat) return;

    let html = '';
    switch (selectedTemplate) {
      case 'attestation':
        html = generateAttestation(selectedCandidat, projet, cabinet);
        break;
      case 'promesse':
        html = generatePromesse(selectedCandidat, projet, cabinet);
        break;
      case 'convocation':
        html = generateConvocation(selectedCandidat, projet, cabinet, dateRdv);
        break;
      case 'recu':
        html = generateRecu(selectedCandidat, projet, cabinet, {
          montant: Number(paiementMontant) || 0,
          date: paiementDate,
          reference: paiementRef,
        });
        break;
    }
    setPreviewHtml(html);
  };

  const handlePrint = () => {
    if (!iframeRef.current || !previewHtml) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(previewHtml);
    doc.close();
    setTimeout(() => {
      iframeRef.current?.contentWindow?.print();
    }, 300);
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
          <h1 className="text-2xl font-bold text-slate-800">Generation de documents</h1>
          <p className="text-slate-500">Attestations, promesses, convocations et recus</p>
        </div>
      </div>

      {isDemo && <DemoBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de document</label>
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value as TemplateId)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Candidat selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Candidat</label>
              <select
                value={selectedCandidatId}
                onChange={e => setSelectedCandidatId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Selectionnez --</option>
                {candidats.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>

            {/* Extra fields for convocation */}
            {selectedTemplate === 'convocation' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date du RDV</label>
                <input
                  type="date"
                  value={dateRdv}
                  onChange={e => setDateRdv(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* Extra fields for recu */}
            {selectedTemplate === 'recu' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant (FCFA)</label>
                  <input
                    type="number"
                    value={paiementMontant}
                    onChange={e => setPaiementMontant(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date du paiement</label>
                  <input
                    type="date"
                    value={paiementDate}
                    onChange={e => setPaiementDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={paiementRef}
                    onChange={e => setPaiementRef(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="REF-001"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleGenerate} disabled={!selectedCandidatId} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Apercu
              </Button>
              <Button onClick={handlePrint} disabled={!previewHtml} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Apercu du document</CardTitle>
          </CardHeader>
          <CardContent>
            {previewHtml ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full h-[600px] bg-white"
                  title="Apercu document"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p>Selectionnez un candidat et cliquez sur "Apercu"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
