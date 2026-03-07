import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin,
  Maximize,
  Home,
  CheckCircle,
  FileText,
  Send,
  MessageCircle,
  X,
  Phone,
  Mail,
  Trees,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Scale,
  ZoomIn,
  User,
  Upload,
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

function getGoogleMapsEmbedUrl(lien: string | null | undefined): string | null {
  if (!lien) return null;
  if (lien.includes('/embed')) return lien;
  const coordMatch = lien.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  const placeMatch = lien.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(lien)}&z=15&output=embed`;
}

function getThemeColors(projet: any): { primary: string; secondary: string } {
  const meta = projet?.metadata as Record<string, any> | null | undefined;
  return {
    primary: meta?.couleur_primaire || '#1e40af',
    secondary: meta?.couleur_secondaire || '#047857',
  };
}

export function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projet, loading: projetLoading } = useProjetBySlug(slug || '');
  const { config: chatbotConfig } = useChatbotConfig(projet?.id);
  const { createCandidat, loading: creatingCandidat } = useCreateCandidat();

  const colors = useMemo(() => getThemeColors(projet), [projet]);

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; message: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lightbox galerie
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('document') || lowerMessage.includes('piece')) {
      const docs = (projet as any).documents_requis?.map((d: DocumentRequis) => d.nom).join(', ');
      response = `Les documents requis sont : ${docs || 'Piece d\'identite, justificatif de domicile, bulletins de salaire, avis d\'imposition'}`;
    } else if (lowerMessage.includes('prix') || lowerMessage.includes('cout')) {
      response = `Le prix de ce bien est de ${projet.prix ? formatFCFA(projet.prix) : 'non renseigne'}.`;
    } else if (lowerMessage.includes('surface') || lowerMessage.includes('m2')) {
      response = `La surface est de ${projet.surface} m2.`;
    } else if (lowerMessage.includes('delai') || lowerMessage.includes('temps')) {
      response = 'Le delai de traitement des candidatures est generalement de 2 a 3 semaines.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('joindre')) {
      response = `Vous pouvez nous contacter par email a ${projet.contact_email} ou par telephone au ${projet.contact_phone}.`;
    } else if (lowerMessage.includes('condition') || lowerMessage.includes('eligible')) {
      const conditions = (projet as any).conditions_eligibilite?.join(', ');
      response = conditions
        ? `Les conditions d'eligibilite sont : ${conditions}`
        : 'Les conditions d\'eligibilite incluent des revenus stables et un apport personnel.';
    } else if (lowerMessage.includes('localisation') || lowerMessage.includes('adresse') || lowerMessage.includes('ou')) {
      response = `Le bien est situe a ${projet.adresse}${(projet as any).quartier ? ', ' + (projet as any).quartier : ''}, ${projet.ville}.`;
    } else {
      response = 'Je comprends. Pour plus d\'informations, je vous invite a remplir le formulaire de candidature ou a contacter directement le cabinet.';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', message: response }]);
    }, 500);

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
      const documentsFournis: DocumentFourni[] = [];
      for (const [docId, file] of Object.entries(documents)) {
        const path = `documents/${projet.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('candidats')
          .upload(path, file);

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('candidats').getPublicUrl(data.path);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full" style={{ borderColor: '#1e40af', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Projet non trouve</h1>
          <p className="text-slate-500">Ce programme immobilier n'existe pas ou n'est plus disponible.</p>
        </div>
      </div>
    );
  }

  const p = projet as any;
  const typeBienLabel =
    { terrain: 'Terrain', villa: 'Villa', maison: 'Maison', appartement: 'Appartement', commerce: 'Local commercial', immeuble: 'Immeuble', autre: 'Autre' }[
      projet.type_bien
    ] || projet.type_bien;

  const locationText = `${projet.adresse}${p.quartier ? ', ' + p.quartier : ''}`;
  const locationFull = `${locationText}${projet.ville ? ' — ' + projet.ville : ''}`;

  // Documents requis du projet
  const docsRequis: DocumentRequis[] = p.documents_requis || [];
  // Conditions d'eligibilite
  const conditionsElig: string[] = p.conditions_eligibilite || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========== HEADER FIXE ========== */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/95 backdrop-blur-lg border-b border-slate-200/50">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              {projet.titre?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <span className="text-xl font-bold text-slate-800 hidden sm:block">{projet.titre}</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#presentation" className="hover:text-slate-900 transition">Le Projet</a>
            <a href="#details" className="hover:text-slate-900 transition">Details</a>
            {p.images && p.images.length > 0 && (
              <a href="#galerie" className="hover:text-slate-900 transition">Galerie</a>
            )}
            {conditionsElig.length > 0 && (
              <a href="#conditions" className="hover:text-slate-900 transition">Conditions</a>
            )}
            <a href="#contact" className="hover:text-slate-900 transition">Contact</a>
          </nav>

          <Button
            onClick={() => setFormOpen(true)}
            className="text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            S'inscrire
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* ========== HERO SECTION (style Bolokoboue) ========== */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${colors.primary}15` }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${colors.secondary}15` }} />

        <div className="container mx-auto max-w-7xl">
          {/* Description box */}
          {projet.description && (
            <div className="mb-12 border rounded-2xl p-6 max-w-4xl" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)`, borderColor: `${colors.primary}20` }}>
              <div className="flex items-start gap-4">
                <div className="w-1 rounded-full shrink-0 self-stretch min-h-[60px]" style={{ backgroundColor: colors.primary }} />
                <p className="text-slate-700 text-lg leading-relaxed">
                  {projet.description}
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                  {projet.type_bien === 'terrain' ? <Trees className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  {typeBienLabel} {projet.surface > 0 && `— ${projet.surface} m2`}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    {projet.titre}
                  </span>
                </h1>

                {projet.prix > 0 && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold" style={{ color: colors.primary }}>{formatFCFA(projet.prix)}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={() => setFormOpen(true)}
                    className="text-white text-lg"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    S'inscrire
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Decouvrir le bien
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500">
                <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                <span>{locationFull}</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {projet.banner_image ? (
                  <img src={projet.banner_image} alt={projet.titre} className="w-full h-[500px] object-cover" />
                ) : (
                  <div className="w-full h-[500px]" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Maximize className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{projet.surface} m2</p>
                    <p className="text-sm text-slate-500">Surface</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRESENTATION / POURQUOI INVESTIR ========== */}
      <section id="presentation" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Pourquoi choisir ce bien ?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Emplacement strategique et accompagnement notarial de confiance.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Emplacement</h3>
                <p className="text-slate-600">{projet.ville}{p.quartier ? `, ${p.quartier}` : ''}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Securite Juridique</h3>
                <p className="text-slate-600">Accompagnement notarial complet</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Valorisation</h3>
                <p className="text-slate-600">Zone en plein developpement</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Accompagnement</h3>
                <p className="text-slate-600">Procedure d'acquisition securisee</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== DETAILS DU BIEN ========== */}
      <section id="details" className="py-24" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Details du bien</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Toutes les informations sur ce programme immobilier.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Fiche technique */}
            <Card className="overflow-hidden border-slate-200 shadow-lg">
              {projet.banner_image && (
                <div className="relative h-64">
                  <img src={projet.banner_image} alt={projet.titre} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-slate-800">{projet.surface} m2</span>
                  </div>
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{projet.titre}</h3>
                <p className="text-slate-500 mb-6">{typeBienLabel} — {projet.ville}</p>

                {projet.prix > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-500 mb-1">Prix</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold" style={{ color: colors.primary }}>{formatFCFA(projet.prix)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Type de bien</span>
                    <span className="font-semibold text-slate-900">{typeBienLabel}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Surface</span>
                    <span className="font-semibold text-slate-900">{projet.surface} m2</span>
                  </div>
                  {projet.type_bien !== 'terrain' && (
                    <>
                      <div className="flex justify-between py-3 border-b border-slate-100">
                        <span className="text-slate-500">Pieces</span>
                        <span className="font-semibold text-slate-900">{projet.nb_pieces}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-slate-100">
                        <span className="text-slate-500">Chambres</span>
                        <span className="font-semibold text-slate-900">{projet.nb_chambres}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-slate-500">Localisation</span>
                    <span className="font-semibold text-slate-900 text-right">{p.quartier ? `${p.quartier}, ` : ''}{projet.ville}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setFormOpen(true)}
                  className="w-full text-white"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  S'inscrire
                </Button>
              </CardContent>
            </Card>

            {/* Conditions + Documents */}
            <div className="space-y-8">
              {conditionsElig.length > 0 && (
                <div className="rounded-3xl p-8 border" style={{ background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}05)`, borderColor: `${colors.primary}20` }}>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Conditions d'eligibilite</h3>
                  <div className="space-y-4">
                    {conditionsElig.map((condition: string, i: number) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${colors.primary}15` }}>
                          <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                        </div>
                        <p className="text-slate-600">{condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {docsRequis.length > 0 && (
                <Card className="shadow-lg border-slate-200">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <FileText className="w-6 h-6" style={{ color: colors.primary }} />
                      Pieces a fournir
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">Documents requis pour votre candidature :</p>

                    <div className="space-y-4">
                      {docsRequis.map((doc: DocumentRequis, i: number) => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                            <span className="font-bold" style={{ color: colors.primary }}>{i + 1}</span>
                          </div>
                          <div>
                            <span className="text-slate-700 font-medium">{doc.nom}</span>
                            {doc.description && <p className="text-xs text-slate-400">{doc.description}</p>}
                          </div>
                          {doc.obligatoire && (
                            <Badge className="ml-auto text-white text-xs" style={{ backgroundColor: colors.primary }}>
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => setFormOpen(true)}
                      className="w-full mt-8 text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Commencer mon inscription
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== GALERIE PHOTOS ========== */}
      {p.images && p.images.length > 0 && (
        <section id="galerie" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Galerie photos</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">Decouvrez le bien en images</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {p.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/3]"
                  onClick={() => setLightboxImage(image)}
                >
                  <img
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Photo agrandie"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* ========== CARTE GOOGLE MAPS ========== */}
      {p.lien_localisation && (() => {
        const embedUrl = getGoogleMapsEmbedUrl(p.lien_localisation);
        if (!embedUrl) return null;
        return (
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Localisation</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{locationFull}</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation du bien"
                />
              </div>
            </div>
          </section>
        );
      })()}

      {/* ========== CONTACT ========== */}
      <section id="contact" className="py-24" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Contactez-nous</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Pour toute question, n'hesitez pas a nous contacter</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {projet.contact_email && (
              <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Mail className="w-7 h-7" style={{ color: colors.primary }} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Email</h4>
                  <a href={`mailto:${projet.contact_email}`} className="hover:underline text-sm break-all" style={{ color: colors.primary }}>
                    {projet.contact_email}
                  </a>
                </CardContent>
              </Card>
            )}

            {projet.contact_phone && (
              <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Phone className="w-7 h-7" style={{ color: colors.primary }} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">Telephone</h4>
                  <a href={`tel:${projet.contact_phone}`} className="hover:underline" style={{ color: colors.primary }}>
                    {projet.contact_phone}
                  </a>
                </CardContent>
              </Card>
            )}

            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                  <MapPin className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Adresse</h4>
                <p className="text-slate-600 text-sm">
                  {projet.adresse}
                  {p.quartier && <><br />{p.quartier}</>}
                  <br />{projet.ville}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => setFormOpen(true)}
              className="text-white text-lg"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              Demarrer mon inscription
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                {projet.titre?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <span className="text-xl font-bold">{projet.titre}</span>
            </div>
            <a href="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-2">
              Acces Notaire
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} {projet.titre}. Tous droits reserves. Propulse par NotarialPro.
          </div>
        </div>
      </footer>

      {/* ========== CHATBOT ========== */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="text-white p-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Assistant virtuel</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'text-white ml-8 rounded-br-md'
                      : 'bg-slate-100 text-slate-700 mr-8 rounded-bl-md'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: colors.primary } : undefined}
                >
                  {msg.message}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ecrivez votre message..."
                onKeyPress={e => e.key === 'Enter' && handleChatSubmit()}
                className="rounded-xl"
              />
              <Button
                size="icon"
                onClick={handleChatSubmit}
                className="text-white rounded-xl"
                style={{ backgroundColor: colors.primary }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ========== FORMULAIRE DE CANDIDATURE (4 etapes comme Bolokoboue) ========== */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Formulaire d'inscription — {projet.titre}</DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                <CheckCircle className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Inscription envoyee avec succes !</h3>
              <p className="text-slate-500">Nous vous contacterons dans les plus brefs delais.</p>
              <Button className="mt-6 text-white" onClick={() => setFormOpen(false)} style={{ backgroundColor: colors.primary }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Barre de progression */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className="flex-1 h-2 rounded-full transition-colors"
                    style={{ backgroundColor: step <= formStep ? colors.primary : '#e2e8f0' }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="font-semibold" style={{ color: colors.primary }}>Etape {formStep}/4</span>
                <span className="text-slate-400">-</span>
                <span className="text-slate-500">
                  {formStep === 1 && 'Informations personnelles'}
                  {formStep === 2 && 'Adresse et situation professionnelle'}
                  {formStep === 3 && 'Situation financiere'}
                  {formStep === 4 && 'Documents a fournir'}
                </span>
              </div>

              {/* Etape 1: Informations personnelles */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: colors.primary }} />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input value={formData.nom} onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))} placeholder="Votre nom" />
                    </div>
                    <div>
                      <Label>Prenom *</Label>
                      <Input value={formData.prenom} onChange={e => setFormData(prev => ({ ...prev, prenom: e.target.value }))} placeholder="Votre prenom" />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="votre@email.com" />
                  </div>
                  <div>
                    <Label>Telephone *</Label>
                    <Input value={formData.telephone} onChange={e => setFormData(prev => ({ ...prev, telephone: e.target.value }))} placeholder="+241 XX XX XX XX" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de naissance</Label>
                      <Input type="date" value={formData.date_naissance} onChange={e => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Lieu de naissance</Label>
                      <Input value={formData.lieu_naissance} onChange={e => setFormData(prev => ({ ...prev, lieu_naissance: e.target.value }))} placeholder="Libreville" />
                    </div>
                  </div>
                </div>
              )}

              {/* Etape 2: Adresse et situation professionnelle */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: colors.primary }} />
                    Adresse et situation
                  </h3>
                  <div>
                    <Label>Adresse</Label>
                    <Input value={formData.adresse} onChange={e => setFormData(prev => ({ ...prev, adresse: e.target.value }))} placeholder="Votre adresse actuelle" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ville</Label>
                      <Input value={formData.ville} onChange={e => setFormData(prev => ({ ...prev, ville: e.target.value }))} placeholder="Libreville" />
                    </div>
                    <div>
                      <Label>Code postal</Label>
                      <Input value={formData.code_postal} onChange={e => setFormData(prev => ({ ...prev, code_postal: e.target.value }))} placeholder="BP XXXX" />
                    </div>
                  </div>
                  <div>
                    <Label>Profession</Label>
                    <Input value={formData.profession} onChange={e => setFormData(prev => ({ ...prev, profession: e.target.value }))} placeholder="Votre profession" />
                  </div>
                  <div>
                    <Label>Employeur</Label>
                    <Input value={formData.employeur} onChange={e => setFormData(prev => ({ ...prev, employeur: e.target.value }))} placeholder="Nom de votre employeur" />
                  </div>
                  <div>
                    <Label>Revenus mensuels nets (FCFA)</Label>
                    <Input type="number" value={formData.revenus_mensuels} onChange={e => setFormData(prev => ({ ...prev, revenus_mensuels: e.target.value }))} placeholder="500000" />
                  </div>
                </div>
              )}

              {/* Etape 3: Situation financiere */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5" style={{ color: colors.primary }} />
                    Situation financiere
                  </h3>
                  <div>
                    <Label>Apport personnel (FCFA)</Label>
                    <Input type="number" value={formData.apport_personnel} onChange={e => setFormData(prev => ({ ...prev, apport_personnel: e.target.value }))} placeholder="1000000" />
                  </div>
                  <div>
                    <Label>Montant du pret sollicite (FCFA)</Label>
                    <Input type="number" value={formData.montant_pret_sollicite} onChange={e => setFormData(prev => ({ ...prev, montant_pret_sollicite: e.target.value }))} placeholder="5000000" />
                  </div>
                  <div>
                    <Label>Duree du pret (mois)</Label>
                    <Input type="number" value={formData.duree_pret} onChange={e => setFormData(prev => ({ ...prev, duree_pret: e.target.value }))} placeholder="120" />
                  </div>
                  <div>
                    <Label>Banque actuelle</Label>
                    <Input value={formData.banque_actuelle} onChange={e => setFormData(prev => ({ ...prev, banque_actuelle: e.target.value }))} placeholder="Nom de votre banque" />
                  </div>
                </div>
              )}

              {/* Etape 4: Documents */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5" style={{ color: colors.primary }} />
                    Documents a fournir
                  </h3>
                  <p className="text-sm text-slate-500">Telechargez vos documents en format PDF ou image :</p>

                  {docsRequis.length > 0 ? docsRequis.map((doc: DocumentRequis) => (
                    <div key={doc.id} className="p-4 border rounded-xl bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{doc.nom}</p>
                          <p className="text-sm text-slate-500">{doc.description}</p>
                          {doc.obligatoire && (
                            <Badge className="mt-1 text-white text-xs" style={{ backgroundColor: colors.primary }}>
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) setDocuments(prev => ({ ...prev, [doc.id]: file }));
                        }}
                        className="mt-2"
                      />
                      {documents[doc.id] && (
                        <p className="text-sm mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {documents[doc.id].name}
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="text-slate-400 text-center py-4">Aucun document requis pour ce projet.</p>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                  disabled={formStep === 1}
                >
                  Precedent
                </Button>
                {formStep < 4 ? (
                  <Button
                    onClick={() => setFormStep(prev => prev + 1)}
                    className="text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFormSubmit}
                    disabled={creatingCandidat}
                    className="text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    {creatingCandidat ? 'Envoi en cours...' : 'Envoyer mon inscription'}
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
