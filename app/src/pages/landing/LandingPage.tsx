import { useState, useRef, useEffect, useMemo } from 'react';
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
  Trees,
  ArrowRight,
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronDown,
  ZoomIn,
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
  // If already an embed URL, use as-is
  if (lien.includes('/embed')) return lien;
  // Extract coordinates from Google Maps URL: /@lat,lng
  const coordMatch = lien.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  // Extract place query from URL path
  const placeMatch = lien.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`;
  }
  // Fallback: use the full link as a query
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

  // Scroll state pour le header
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const docs = projet.documents_requis?.map((d: DocumentRequis) => d.nom).join(', ');
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
      const conditions = projet.conditions_eligibilite?.join(', ');
      response = conditions
        ? `Les conditions d'eligibilite sont : ${conditions}`
        : 'Les conditions d\'eligibilite incluent des revenus stables et un apport personnel.';
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
          const {
            data: { publicUrl },
          } = supabase.storage.from('candidats').getPublicUrl(data.path);

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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (projetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#1e40af', borderTopColor: 'transparent' }} />
          <p className="text-slate-500 text-sm">Chargement du projet...</p>
        </div>
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

  const typeBienLabel =
    { terrain: 'Terrain', villa: 'Villa', maison: 'Maison', appartement: 'Appartement', commerce: 'Local commercial', immeuble: 'Immeuble', autre: 'Autre' }[
      projet.type_bien
    ] || projet.type_bien;

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER FIXE ========== */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-200/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              {projet.titre?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <span className={`font-bold text-lg hidden sm:block transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              {projet.titre}
            </span>
          </div>

          <nav className={`hidden lg:flex items-center gap-8 text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-white/80'}`}>
            <button onClick={() => scrollToSection('projet')} className="hover:opacity-100 transition">
              Le Projet
            </button>
            <button onClick={() => scrollToSection('caracteristiques')} className="hover:opacity-100 transition">
              Caracteristiques
            </button>
            {projet.images && projet.images.length > 0 && (
              <button onClick={() => scrollToSection('galerie')} className="hover:opacity-100 transition">
                Galerie
              </button>
            )}
            <button onClick={() => scrollToSection('conditions')} className="hover:opacity-100 transition">
              Conditions
            </button>
            <button onClick={() => scrollToSection('candidature')} className="hover:opacity-100 transition">
              Candidature
            </button>
          </nav>

          <Button
            onClick={() => setFormOpen(true)}
            className="text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            Postuler
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[90vh] sm:min-h-[85vh] flex items-end">
        {projet.banner_image ? (
          <img src={projet.banner_image} alt={projet.titre} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-32">
          <div className="max-w-3xl">
            <Badge
              className="mb-4 text-white border-0 text-sm px-3 py-1"
              style={{ backgroundColor: `${colors.primary}cc` }}
            >
              {typeBienLabel}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {projet.titre}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              {projet.adresse}{projet.quartier ? `, ${projet.quartier}` : ''}{projet.ville ? ` — ${projet.ville}` : ''}
            </p>

            {projet.prix > 0 && (
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 mb-8 border border-white/20">
                <span className="text-white/70 text-sm font-medium">Prix</span>
                <span className="text-2xl sm:text-3xl font-bold text-white">{formatFCFA(projet.prix)}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setFormOpen(true)}
                className="text-white text-lg shadow-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                Postuler maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('projet')}
                className="bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20 hover:text-white"
              >
                Decouvrir le projet
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CARACTERISTIQUES ========== */}
      <section id="caracteristiques" className="py-16 sm:py-20" style={{ backgroundColor: `${colors.primary}08` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-4 sm:gap-6 ${projet.type_bien === 'terrain' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {/* Prix */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>FCFA</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {projet.prix ? formatFCFA(projet.prix) : '--'}
                </p>
                <p className="text-sm text-slate-500 mt-1">Prix</p>
              </CardContent>
            </Card>

            {/* Surface */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Maximize className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{projet.surface} m2</p>
                <p className="text-sm text-slate-500 mt-1">Superficie</p>
              </CardContent>
            </Card>

            {projet.type_bien === 'terrain' ? (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Trees className="w-7 h-7" style={{ color: colors.primary }} />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{typeBienLabel}</p>
                  <p className="text-sm text-slate-500 mt-1">Type de bien</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <Home className="w-7 h-7" style={{ color: colors.primary }} />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{projet.nb_pieces}</p>
                    <p className="text-sm text-slate-500 mt-1">Pieces</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <BedDouble className="w-7 h-7" style={{ color: colors.primary }} />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{projet.nb_chambres}</p>
                    <p className="text-sm text-slate-500 mt-1">Chambres</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== DESCRIPTION ========== */}
      <section id="projet" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">A propos du projet</h2>
            <div className="w-20 h-1 rounded-full mx-auto" style={{ backgroundColor: colors.primary }} />
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                  {projet.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Points forts */}
              <div className="grid sm:grid-cols-3 gap-6 mt-12">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Securise</p>
                    <p className="text-xs text-slate-500">Accompagnement notarial</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                    <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Rapide</p>
                    <p className="text-xs text-slate-500">Traitement accelere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                    <TrendingUp className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Investissement</p>
                    <p className="text-xs text-slate-500">Forte valorisation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos rapides laterales */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="p-1" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg">Informations cles</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Type</span>
                        <span className="font-semibold text-slate-900">{typeBienLabel}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Prix</span>
                        <span className="font-semibold" style={{ color: colors.primary }}>
                          {projet.prix ? formatFCFA(projet.prix) : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Surface</span>
                        <span className="font-semibold text-slate-900">{projet.surface} m2</span>
                      </div>
                      {projet.type_bien !== 'terrain' && (
                        <>
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Pieces</span>
                            <span className="font-semibold text-slate-900">{projet.nb_pieces}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Chambres</span>
                            <span className="font-semibold text-slate-900">{projet.nb_chambres}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">Localisation</span>
                        <span className="font-semibold text-slate-900 text-right">{projet.quartier ? `${projet.quartier}, ` : ''}{projet.ville}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full text-white mt-4"
                      onClick={() => setFormOpen(true)}
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      Postuler maintenant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ========== GALERIE PHOTOS ========== */}
      {projet.images && projet.images.length > 0 && (
        <section id="galerie" className="py-16 sm:py-24" style={{ backgroundColor: `${colors.primary}05` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Galerie photos</h2>
              <div className="w-20 h-1 rounded-full mx-auto" style={{ backgroundColor: colors.primary }} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projet.images.map((image: string, index: number) => (
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

      {/* ========== CONDITIONS D'ELIGIBILITE ========== */}
      {projet.conditions_eligibilite && projet.conditions_eligibilite.length > 0 && (
        <section id="conditions" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Conditions d'eligibilite</h2>
              <div className="w-20 h-1 rounded-full mx-auto" style={{ backgroundColor: colors.primary }} />
              <p className="text-slate-500 mt-4 text-lg">Verifiez que vous remplissez les conditions pour candidater</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {projet.conditions_eligibilite.map((condition: string, index: number) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                    </div>
                    <p className="text-slate-700 font-medium">{condition}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== DOCUMENTS REQUIS ========== */}
      <section className="py-16 sm:py-24" style={{ backgroundColor: `${colors.primary}05` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Documents requis</h2>
            <div className="w-20 h-1 rounded-full mx-auto" style={{ backgroundColor: colors.primary }} />
            <p className="text-slate-500 mt-4 text-lg">Preparez ces documents pour votre candidature</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {projet.documents_requis?.map((doc: DocumentRequis) => (
              <Card key={doc.id} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <FileText className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{doc.nom}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{doc.description}</p>
                    {doc.obligatoire && (
                      <Badge className="mt-2 text-white text-xs" style={{ backgroundColor: colors.primary }}>
                        Obligatoire
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) || <p className="text-slate-500 col-span-2 text-center">Aucun document specifie</p>}
          </div>
        </div>
      </section>

      {/* ========== CARTE GOOGLE MAPS ========== */}
      {projet.lien_localisation && (() => {
        const embedUrl = getGoogleMapsEmbedUrl(projet.lien_localisation);
        if (!embedUrl) return null;
        return (
          <section className="py-20 sm:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <Badge className="mb-4 px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                  Localisation
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Ou se situe le bien ?
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                  {projet.adresse}{projet.quartier ? `, ${projet.quartier}` : ''}{projet.ville ? ` — ${projet.ville}` : ''}
                </p>
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

      {/* ========== CTA CANDIDATURE ========== */}
      <section id="candidature" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }} />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Interesse par ce bien ?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Deposez votre candidature des maintenant et rejoignez notre programme immobilier.
          </p>
          <Button
            size="lg"
            onClick={() => setFormOpen(true)}
            className="bg-white hover:bg-slate-100 text-lg shadow-2xl px-8 py-6"
            style={{ color: colors.primary }}
          >
            Postuler maintenant
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  {projet.titre?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <span className="font-bold text-lg">{projet.titre}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {projet.description?.substring(0, 150)}
                {projet.description && projet.description.length > 150 ? '...' : ''}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Contact</h3>
              <div className="space-y-3">
                {projet.contact_phone && (
                  <p className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}30` }}>
                      <Phone className="w-4 h-4" />
                    </div>
                    {projet.contact_phone}
                  </p>
                )}
                {projet.contact_email && (
                  <p className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.primary}30` }}>
                      <Mail className="w-4 h-4" />
                    </div>
                    {projet.contact_email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Adresse</h3>
              <p className="text-slate-300 leading-relaxed">
                {projet.adresse}
                {projet.quartier && <><br />{projet.quartier}</>}
                <br />
                {projet.ville}
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setFormOpen(true)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Postuler
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} NotarialPro. Tous droits reserves.
            </p>
            <p className="text-xs text-slate-600">
              Propulse par NotarialPro
            </p>
          </div>
        </div>
      </footer>

      {/* ========== CHATBOT ========== */}
      {chatbotConfig?.enabled && (
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
                    className={`p-3 rounded-2xl text-sm ${
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
      )}

      {/* ========== FORMULAIRE DE CANDIDATURE ========== */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Formulaire de candidature</DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${colors.primary}15` }}>
                <CheckCircle className="w-10 h-10" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Candidature envoyee avec succes !</h3>
              <p className="text-slate-500">Nous vous contacterons dans les plus brefs delais.</p>
              <Button className="mt-6 text-white" onClick={() => setFormOpen(false)} style={{ backgroundColor: colors.primary }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Etapes */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="flex-1 flex items-center gap-1">
                    <div
                      className="flex-1 h-2 rounded-full transition-colors"
                      style={{ backgroundColor: step <= formStep ? colors.primary : '#e2e8f0' }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="font-semibold" style={{ color: colors.primary }}>
                  Etape {formStep}/4
                </span>
                <span className="text-slate-400">-</span>
                <span className="text-slate-500">
                  {formStep === 1 && 'Informations personnelles'}
                  {formStep === 2 && 'Adresse et situation professionnelle'}
                  {formStep === 3 && 'Situation financiere'}
                  {formStep === 4 && 'Documents a fournir'}
                </span>
              </div>

              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input value={formData.nom} onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Prenom *</Label>
                      <Input value={formData.prenom} onChange={e => setFormData(prev => ({ ...prev, prenom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Telephone *</Label>
                    <Input value={formData.telephone} onChange={e => setFormData(prev => ({ ...prev, telephone: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de naissance</Label>
                      <Input type="date" value={formData.date_naissance} onChange={e => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Lieu de naissance</Label>
                      <Input value={formData.lieu_naissance} onChange={e => setFormData(prev => ({ ...prev, lieu_naissance: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Adresse</h3>
                  <div>
                    <Label>Adresse</Label>
                    <Input value={formData.adresse} onChange={e => setFormData(prev => ({ ...prev, adresse: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ville</Label>
                      <Input value={formData.ville} onChange={e => setFormData(prev => ({ ...prev, ville: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Code postal</Label>
                      <Input value={formData.code_postal} onChange={e => setFormData(prev => ({ ...prev, code_postal: e.target.value }))} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">Situation professionnelle</h3>
                  <div>
                    <Label>Profession</Label>
                    <Input value={formData.profession} onChange={e => setFormData(prev => ({ ...prev, profession: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Employeur</Label>
                    <Input value={formData.employeur} onChange={e => setFormData(prev => ({ ...prev, employeur: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Revenus mensuels nets (FCFA)</Label>
                    <Input type="number" value={formData.revenus_mensuels} onChange={e => setFormData(prev => ({ ...prev, revenus_mensuels: e.target.value }))} />
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Situation financiere</h3>
                  <div>
                    <Label>Apport personnel (FCFA)</Label>
                    <Input type="number" value={formData.apport_personnel} onChange={e => setFormData(prev => ({ ...prev, apport_personnel: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Montant du pret sollicite (FCFA)</Label>
                    <Input type="number" value={formData.montant_pret_sollicite} onChange={e => setFormData(prev => ({ ...prev, montant_pret_sollicite: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Duree du pret (mois)</Label>
                    <Input type="number" value={formData.duree_pret} onChange={e => setFormData(prev => ({ ...prev, duree_pret: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Banque actuelle</Label>
                    <Input value={formData.banque_actuelle} onChange={e => setFormData(prev => ({ ...prev, banque_actuelle: e.target.value }))} />
                  </div>
                </div>
              )}

              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Documents a fournir</h3>
                  {projet.documents_requis?.map((doc: DocumentRequis) => (
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
                        accept={doc.type_fichier.join(',')}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocuments(prev => ({ ...prev, [doc.id]: file }));
                          }
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
                  Precedent
                </Button>
                {formStep < 4 ? (
                  <Button onClick={() => setFormStep(prev => prev + 1)} className="text-white" style={{ backgroundColor: colors.primary }}>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFormSubmit}
                    disabled={creatingCandidat}
                    className="text-white"
                    style={{ backgroundColor: colors.primary }}
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
