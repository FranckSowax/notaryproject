import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useRendezVous, useCreateRendezVous, type RendezVous } from '@/hooks/useCalendrier';
import { useProjets, useCandidats, useCurrentCabinet } from '@/hooks/useSupabase';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DEMO_RDVS } from '@/lib/demoData';
import { useSendBookingRequest } from '@/hooks/useBooking';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  verification: 'bg-blue-100 text-blue-700 border-blue-200',
  signature: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  remise_cles: 'bg-purple-100 text-purple-700 border-purple-200',
  autre: 'bg-slate-100 text-slate-700 border-slate-200',
};
const TYPE_LABELS: Record<string, string> = {
  verification: 'Verification', signature: 'Signature', remise_cles: 'Remise des cles', autre: 'Autre',
};

export function CalendrierPage() {
  const { user } = useAuth();
  const cabinetId = (user as any)?.cabinet_id || null;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { rdvs: realRdvs, loading, refresh } = useRendezVous(cabinetId, currentMonth);
  const isDemo = !loading && realRdvs.length === 0;
  const rdvs = isDemo ? DEMO_RDVS : realRdvs;
  const { projets } = useProjets(cabinetId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState('');
  const { candidats } = useCandidats(selectedProjet || undefined);
  const { createRdv, loading: creating } = useCreateRendezVous();

  const { cabinet } = useCurrentCabinet(cabinetId);
  const { sendRequest, loading: sendingBooking } = useSendBookingRequest();

  const [form, setForm] = useState({ candidatId: '', typeRdv: 'verification' as RendezVous['metadata']['type_rdv'], dateRdv: '', heure: '09:00', notes: '', description: '' });

  // Booking request state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingProjet, setBookingProjet] = useState('');
  const { candidats: bookingCandidats } = useCandidats(bookingProjet || undefined);
  const [bookingForm, setBookingForm] = useState({ candidatId: '', typeRdv: 'verification', lienMaps: '' });
  const [bookingSlots, setBookingSlots] = useState<{ date: string; heures: string[] }[]>([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotHeure, setNewSlotHeure] = useState('09:00');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleCreate = async () => {
    const candidat = candidats.find(c => c.id === form.candidatId);
    if (!selectedProjet || !form.candidatId || !form.dateRdv || !candidat) return;
    await createRdv({
      projetId: selectedProjet, candidatId: form.candidatId,
      candidatNom: `${candidat.prenom} ${candidat.nom}`,
      typeRdv: form.typeRdv, dateRdv: form.dateRdv, heure: form.heure,
      notes: form.notes, description: form.description || `${TYPE_LABELS[form.typeRdv]} - ${candidat.prenom} ${candidat.nom}`,
    });
    setDialogOpen(false);
    setForm({ candidatId: '', typeRdv: 'verification', dateRdv: '', heure: '09:00', notes: '', description: '' });
    refresh();
  };

  const addSlot = () => {
    if (!newSlotDate || !newSlotHeure) return;
    setBookingSlots(prev => {
      const existing = prev.find(s => s.date === newSlotDate);
      if (existing) {
        if (existing.heures.includes(newSlotHeure)) return prev;
        return prev.map(s => s.date === newSlotDate ? { ...s, heures: [...s.heures, newSlotHeure].sort() } : s);
      }
      return [...prev, { date: newSlotDate, heures: [newSlotHeure] }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setNewSlotHeure('09:00');
  };

  const removeSlot = (date: string, heure: string) => {
    setBookingSlots(prev => {
      const updated = prev.map(s => s.date === date ? { ...s, heures: s.heures.filter(h => h !== heure) } : s).filter(s => s.heures.length > 0);
      return updated;
    });
  };

  const handleSendBooking = async () => {
    const candidat = bookingCandidats.find(c => c.id === bookingForm.candidatId);
    if (!candidat || !bookingProjet || bookingSlots.length === 0) return;
    try {
      await sendRequest({
        candidatId: candidat.id,
        candidatNom: `${candidat.prenom} ${candidat.nom}`,
        candidatPhone: candidat.telephone || '',
        projetId: bookingProjet,
        typeRdv: bookingForm.typeRdv,
        creneaux: bookingSlots,
        cabinetId: cabinetId || '',
        cabinetNom: cabinet?.nom || `${user?.prenom} ${user?.nom}`,
        cabinetAdresse: cabinet?.adresse || '',
        cabinetVille: cabinet?.ville || '',
        cabinetTelephone: cabinet?.telephone || '',
        lienMaps: bookingForm.lienMaps,
      });
      toast.success('Demande de RDV envoyee par WhatsApp');
      setBookingOpen(false);
      setBookingForm({ candidatId: '', typeRdv: 'verification', lienMaps: '' });
      setBookingSlots([]);
      setBookingProjet('');
      refresh();
    } catch {
      toast.error('Erreur lors de l\'envoi de la demande');
    }
  };

  const rdvsAVenir = rdvs
    .filter(r => r.metadata?.date_rdv >= format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => a.metadata.date_rdv.localeCompare(b.metadata.date_rdv));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Calendrier</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => setBookingOpen(true)}>
            <Send className="w-4 h-4 mr-2" />Proposer un RDV WhatsApp
          </Button>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Nouveau RDV</Button>
        </div>
      </div>

      {isDemo && <DemoBanner />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-5 h-5" /></Button>
            <CardTitle className="capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8 text-slate-500">Chargement...</div> : (
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="bg-slate-50 p-2 text-center text-xs font-medium text-slate-500">{d}</div>
              ))}
              {days.map(day => {
                const dayRdvs = rdvs.filter(r => r.metadata?.date_rdv === format(day, 'yyyy-MM-dd'));
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toISOString()} className={`bg-white p-1.5 min-h-[80px] ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayRdvs.slice(0, 2).map(rdv => (
                        <div key={rdv.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${TYPE_COLORS[rdv.metadata?.type_rdv] || TYPE_COLORS.autre}`}>
                          {rdv.metadata?.heure} {rdv.metadata?.candidat_nom?.split(' ')[0]}
                        </div>
                      ))}
                      {dayRdvs.length > 2 && <div className="text-[10px] text-slate-500 text-center">+{dayRdvs.length - 2}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Prochains rendez-vous</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rdvsAVenir.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun rendez-vous a venir</p>}
          {rdvsAVenir.map(rdv => (
            <div key={rdv.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{rdv.metadata.date_rdv.split('-')[2]}</div>
                  <div className="text-xs text-slate-500">{format(new Date(rdv.metadata.date_rdv + 'T00:00'), 'MMM', { locale: fr })}</div>
                </div>
                <div>
                  <p className="font-medium text-sm">{rdv.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />{rdv.metadata.heure}
                    <Badge className={`text-[10px] ${TYPE_COLORS[rdv.metadata.type_rdv]}`}>{TYPE_LABELS[rdv.metadata.type_rdv]}</Badge>
                  </div>
                </div>
              </div>
              {rdv.candidat_id && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Rappel: ${rdv.description} le ${rdv.metadata.date_rdv} a ${rdv.metadata.heure}`)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouveau rendez-vous</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Projet</Label>
              <Select value={selectedProjet} onValueChange={v => { setSelectedProjet(v); setForm(f => ({ ...f, candidatId: '' })); }}>
                <SelectTrigger><SelectValue placeholder="Choisir un projet" /></SelectTrigger>
                <SelectContent>{projets.map(p => <SelectItem key={p.id} value={p.id}>{p.titre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Candidat</Label>
              <Select value={form.candidatId} onValueChange={v => setForm(f => ({ ...f, candidatId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un candidat" /></SelectTrigger>
                <SelectContent>{candidats.map(c => <SelectItem key={c.id} value={c.id}>{c.prenom} {c.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Type</Label>
              <Select value={form.typeRdv} onValueChange={v => setForm(f => ({ ...f, typeRdv: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                  <SelectItem value="remise_cles">Remise des cles</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={form.dateRdv} onChange={e => setForm(f => ({ ...f, dateRdv: e.target.value }))} /></div>
              <div><Label>Heure</Label><Input type="time" value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Signature acte de vente" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <Button className="w-full" onClick={handleCreate} disabled={creating || !selectedProjet || !form.candidatId || !form.dateRdv}>
              {creating ? 'Creation...' : 'Creer le RDV'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking WhatsApp Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-green-600" />Proposer un RDV via WhatsApp</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Projet</Label>
              <Select value={bookingProjet} onValueChange={v => { setBookingProjet(v); setBookingForm(f => ({ ...f, candidatId: '' })); }}>
                <SelectTrigger><SelectValue placeholder="Choisir un projet" /></SelectTrigger>
                <SelectContent>{projets.map(p => <SelectItem key={p.id} value={p.id}>{p.titre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Candidat</Label>
              <Select value={bookingForm.candidatId} onValueChange={v => setBookingForm(f => ({ ...f, candidatId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un candidat" /></SelectTrigger>
                <SelectContent>{bookingCandidats.map(c => <SelectItem key={c.id} value={c.id}>{c.prenom} {c.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Type de RDV</Label>
              <Select value={bookingForm.typeRdv} onValueChange={v => setBookingForm(f => ({ ...f, typeRdv: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                  <SelectItem value="remise_cles">Remise des cles</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Slot builder */}
            <div>
              <Label>Creneaux proposes</Label>
              <div className="flex items-end gap-2 mt-1">
                <div className="flex-1"><Input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} /></div>
                <div className="w-28"><Input type="time" value={newSlotHeure} onChange={e => setNewSlotHeure(e.target.value)} /></div>
                <Button type="button" size="sm" variant="outline" onClick={addSlot} disabled={!newSlotDate}><Plus className="w-4 h-4" /></Button>
              </div>
              {bookingSlots.length > 0 && (
                <div className="mt-3 space-y-2">
                  {bookingSlots.map(slot => (
                    <div key={slot.date} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{format(new Date(slot.date + 'T00:00'), 'EEEE d MMMM', { locale: fr })}</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {slot.heures.map(h => (
                          <Badge key={h} variant="secondary" className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors" onClick={() => removeSlot(slot.date, h)}>
                            {h} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {bookingSlots.length === 0 && <p className="text-xs text-slate-400 mt-2">Ajoutez au moins un creneau</p>}
            </div>

            <div><Label>Lien Google Maps (optionnel)</Label>
              <Input value={bookingForm.lienMaps} onChange={e => setBookingForm(f => ({ ...f, lienMaps: e.target.value }))} placeholder="https://maps.google.com/..." />
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSendBooking} disabled={sendingBooking || !bookingProjet || !bookingForm.candidatId || bookingSlots.length === 0}>
              {sendingBooking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</> : <><Send className="w-4 h-4 mr-2" />Envoyer via WhatsApp</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
