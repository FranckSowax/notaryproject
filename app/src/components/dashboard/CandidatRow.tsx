import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Banknote,
  MoreHorizontal,
  MessageCircle,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatFCFA } from '@/lib/formatCurrency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Candidat } from '@/types';

interface CandidatRowProps {
  candidat: Candidat;
  onUpdateStatut: (id: string, statut: Candidat['statut']) => void;
  onSendWhatsApp: (telephone: string, message: string) => void;
}

const statutConfig = {
  nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  retenu: { label: 'Retenu', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  refuse: { label: 'Refusé', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  desiste: { label: 'Désisté', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
};

export function CandidatRow({ candidat, onUpdateStatut, onSendWhatsApp }: CandidatRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const statut = statutConfig[candidat.statut];

  const handleSendWhatsApp = () => {
    if (whatsappMessage.trim()) {
      onSendWhatsApp(candidat.telephone, whatsappMessage);
      setWhatsappMessage('');
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                {candidat.prenom[0]}{candidat.nom[0]}
              </span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-900">
                {candidat.prenom} {candidat.nom}
              </div>
              <div className="text-sm text-slate-500">{candidat.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Badge className={statut.color}>
            <statut.icon className="w-3 h-3 mr-1" />
            {statut.label}
          </Badge>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {candidat.profession}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {candidat.revenus_mensuels ? formatFCFA(candidat.revenus_mensuels) : '—'}/mois
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
          {format(new Date(candidat.created_at), 'dd MMM yyyy', { locale: fr })}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Voir le dossier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendWhatsApp(candidat.telephone, '')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter WhatsApp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateStatut(candidat.id, 'en_cours')}>
                <Clock className="w-4 h-4 mr-2" />
                Marquer en cours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatut(candidat.id, 'retenu')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Retenir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatut(candidat.id, 'refuse')}>
                <XCircle className="w-4 h-4 mr-2" />
                Refuser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Dialog des détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dossier du candidat</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="infos" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="situation">Situation</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Nom complet</label>
                  <p className="text-slate-900">{candidat.prenom} {candidat.nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Date de naissance</label>
                  <p className="text-slate-900">
                    {candidat.date_naissance && format(new Date(candidat.date_naissance), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {candidat.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Téléphone</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {candidat.telephone}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-500">Adresse</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {candidat.adresse}, {candidat.code_postal} {candidat.ville}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="situation" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Profession</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {candidat.profession}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Employeur</label>
                  <p className="text-slate-900">{candidat.employeur}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Revenus mensuels</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    {candidat.revenus_mensuels ? formatFCFA(candidat.revenus_mensuels) : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Type de contrat</label>
                  <p className="text-slate-900">{candidat.type_contrat}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Apport personnel</label>
                  <p className="text-slate-900">{candidat.apport_personnel ? formatFCFA(candidat.apport_personnel) : '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Montant prêt sollicité</label>
                  <p className="text-slate-900">{candidat.montant_pret_sollicite ? formatFCFA(candidat.montant_pret_sollicite) : '—'}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="space-y-2">
                {candidat.documents && candidat.documents.length > 0 ? (
                  candidat.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm">{doc.nom_fichier}</span>
                      </div>
                      <a
                        href={doc.url_fichier}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Télécharger
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">Aucun document fourni</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-lg">
                {candidat.whatsapp_conversations && candidat.whatsapp_conversations.length > 0 ? (
                  candidat.whatsapp_conversations.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.direction === 'outgoing'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70">
                        {format(new Date(msg.timestamp), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center">Aucune conversation</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={handleSendWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
