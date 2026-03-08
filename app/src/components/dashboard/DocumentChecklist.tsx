import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Candidat, DocumentRequis, DocumentFourni } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, MessageCircle } from 'lucide-react';

interface DocumentChecklistProps {
  candidatId: string;
  projetId: string;
}

export function DocumentChecklist({ candidatId, projetId }: DocumentChecklistProps) {
  const [candidat, setCandidat] = useState<Candidat | null>(null);
  const [documentsRequis, setDocumentsRequis] = useState<DocumentRequis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [candidatRes, docsRes] = await Promise.all([
        supabase.from('candidats').select('*').eq('id', candidatId).single(),
        supabase.from('documents_requis').select('*').eq('projet_id', projetId),
      ]);
      if (candidatRes.error) throw candidatRes.error;
      setCandidat(candidatRes.data as Candidat);
      setDocumentsRequis((docsRes.data as DocumentRequis[]) || []);
    } catch (err) {
      console.error('Erreur chargement checklist:', err);
    } finally {
      setLoading(false);
    }
  }, [candidatId, projetId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDocumentStatut = async (documentId: string, statut: DocumentFourni['statut']) => {
    if (!candidat) return;
    const updatedDocuments = candidat.documents.map(doc => doc.id === documentId ? { ...doc, statut } : doc);
    const { error } = await supabase.from('candidats').update({ documents: updatedDocuments } as never).eq('id', candidatId);
    if (!error) setCandidat({ ...candidat, documents: updatedDocuments });
  };

  if (loading) return <Card><CardContent className="py-8 text-center text-slate-500">Chargement...</CardContent></Card>;
  if (!candidat) return <Card><CardContent className="py-8 text-center text-slate-500">Candidat introuvable</CardContent></Card>;

  const checklist = documentsRequis.map(requis => ({
    requis,
    fourni: candidat.documents?.find(d => d.type_document_id === requis.id) || null,
  }));

  const totalValides = checklist.filter(i => i.fourni?.statut === 'valide').length;
  const obligatoiresOk = checklist.filter(i => i.requis.obligatoire && i.fourni?.statut !== 'valide').length === 0;
  const progress = documentsRequis.length > 0 ? (totalValides / documentsRequis.length) * 100 : 0;

  const waLink = (docNom: string) => {
    const tel = candidat.telephone?.replace(/[^0-9]/g, '');
    return `https://wa.me/${tel}?text=${encodeURIComponent(`Bonjour ${candidat.prenom} ${candidat.nom},\n\nIl nous manque le document suivant : *${docNom}*.\n\nMerci de nous le transmettre dans les meilleurs delais.\n\nCordialement.`)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Checklist documentaire</span>
          <Badge className={obligatoiresOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
            {obligatoiresOk ? <><CheckCircle className="w-3 h-3 mr-1" />Dossier complet</> : <><AlertCircle className="w-3 h-3 mr-1" />Incomplet</>}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Documents valides</span><span className="font-medium">{totalValides}/{documentsRequis.length}</span></div>
          <Progress value={progress} />
        </div>
        <div className="space-y-2">
          {checklist.map(({ requis, fourni }) => {
            const statut = !fourni ? 'manquant' : fourni.statut;
            const cfg = {
              manquant: { label: 'Manquant', cls: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
              en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
              valide: { label: 'Valide', cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
              invalide: { label: 'Invalide', cls: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
            }[statut];
            return (
              <div key={requis.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{requis.nom}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{requis.obligatoire ? 'Obligatoire' : 'Facultatif'}</Badge>
                  </div>
                  {requis.description && <p className="text-xs text-slate-500 truncate">{requis.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge className={cfg.cls}>{cfg.icon}{cfg.label}</Badge>
                  {fourni?.url_fichier && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild><a href={fourni.url_fichier} target="_blank" rel="noopener noreferrer"><Download className="w-3.5 h-3.5" /></a></Button>}
                  {fourni && statut !== 'valide' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => updateDocumentStatut(fourni.id, 'valide')}><CheckCircle className="w-3.5 h-3.5" /></Button>}
                  {fourni && statut === 'valide' && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => updateDocumentStatut(fourni.id, 'invalide')}><XCircle className="w-3.5 h-3.5" /></Button>}
                  {(statut === 'manquant' || statut === 'invalide') && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild><a href={waLink(requis.nom)} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-3.5 h-3.5 text-green-600" /></a></Button>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
