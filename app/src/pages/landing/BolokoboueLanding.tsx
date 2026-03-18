import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Home,
  CheckCircle,
  FileText,
  Send,
  MessageCircle,
  X,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  TrendingUp,
  Scale,
  ArrowRight,
  User,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProjetBySlug, useCreateCandidat } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

// Images du projet Bolokoboué
const BANNER_IMAGE = '/parcelle1.jpg';
const PARCELLE_IMAGE = '/parcelle2.jpg';

export function BolokoboueLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { loading: projetLoading } = useProjetBySlug(slug || '');
  const { createCandidat, loading: creatingCandidat } = useCreateCandidat();

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', message: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

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
    nationalite: 'Gabonaise',
    situation_familiale: 'celibataire',
    adresse: '',
    ville: '',
    code_postal: '',
    profession: '',
    employeur: '',
    revenus_mensuels: '',
    type_contrat: 'cdi',
    parcelle_choisie: '525',
  });
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [numeroDossier, setNumeroDossier] = useState('');

  // Initialize chatbot
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{ 
        role: 'assistant', 
        message: 'Bonjour ! Je suis là pour vous aider avec votre candidature au Programme Bolokoboué. Comment puis-je vous assister ?' 
      }]);
    }
  }, []);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');

    // Simple chatbot responses
    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('prix') || lowerMessage.includes('cout') || lowerMessage.includes('fcfa')) {
      response = 'Nous proposons deux types de parcelles :\n• Parcelle Standard (525 m²) : 5 244 691 FCFA\n• Grande Parcelle (1050 m²) : 9 455 364 FCFA\nLes prix sont tout frais inclus (enregistrement, transcription, notaire).';
    } else if (lowerMessage.includes('document') || lowerMessage.includes('piece')) {
      response = 'Les documents requis sont :\n1. Acte de naissance légalisé\n2. Pièce d\'identité\n3. Acte de mariage (si concerné)\n4. Livret de famille (si nécessaire)';
    } else if (lowerMessage.includes('localisation') || lowerMessage.includes('adresse') || lowerMessage.includes('ou')) {
      response = 'Le lotissement Bolokoboué est situé à Akanda, Cap Esterias, au Lieu-dit Bolokoboué.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('joindre') || lowerMessage.includes('telephone')) {
      response = 'Vous pouvez nous contacter :\n• Email : lotisbolokoboue@etudeogoula241.com\n• Téléphone : +241 62 57 91 72\n• Adresse : Boulevard de la Nation, Immeuble Hollando, 6ème étage, Libreville';
    } else if (lowerMessage.includes('delai') || lowerMessage.includes('temps')) {
      response = 'Le délai de traitement des candidatures dépend du nombre de demandes. Notre office notarial vous contactera dans les plus brefs délais après votre inscription.';
    } else if (lowerMessage.includes('titre foncier') || lowerMessage.includes('securite')) {
      response = 'Oui, chaque parcelle fait l\'objet d\'un Titre Foncier sécurisé remis en fin de procédure par l\'office notarial.';
    } else {
      response = 'Je comprends. Pour plus d\'informations, je vous invite à remplir le formulaire de candidature ou à contacter directement notre office notarial au +241 62 57 91 72.';
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', message: response }]);
    }, 500);
  };

  const handleFormSubmit = async () => {
    try {
      // Upload documents
      const documentsFournis: any[] = [];
      for (const [docId, file] of Object.entries(documents)) {
        const path = `documents/bolokoboue/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('candidats')
          .upload(path, file);
        
        if (!error && data) {
          const { data: signedData } = await supabase.storage.from('candidats').createSignedUrl(data.path, 60 * 60 * 24 * 365);
          const fileUrl = signedData?.signedUrl || supabase.storage.from('candidats').getPublicUrl(data.path).data.publicUrl;

          documentsFournis.push({
            id: Date.now().toString(),
            type_document_id: docId,
            nom_fichier: file.name,
            url_fichier: fileUrl,
            date_upload: new Date().toISOString(),
            statut: 'en_attente',
            commentaire: '',
          });
        }
      }

      // Generer numero de dossier
      const now = new Date();
      const yy = String(now.getFullYear()).slice(2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const rand = String(Math.floor(1000 + Math.random() * 9000));
      const numDossier = `PPEO-${yy}${mm}${dd}-${rand}`;

      // Create candidat
      const candidatData = {
        projet_id: 'bolokoboue-projet-id',
        numero_dossier: numDossier,
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
        notes: `Parcelle choisie: ${formData.parcelle_choisie}m²`,
        documents: documentsFournis,
        statut: 'nouveau' as const,
      };

      await createCandidat(candidatData);
      setNumeroDossier(numDossier);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  if (projetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-stone-50/95 backdrop-blur-lg border-b border-stone-200/50">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Programme Immobilier Bolokoboué</span>
          </div>
          
          <div className="hidden xl:flex items-center px-4 py-1.5 bg-amber-100 rounded-full border border-amber-200">
            <span className="text-amber-900 text-sm font-bold tracking-wide uppercase">Un Gabonais, Un Terrain</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#presentation" className="hover:text-amber-800 transition">Le Programme</a>
            <a href="#parcelles" className="hover:text-amber-800 transition">Parcelles</a>
            <a href="#conditions" className="hover:text-amber-800 transition">Conditions</a>
            <a href="#contact" className="hover:text-amber-800 transition">Contact</a>
          </nav>
          
          <Button 
            onClick={() => setFormOpen(true)}
            className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white"
          >
            S'inscrire
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-stone-200/40 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto max-w-7xl">
          {/* Quote Box */}
          <div className="mb-12 bg-gradient-to-r from-stone-50 to-amber-50 border border-amber-100 rounded-2xl p-6 max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="w-1 bg-amber-600 h-full rounded-full shrink-0 self-stretch min-h-[80px]"></div>
              <div>
                <p className="text-stone-700 text-lg leading-relaxed italic">
                  <>Ce projet s'inscrit dans la volonté et l'engagement du Président de la République Gabonaise, Son Excellence <strong>Brice Clotaire OLIGUI NGUEMA</strong>, de faciliter l'accession à la propriété foncière pour l'ensemble des Gabonais.<br /><br />Par le biais de ces initiatives inédites qui ont vocation à s'étendre sur l'ensemble du territoire, tout Gabonais qui le désire peut désormais être titulaire d'une parcelle de terrain faisant l'objet d'un Titre Foncier.</>
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-sm font-medium text-amber-900">
                  <Home className="w-4 h-4" />
                  500 parcelles disponibles (Phase 1)
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-stone-800 via-amber-700 to-stone-800 bg-clip-text text-transparent">Acquérir une parcelle de terrain</span>
                  <br />
                  <span className="text-amber-800">dans le lotissement BOLOKOBOUE</span>
                </h1>
                
                <p className="text-xl text-stone-600 leading-relaxed">
                  Situé à <strong>Akanda, Cap Esterias</strong>, développé par <strong>SCI OVONO ET FILS</strong>, signataire d'une convention de partenariat avec l'État Gabonais (ANUTTC). Bâtissez votre avenir.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg"
                    onClick={() => setFormOpen(true)}
                    className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white text-lg"
                  >
                    S'inscrire
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('parcelles')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Découvrir les offres
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-stone-500">
                <MapPin className="w-5 h-5 text-amber-700" />
                <span>Akanda, Cap Esterias</span>
                <span className="w-1 h-1 bg-stone-400 rounded-full"></span>
                <span>Lieu-dit Bolokoboué</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={BANNER_IMAGE} alt="Vue aérienne du lotissement Bolokoboué" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-stone-100 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">500+</p>
                    <p className="text-sm text-stone-500">Parcelles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Presentation Section */}
      <section id="presentation" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">Pourquoi Investir à Bolokoboué ?</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">Emplacement stratégique, parcelles viabilisées et accompagnement notarial de confiance.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Emplacement Premium</h3>
                <p className="text-stone-600">Proximité commodités et axes routiers</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Sécurité Juridique</h3>
                <p className="text-stone-600">Titre Foncier remis en fin de procédure</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Valorisation</h3>
                <p className="text-stone-600">Zone en plein développement</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3">Accompagnement</h3>
                <p className="text-stone-600">Procédure d'acquisition sécurisée par l'Office Notarial</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Parcelles Section */}
      <section id="parcelles" className="py-24 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">Choisissez Votre Parcelle</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">Deux superficies adaptées : résidence familiale ou projet d'envergure.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Parcelle Standard */}
            <Card className="overflow-hidden border-stone-200 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="relative h-64">
                <img src={PARCELLE_IMAGE} alt="Parcelle Standard 525m²" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-stone-800">525 m²</span>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">Parcelle Standard</h3>
                <p className="text-stone-500 mb-6">Résidence familiale</p>
                
                <div className="mb-6">
                  <p className="text-sm text-stone-500 mb-1">Prix Tout Frais Inclus</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-700">5 244 691</span>
                    <span className="text-xl text-stone-600">FCFA</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <p className="text-sm font-medium text-stone-700">Inclus :</p>
                  <ul className="space-y-2">
                    {['Droits d\'enregistrement', 'Taxe de transcription', 'Frais et honoraires notariaux', 'Régularisation ANUTTC incluse', 'Bornage et viabilisation', 'Titre foncier sécurisé'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-stone-600">
                        <CheckCircle className="w-4 h-4 text-amber-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => { setFormData(prev => ({ ...prev, parcelle_choisie: '525' })); setFormOpen(true); }}
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white"
                >
                  S'inscrire
                </Button>
              </CardContent>
            </Card>
            
            {/* Parcelle Premium */}
            <Card className="overflow-hidden border-2 border-amber-400 hover:shadow-2xl transition-all hover:-translate-y-1 relative">
              <Badge className="absolute top-4 right-4 bg-amber-500 text-white z-10">PREMIUM</Badge>
              <div className="relative h-64">
                <img src={BANNER_IMAGE} alt="Grande Parcelle 1050m²" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-stone-800">1050 m²</span>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">Grande Parcelle</h3>
                <p className="text-stone-500 mb-6">Projets d'envergure</p>
                
                <div className="mb-6">
                  <p className="text-sm text-stone-500 mb-1">Prix Tout Frais Inclus</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-700">9 455 364</span>
                    <span className="text-xl text-stone-600">FCFA</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  <p className="text-sm font-medium text-stone-700">Inclus :</p>
                  <ul className="space-y-2">
                    {['Droits d\'enregistrement', 'Taxe de transcription', 'Frais et honoraires notariaux', 'Régularisation ANUTTC incluse', 'Bornage et viabilisation', 'Titre foncier sécurisé'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-stone-600">
                        <CheckCircle className="w-4 h-4 text-amber-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => { setFormData(prev => ({ ...prev, parcelle_choisie: '1050' })); setFormOpen(true); }}
                  className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white"
                >
                  S'inscrire
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section id="conditions" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">Comprendre Votre Investissement</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">Transparence et sécurité à chaque étape de votre acquisition.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-3xl p-8 border border-amber-100 mb-8">
                <h3 className="text-2xl font-bold text-stone-800 mb-4">Une Ville Nouvelle</h3>
                <p className="text-stone-600 leading-relaxed">
                  La livraison de ces <strong className="text-amber-700">500 parcelles</strong> participe à la création d'un lotissement moderne, voire d'une véritable ville nouvelle dotée de toutes les commodités nécessaires.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-stone-800 mb-4">Conditions d'Acquisition</h4>
                {['Prix tout frais inclus (Enregistrement, Transcription, Notaire)', 'Régularisation ANUTTC incluse', 'Documents requis pour finaliser'].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-amber-700" />
                    </div>
                    <p className="text-stone-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="shadow-lg border-stone-200">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-amber-700" />
                  Pièces à Fournir
                </h4>
                <p className="text-sm text-stone-500 mb-6">Documents requis en format numérique :</p>
                <p className="text-xs text-stone-400 mb-6 italic">* En remplissant le formulaire en ligne, vous n'avez pas besoin de joindre le formulaire d'état civil.</p>
                
                <div className="space-y-4">
                  {[
                    'Acte de naissance légalisé',
                    'Pièce d\'identité',
                    'Acte de mariage (si concerné)',
                    'Livret de famille (si nécessaire)'
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="font-bold text-amber-700">{i + 1}</span>
                      </div>
                      <span className="text-stone-700">{doc}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => setFormOpen(true)}
                  className="w-full mt-8 bg-stone-800 hover:bg-stone-900 text-white"
                >
                  Commencer mon inscription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">Contactez-Nous</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">Notre office Notarial vous accompagne dans votre projet immobilier</p>
            <p className="text-stone-500 mt-4">Pour vous inscrire contactez l'office Notarial désigné à cet effet.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-amber-700" />
                </div>
                <h4 className="font-bold text-stone-800 mb-2">Email</h4>
                <a href="mailto:lotisbolokoboue@etudeogoula241.com" className="text-amber-700 hover:text-amber-800 text-sm break-all">
                  lotisbolokoboue@etudeogoula241.com
                </a>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-amber-700" />
                </div>
                <h4 className="font-bold text-stone-800 mb-2">Téléphone</h4>
                <a href="tel:+24162579172" className="text-amber-700 hover:text-amber-800">
                  +241 62 57 91 72
                </a>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-amber-700" />
                </div>
                <h4 className="font-bold text-stone-800 mb-2">Adresse</h4>
                <p className="text-stone-600 text-sm">
                  Boulevard de la Nation<br />
                  Immeuble Hollando, 6ème étage<br />
                  LIBREVILLE, GABON
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-amber-700" />
                </div>
                <h4 className="font-bold text-stone-800 mb-2">Horaires</h4>
                <p className="text-stone-600 text-sm">
                  Lundi au Vendredi<br />
                  7h30 - 15h30
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              size="lg"
              onClick={() => setFormOpen(true)}
              className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white text-lg"
            >
              Démarrer mon inscription
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold">Programme Immobilier Bolokoboué</span>
            </div>
            
            <a href="/dashboard" className="text-stone-400 hover:text-white transition flex items-center gap-2">
              Accès Notaire
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            © 2025 Programme Immobilier Bolokoboué. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-full shadow-lg flex items-center justify-center hover:from-amber-800 hover:to-amber-950 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-4 flex items-center justify-between">
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
                  className={`p-3 rounded-lg text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white ml-8'
                      : 'bg-stone-100 text-stone-700 mr-8'
                  }`}
                >
                  {msg.message}
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Écrivez votre message..."
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              />
              <Button size="icon" onClick={handleChatSubmit} className="bg-amber-700 hover:bg-amber-800">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire de candidature */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Formulaire d'inscription - Bolokoboué</DialogTitle>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Inscription envoyée avec succès !
              </h3>
              {numeroDossier && (
                <div className="my-4 mx-auto max-w-xs p-4 rounded-xl border-2 border-dashed border-green-400 bg-green-50">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Votre numero de dossier</p>
                  <p className="text-2xl font-bold tracking-widest text-green-700">{numeroDossier}</p>
                  <p className="text-xs text-stone-400 mt-2">Conservez ce numero pour le suivi de votre dossier.</p>
                </div>
              )}
              <p className="text-stone-500">
                Notre office notarial vous contactera dans les plus brefs délais.
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
                      step <= formStep ? 'bg-amber-600' : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Étape 1: Informations personnelles */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label>Prénom *</Label>
                      <Input
                        value={formData.prenom}
                        onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <Label>Téléphone *</Label>
                    <Input
                      value={formData.telephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                      placeholder="+241 XX XX XX XX"
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
                        placeholder="Libreville"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Adresse et situation */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    Adresse et situation
                  </h3>
                  <div>
                    <Label>Adresse</Label>
                    <Input
                      value={formData.adresse}
                      onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                      placeholder="Votre adresse actuelle"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ville</Label>
                      <Input
                        value={formData.ville}
                        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                        placeholder="Libreville"
                      />
                    </div>
                    <div>
                      <Label>Code postal</Label>
                      <Input
                        value={formData.code_postal}
                        onChange={(e) => setFormData(prev => ({ ...prev, code_postal: e.target.value }))}
                        placeholder="BP XXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Profession</Label>
                    <Input
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Votre profession"
                    />
                  </div>
                  <div>
                    <Label>Employeur</Label>
                    <Input
                      value={formData.employeur}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeur: e.target.value }))}
                      placeholder="Nom de votre employeur"
                    />
                  </div>
                  <div>
                    <Label>Revenus mensuels nets (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.revenus_mensuels}
                      onChange={(e) => setFormData(prev => ({ ...prev, revenus_mensuels: e.target.value }))}
                      placeholder="500000"
                    />
                  </div>
                </div>
              )}

              {/* Étape 3: Choix de la parcelle */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-amber-600" />
                    Choix de la parcelle
                  </h3>
                  <div className="space-y-4">
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, parcelle_choisie: '525' }))}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition ${
                        formData.parcelle_choisie === '525' 
                          ? 'border-amber-600 bg-amber-50' 
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">Parcelle Standard</p>
                          <p className="text-stone-500">525 m² - Résidence familiale</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-700">5 244 691</p>
                          <p className="text-sm text-stone-500">FCFA</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setFormData(prev => ({ ...prev, parcelle_choisie: '1050' }))}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition ${
                        formData.parcelle_choisie === '1050' 
                          ? 'border-amber-600 bg-amber-50' 
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">Grande Parcelle <span className="text-amber-600 text-sm">PREMIUM</span></p>
                          <p className="text-stone-500">1050 m² - Projets d'envergure</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-700">9 455 364</p>
                          <p className="text-sm text-stone-500">FCFA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4: Documents */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-600" />
                    Documents à fournir
                  </h3>
                  <p className="text-sm text-stone-500">Téléchargez vos documents en format PDF ou image :</p>
                  
                  {[
                    { id: 'acte_naissance', label: 'Acte de naissance légalisé' },
                    { id: 'piece_identite', label: 'Pièce d\'identité' },
                    { id: 'acte_mariage', label: 'Acte de mariage (si concerné)', optional: true },
                    { id: 'livret_famille', label: 'Livret de famille (si nécessaire)', optional: true },
                  ].map((doc) => (
                    <div key={doc.id} className="p-4 border rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{doc.label}</p>
                          {doc.optional && <p className="text-xs text-stone-400">Optionnel</p>}
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocuments(prev => ({ ...prev, [doc.id]: file }));
                          }
                        }}
                      />
                      {documents[doc.id] && (
                        <p className="text-sm text-green-600 mt-1">
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
                  <Button 
                    onClick={() => setFormStep(prev => prev + 1)}
                    className="bg-amber-700 hover:bg-amber-800"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFormSubmit}
                    disabled={creatingCandidat}
                    className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950"
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
