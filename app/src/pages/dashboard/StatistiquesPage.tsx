import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, TrendingUp, Clock, Download, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useStatistiques, generateCSV } from '@/hooks/useStatistiques';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DEMO_STATS } from '@/lib/demoData';

const STATUT_COLORS: Record<string, string> = {
  nouveau: '#3b82f6', en_cours: '#f59e0b', retenu: '#10b981', refuse: '#ef4444', desiste: '#6b7280',
};

export function StatistiquesPage() {
  const { user } = useAuth();
  const cabinetId = (user as any)?.cabinet_id;
  const { stats: realStats, loading } = useStatistiques(cabinetId);
  const isDemo = !loading && (!realStats || realStats.totalCandidats === 0);
  const stats = isDemo ? DEMO_STATS : realStats;

  const exportCSV = () => {
    if (!stats) return;
    const csv = generateCSV(stats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'statistiques-ppeo.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !stats) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const barData = Object.entries(stats.candidatsParStatut).map(([name, value]) => ({
    name: name === 'en_cours' ? 'En cours' : name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: STATUT_COLORS[name] || '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Exporter CSV</Button>
      </div>

      {isDemo && <DemoBanner />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><BarChart3 className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-slate-500">Projets actifs</p><p className="text-2xl font-bold">{stats.projetsActifs}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><Users className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-slate-500">Total candidats</p><p className="text-2xl font-bold">{stats.totalCandidats}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div><div><p className="text-xs text-slate-500">Taux conversion</p><p className="text-2xl font-bold">{stats.tauxConversion}%</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div><div><p className="text-xs text-slate-500">Delai moyen</p><p className="text-2xl font-bold">{stats.delaiMoyenTraitement}j</p></div></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Candidats par statut</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => <rect key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inscriptions par semaine</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.inscriptionsParSemaine}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Inscriptions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Dossiers en alerte</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Derniere MAJ</TableHead>
                <TableHead>Inactivite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.dossiersAlerte.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">Aucun dossier en alerte</TableCell></TableRow>}
              {stats.dossiersAlerte.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.prenom} {d.nom}</TableCell>
                  <TableCell>{d.projet_titre}</TableCell>
                  <TableCell><Badge variant="outline">{d.statut}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(d.updated_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell><Badge className={d.jours_inactivite > 14 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>{d.jours_inactivite}j</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Repartition par projet</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.repartitionParProjet.map(r => (
              <div key={r.titre} className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.titre}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.totalCandidats > 0 ? (r.count / stats.totalCandidats) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm text-slate-500 w-8 text-right">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
