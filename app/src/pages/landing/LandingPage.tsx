import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Maximize, 
  BedDouble, 
  Home,
  CheckCircle,
  FileText,
  Send,
  MessageCircle,
  X,
  ChevronRight,
  Phone,
  Mail,
  Trees
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProjetBySlug, useCreateCandidat, useChatbotConfig } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/lib/formatCurrency';
import type { DocumentRequis, DocumentFourni } from '@/types';

export function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projet, loading: projetLoading } = useProjetBySlug(slug || '');
  const { config: chatbotConfig } = useChatbotConfig(projet?.id);
  const { createCandidat, loading: creatingCandidat } = useCreateCandidat();

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', message: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Formulaire candidature
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: '',
    situation_familiale: 'celibataire',
    adresse: '',
    ville: '',
    code_postal: '',
    profession: '',
    employeur: '',
    revenus_mensuels: '',
    type_contrat: 'cdi',
    anciennete_emploi: '',
    apport_personnel: '',
    montant_pret_sollicite: '',
    duree_pret: '',
    banque_actuelle: '',
  });
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize chatbot
  useEffect(() => {
    if (chatbotConfig?.welcome_message && chatMessages.length === 0) {
      setChatMessages([{ role: 'assistant', message: chatbotConfig.welcome_message }]);
    }
  }, [chatbotConfig]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !projet) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');

    // Simple chatbot responses based on FAQ
    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('document') || lowerMessage.includes('pièce')) {
      const docs = projet.documents_requis?.map((d: DocumentRequis) => d.nom).join(', ');
      response = `Les documents requis sont : ${docs || 'Pièce d\'identité, justificatif de domicile, bulletins de salaire, avis d\'imposition'}`;
    } else if (lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
      response = `Le prix de ce bien est de ${projet.prix ? formatFCFA(projet.prix) : 'non renseigne'}.`;
    } else if (lowerMessage.includes('surface') || lowerMessage.includes('m²')) {
      response = `La surface est de ${projet.surface} m².`;
    } else if (lowerMessage.includes('délai') || lowerMessage.includes('temps')) {
      response = 'Le délai de traitement des candidatures est généralement de 2 à 3 semaines.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('joindre')) {
      response = `Vous pouvez nous contacter par email à ${projet.contact_email} ou par téléphone au ${projet.contact_phone}.`;
    } else if (lowerMessage.includes('condition') || lowerMessage.includes('éligible')) {
      const conditions = projet.conditions_eligibilite?.join(', ');
      response = conditions 
        ? `Les conditions d'éligibilité sont : ${conditions}`
        : 'Les conditions d\'éligibilité incluent des revenus stables et un apport personnel.';
    } else {
      response = 'Je comprends. Pour plus d\'informations, je vous invite à remplir le formulaire de candidature ou à contacter directement le cabinet.';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', message: response }]);
    }, 500);

    // Save message to database
    await supabase.from('chatbot_messages').insert({
      projet_id: projet.id,
      role: 'user',
      message: userMessage,
      session_id: 'session-' + Date.now(),
    } as any);
  };

  const handleFormSubmit = async () => {
    if (!projet) return;

    try {
      // Upload documents
      const documentsFournis: DocumentFourni[] = [];
      for (const [docId, file] of Object.entries(documents)) {
        const path = `documents/${projet.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('candidats')
          .upload(path, file);
        
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('candidats')
            .getPublicUrl(data.path);
          
          documentsFournis.push({
            id: Date.now().toString(),
            type_document_id: docId,
            nom_fichier: file.name,
            url_fichier: publicUrl,
            date_upload: new Date().toISOString(),
            statut: 'en_attente',
            commentaire: '',
          });
        }
      }

      // Create candidat
      const candidatData = {
        projet_id: projet.id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date_naissance: formData.date_naissance,
        lieu_naissance: formData.lieu_naissance,
        nationalite: formData.nationalite,
        situation_familiale: formData.situation_familiale as any,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.code_postal,
        profession: formData.profession,
        employeur: formData.employeur,
        revenus_mensuels: parseFloat(formData.revenus_mensuels) || 0,
        type_contrat: formData.type_contrat as any,
        anciennete_emploi: formData.anciennete_emploi,
        apport_personnel: parseFloat(formData.apport_personnel) || 0,
        montant_pret_sollicite: parseFloat(formData.montant_pret_sollicite) || 0,
        duree_pret: parseInt(formData.duree_pret) || 0,
        banque_actuelle: formData.banque_actuelle,
        documents: documentsFournis,
        statut: 'nouveau' as const,
      };
      await createCandidat(candidatData);

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  if (projetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Projet non trouvé</h1>
          <p className="text-slate-500">Ce programme immobilier n'existe pas ou n'est plus disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">NotarialPro</span>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            Postuler
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[500px]">
        {projet.banner_image ? (
          <img
            src={projet.banner_image}
            alt={projet.titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Badge className="mb-4 bg-white/20 text-white backdrop-blur">
              {projet.type_bien}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {projet.titre}
            </h1>
            <p className="text-xl text-white/90 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {projet.adresse}, {projet.ville}
            </p>
          </div>
        </div>
      </section>

      {/* Caractéristiques */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-6 ${projet.type_bien === 'terrain' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 mx-auto mb-3 text-blue-600 font-bold text-xl">FCFA</div>
                <p className="text-2xl font-bold text-slate-900">
                  {projet.prix ? formatFCFA(projet.prix) : '—'}
                </p>
                <p className="text-sm text-slate-500">Prix</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Maximize className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <p className="text-2xl font-bold text-slate-900">{projet.surface} m²</p>
                <p className="text-sm text-slate-500">Superficie</p>
              </CardContent>
            </Card>
            {projet.type_bien === 'terrain' ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trees className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <p className="text-2xl font-bold text-slate-900">{projet.type_bien}</p>
                  <p className="text-sm text-slate-500">Type de bien</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Home className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <p className="text-2xl font-bold text-slate-900">{projet.nb_pieces}</p>
                    <p className="text-sm text-slate-500">Pièces</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <BedDouble className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <p className="text-2xl font-bold text-slate-900">{projet.nb_chambres}</p>
                    <p className="text-sm text-slate-500">Chambres</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {projet.description || 'Aucune description disponible.'}
              </p>

              {/* Conditions */}
              {projet.conditions_eligibilite && projet.conditions_eligibilite.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Conditions d'éligibilité
                  </h3>
                  <ul className="space-y-2">
                    {projet.conditions_eligibilite.map((condition, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Galerie photos</h2>
              {projet.images && projet.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {projet.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Aucune photo disponible</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Documents requis */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Documents requis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {projet.documents_requis?.map((doc: DocumentRequis) => (
              <div key={doc.id} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{doc.nom}</p>
                  <p className="text-sm text-slate-500">{doc.description}</p>
                  {doc.obligatoire && (
                    <Badge variant="secondary" className="mt-2">Obligatoire</Badge>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-slate-500">Aucun document spécifié</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Intéressé par ce bien ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Déposez votre candidature dès maintenant
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setFormOpen(true)}
          >
            Postuler maintenant
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4" />
                  {projet.contact_phone}
                </p>
                <p className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4" />
                  {projet.contact_email}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Adresse</h3>
              <p className="text-slate-300">
                {projet.adresse}<br />
                {projet.code_postal} {projet.ville}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} NotarialPro.<br />
                Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      {chatbotConfig?.enabled && (
        <div className="fixed bottom-6 right-6 z-50">
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Assistant virtuel</span>
                </div>
                <button onClick={() => setChatOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white ml-8'
                        : 'bg-slate-100 text-slate-700 mr-8'
                    }`}
                  >
                    {msg.message}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button size="icon" onClick={handleChatSubmit}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulaire de candidature */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Formulaire de candidature</DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Candidature envoyée avec succès !
              </h3>
              <p className="text-slate-500">
                Nous vous contacterons dans les plus brefs délais.
              </p>
              <Button className="mt-6" onClick={() => setFormOpen(false)}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Étapes */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full ${
                      step <= formStep ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Prénom *</Label>
                      <Input
                        value={formData.prenom}
                        onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Téléphone *</Label>
                    <Input
                      value={formData.telephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de naissance</Label>
                      <Input
                        type="date"
                        value={formData.date_naissance}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Lieu de naissance</Label>
                      <Input
                        value={formData.lieu_naissance}
                        onChange={(e) => setFormData(prev => ({ ...prev, lieu_naissance: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Adresse</h3>
                  <div>
                    <Label>Adresse</Label>
                    <Input
                      value={formData.adresse}
                      onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ville</Label>
                      <Input
                        value={formData.ville}
                        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Code postal</Label>
                      <Input
                        value={formData.code_postal}
                        onChange={(e) => setFormData(prev => ({ ...prev, code_postal: e.target.value }))}
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">Situation professionnelle</h3>
                  <div>
                    <Label>Profession</Label>
                    <Input
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Employeur</Label>
                    <Input
                      value={formData.employeur}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeur: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Revenus mensuels nets (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mensuels}
                      onChange={(e) => setFormData(prev => ({ ...prev, revenus_mensuels: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Situation financière</h3>
                  <div>
                    <Label>Apport personnel (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.apport_personnel}
                      onChange={(e) => setFormData(prev => ({ ...prev, apport_personnel: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Montant du pret sollicite (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.montant_pret_sollicite}
                      onChange={(e) => setFormData(prev => ({ ...prev, montant_pret_sollicite: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Durée du prêt (mois)</Label>
                    <Input
                      type="number"
                      value={formData.duree_pret}
                      onChange={(e) => setFormData(prev => ({ ...prev, duree_pret: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Banque actuelle</Label>
                    <Input
                      value={formData.banque_actuelle}
                      onChange={(e) => setFormData(prev => ({ ...prev, banque_actuelle: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Documents à fournir</h3>
                  {projet.documents_requis?.map((doc: DocumentRequis) => (
                    <div key={doc.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{doc.nom}</p>
                          <p className="text-sm text-slate-500">{doc.description}</p>
                          {doc.obligatoire && (
                            <Badge variant="secondary" className="mt-1">Obligatoire</Badge>
                          )}
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept={doc.type_fichier.join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocuments(prev => ({ ...prev, [doc.id]: file }));
                          }
                        }}
                      />
                      {documents[doc.id] && (
                        <p className="text-sm text-emerald-600 mt-1">
                          ✓ {documents[doc.id].name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                  disabled={formStep === 1}
                >
                  Précédent
                </Button>
                {formStep < 4 ? (
                  <Button onClick={() => setFormStep(prev => prev + 1)}>
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFormSubmit}
                    disabled={creatingCandidat}
                  >
                    {creatingCandidat ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
