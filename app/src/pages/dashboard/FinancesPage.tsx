import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Banknote, TrendingUp, CheckCircle, Plus } from 'lucide-react';
import { useFinanceCandidats, useEnregistrerPaiement, type CandidatFinance } from '@/hooks/useFinances';
import { formatFCFA } from '@/lib/formatCurrency';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DEMO_FINANCES } from '@/lib/demoData';

export function FinancesPage() {
  const { projetId } = useParams<{ projetId: string }>();
  const navigate = useNavigate();
  const { data: realData, loading, refresh } = useFinanceCandidats(projetId);
  const isDemo = !loading && realData.length === 0;
  const data = isDemo ? DEMO_FINANCES : realData;
  const { enregistrer, loading: enregistrant } = useEnregistrerPaiement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<CandidatFinance | null>(null);
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');

  const totalPrix = data.reduce((s, d) => s + (d.candidat.apport_personnel || 0) + (d.candidat.montant_pret_sollicite || 0), 0);
  const totalApports = data.reduce((s, d) => s + d.finance.montant_verse, 0);
  const totalRestant = totalPrix - totalApports;
  const soldes = data.filter(d => d.finance.statut === 'solde').length;

  const handleSubmit = async () => {
    if (!selected || !montant) return;
    await enregistrer(selected.candidat, { montant: Number(montant), date, reference });
    setDialogOpen(false);
    setMontant(''); setReference('');
    refresh();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <h1 className="text-2xl font-bold text-slate-800">Suivi financier</h1>
      </div>

      {isDemo && <DemoBanner />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Banknote className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-slate-500">Montant total</p><p className="text-lg font-bold">{formatFCFA(totalPrix)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-slate-500">Total apports</p><p className="text-lg font-bold">{formatFCFA(totalApports)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Banknote className="w-5 h-5 text-amber-600" /></div><div><p className="text-xs text-slate-500">Restant</p><p className="text-lg font-bold">{formatFCFA(totalRestant)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-slate-500">Dossiers soldes</p><p className="text-lg font-bold">{soldes}/{data.length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Candidats retenus</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>Parcelle</TableHead>
                <TableHead className="text-right">Apport</TableHead>
                <TableHead className="text-right">Verse</TableHead>
                <TableHead className="text-right">Restant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(d => {
                const prix = (d.candidat.apport_personnel || 0) + (d.candidat.montant_pret_sollicite || 0);
                const restant = prix - d.finance.montant_verse;
                const statutCfg = {
                  en_attente: { label: 'En attente', cls: 'bg-slate-100 text-slate-700' },
                  partiellement_paye: { label: 'Partiel', cls: 'bg-amber-100 text-amber-700' },
                  solde: { label: 'Solde', cls: 'bg-emerald-100 text-emerald-700' },
                }[d.finance.statut];
                return (
                  <TableRow key={d.candidat.id}>
                    <TableCell className="font-medium">{d.candidat.prenom} {d.candidat.nom}</TableCell>
                    <TableCell>{d.parcelle || '-'}</TableCell>
                    <TableCell className="text-right">{formatFCFA(d.candidat.apport_personnel || 0)}</TableCell>
                    <TableCell className="text-right">{formatFCFA(d.finance.montant_verse)}</TableCell>
                    <TableCell className="text-right">{formatFCFA(restant)}</TableCell>
                    <TableCell><Badge className={statutCfg.cls}>{statutCfg.label}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(d); setDialogOpen(true); }}>
                        <Plus className="w-3 h-3 mr-1" />Paiement
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Aucun candidat retenu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          {selected && <p className="text-sm text-slate-500">{selected.candidat.prenom} {selected.candidat.nom}</p>}
          <div className="space-y-4 pt-2">
            <div><Label>Montant (FCFA)</Label><Input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Ex: 500000" /></div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div><Label>Reference</Label><Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex: VIR-2024-001" /></div>
            <Button className="w-full" onClick={handleSubmit} disabled={enregistrant || !montant}>
              {enregistrant ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
