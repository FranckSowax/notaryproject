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
  CircleAlert,
  Briefcase,
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
import type { DocumentRequis, DocumentFourni, Produit } from '@/types';

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

const SITUATIONS_MATRIMONIALES = [
  { value: 'celibataire', label: 'Celibataire' },
  { value: 'marie', label: 'Marie(e)' },
  { value: 'union_libre', label: 'Union libre' },
  { value: 'divorce', label: 'Divorce(e)' },
  { value: 'veuf', label: 'Veuf/Veuve' },
] as const;

const CATEGORIES_SOCIOPRO = [
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'salarie_prive', label: 'Salarie du prive' },
  { value: 'commercant', label: 'Commercant / Entrepreneur' },
  { value: 'profession_liberale', label: 'Profession liberale' },
  { value: 'retraite', label: 'Retraite(e)' },
  { value: 'etudiant', label: 'Etudiant(e)' },
  { value: 'sans_emploi', label: 'Sans emploi' },
  { value: 'autre', label: 'Autre' },
] as const;

const TRANCHES_REVENUS = [
  { value: '0-300000', label: 'Moins de 300 000 FCFA' },
  { value: '300000-500000', label: '300 000 - 500 000 FCFA' },
  { value: '500000-1000000', label: '500 000 - 1 000 000 FCFA' },
  { value: '1000000-1500000', label: '1 000 000 - 1 500 000 FCFA' },
  { value: '1500000+', label: 'Plus de 1 500 000 FCFA' },
] as const;

// Documents de base toujours requis
const DOCUMENTS_BASE = [
  { id: 'acte_naissance', nom: 'Acte de naissance legalise', obligatoire: true },
  { id: 'piece_identite', nom: "Piece d'identite (CNI ou Passeport)", obligatoire: true },
];

// Documents conditionnels selon la situation matrimoniale
function getDocumentsParSituation(situation: string) {
  const docs = [...DOCUMENTS_BASE];

  if (situation === 'marie' || situation === 'union_libre') {
    docs.push({ id: 'acte_mariage', nom: 'Acte de mariage', obligatoire: true });
    docs.push({ id: 'livret_famille', nom: 'Livret de famille', obligatoire: true });
  }

  if (situation === 'divorce') {
    docs.push({ id: 'jugement_divorce', nom: 'Jugement de divorce', obligatoire: true });
  }

  if (situation === 'veuf') {
    docs.push({ id: 'acte_deces', nom: 'Acte de deces du conjoint', obligatoire: true });
    docs.push({ id: 'livret_famille', nom: 'Livret de famille', obligatoire: false });
  }

  return docs;
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
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lightbox galerie
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Produits (parcelles) du projet
  const produits: Produit[] = useMemo(() => {
    const meta = (projet as any)?.metadata as Record<string, any> | null | undefined;
    return (meta?.produits as Produit[]) || [];
  }, [projet]);
  const hasProduits = produits.length > 0;

  // Formulaire candidature - 3 etapes
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedProduit, setSelectedProduit] = useState<string>('');
  const [formData, setFormData] = useState({
    // Etape 1 - Informations personnelles
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Gabonaise',
    situation_familiale: '',
    email: '',
    telephone: '',
    whatsapp: '',
    adresse: '',
    ville: '',
    code_postal: '',
    // Etape 2 - Situation professionnelle
    profession: '',
    employeur: '',
    categorie_sociopro: '',
    tranche_revenus: '',
    type_contrat: 'cdi',
    anciennete_emploi: '',
    revenus_mensuels: '',
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

  const chatSessionId = useRef('session-' + Date.now());

  const buildSystemPrompt = (): string => {
    if (!projet) return '';
    const p = projet as any;
    const meta = p.metadata as Record<string, any> | null;

    const docs = (p.documents_requis || [])
      .map((d: DocumentRequis) => `- ${d.nom}${d.obligatoire ? ' (obligatoire)' : ' (facultatif)'}${d.description ? ': ' + d.description : ''}`)
      .join('\n') || 'Non renseigne';

    const conditions = p.conditions_eligibilite?.length
      ? p.conditions_eligibilite.map((c: string) => `- ${c}`).join('\n')
      : 'Non renseigne';

    const produits = (meta?.produits || []).length
      ? (meta?.produits || []).map((pr: Produit) => `- ${pr.nom}: ${pr.surface} m2, ${formatFCFA(pr.prix)}${pr.description ? ' - ' + pr.description : ''}`).join('\n')
      : '';

    return `Tu es l'assistant virtuel de l'etude notariale qui gere le projet immobilier "${p.titre}". Tu reponds aux questions des visiteurs de maniere professionnelle, chaleureuse et concise en francais.

INFORMATIONS DU PROJET:
- Titre: ${p.titre || 'Non renseigne'}
- Description: ${p.description || 'Non renseigne'}
- Type de bien: ${p.type_bien || 'Non renseigne'}
- Prix: ${p.prix ? formatFCFA(p.prix) : 'Non renseigne'}
- Surface: ${p.surface ? p.surface + ' m2' : 'Non renseigne'}
- Nombre de pieces: ${p.nb_pieces || 'Non renseigne'}
- Nombre de chambres: ${p.nb_chambres || 'Non renseigne'}
- Adresse: ${p.adresse || 'Non renseigne'}${p.quartier ? ', ' + p.quartier : ''}, ${p.ville || 'Non renseigne'}
- Contact email: ${p.contact_email || 'Non renseigne'}
- Contact telephone: ${p.contact_phone || 'Non renseigne'}
${meta?.lien_localisation || p.lien_localisation ? `- Localisation: ${meta?.lien_localisation || p.lien_localisation}` : ''}

${produits ? `PARCELLES / OFFRES DISPONIBLES:\n${produits}` : ''}

DOCUMENTS REQUIS POUR L'INSCRIPTION:
${docs}

CONDITIONS D'ELIGIBILITE:
${conditions}

REGLES:
- Reponds UNIQUEMENT a partir des informations ci-dessus. Ne fabrique jamais d'informations.
- Si tu ne connais pas la reponse, dis-le honnetement et invite le visiteur a contacter le cabinet directement.
- Encourage les visiteurs a s'inscrire via le formulaire sur la page.
- Sois concis (2-4 phrases maximum par reponse).
- Ne reponds qu'aux questions liees au projet immobilier. Pour toute autre question, redirige poliment vers le sujet du projet.
- Utilise un ton professionnel mais accessible.`;
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !projet || chatLoading) return;

    const userMessage = chatInput.trim();
    const currentMessages = [...chatMessages, { role: 'user' as const, message: userMessage }];
    setChatMessages(currentMessages);
    setChatInput('');
    setChatLoading(true);

    // Save user message
    supabase.from('chatbot_messages').insert({
      projet_id: projet.id,
      role: 'user',
      message: userMessage,
      session_id: chatSessionId.current,
    } as any);

    try {
      const p = projet as any;
      const meta = p.metadata as Record<string, any> | null;
      const projetContext = {
        titre: p.titre || '',
        description: p.description || '',
        type_bien: p.type_bien || '',
        prix: p.prix,
        surface: p.surface,
        nb_pieces: p.nb_pieces,
        nb_chambres: p.nb_chambres,
        adresse: p.adresse || '',
        ville: p.ville || '',
        quartier: p.quartier || '',
        contact_email: p.contact_email || '',
        contact_phone: p.contact_phone || '',
        conditions_eligibilite: p.conditions_eligibilite || [],
        documents_requis: (p.documents_requis || []).map((d: DocumentRequis) => ({
          nom: d.nom, description: d.description || '', obligatoire: d.obligatoire,
        })),
        produits: (meta?.produits || []).map((pr: Produit) => ({
          nom: pr.nom, surface: pr.surface, prix: pr.prix, description: pr.description || '',
        })),
        lien_localisation: meta?.lien_localisation || p.lien_localisation || '',
      };

      let reply: string;

      // Try Netlify function first (production), then direct OpenAI call (local dev)
      const netlifyRes = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation: currentMessages.slice(-20),
          projet: projetContext,
        }),
      }).catch(() => null);

      if (netlifyRes && netlifyRes.ok) {
        const data = await netlifyRes.json();
        reply = data.response;
      } else {
        // Fallback: direct OpenAI call (local dev)
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
        if (!apiKey) throw new Error('No API key');

        const openaiMessages = [
          { role: 'system' as const, content: buildSystemPrompt() },
          ...currentMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-20)
            .map(m => ({ role: m.role as 'user' | 'assistant', content: m.message })),
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 300, messages: openaiMessages }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content || 'Desole, je n\'ai pas pu generer une reponse.';
      }

      setChatMessages(prev => [...prev, { role: 'assistant', message: reply }]);

      supabase.from('chatbot_messages').insert({
        projet_id: projet.id,
        role: 'assistant',
        message: reply,
        session_id: chatSessionId.current,
      } as any);
    } catch (err) {
      console.error('[Chatbot] Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', message: 'Desole, le service est temporairement indisponible. Veuillez contacter directement le cabinet.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand on modifie le champ
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (hasProduits && !selectedProduit) errors.selectedProduit = 'Veuillez choisir une parcelle';
      if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
      if (!formData.prenom.trim()) errors.prenom = 'Le prenom est requis';
      if (!formData.date_naissance) errors.date_naissance = 'La date de naissance est requise';
      if (!formData.lieu_naissance.trim()) errors.lieu_naissance = 'Le lieu de naissance est requis';
      if (!formData.situation_familiale) errors.situation_familiale = 'La situation matrimoniale est requise';
      if (!formData.email.trim()) errors.email = "L'email est requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "L'email n'est pas valide";
      if (!formData.telephone.trim()) errors.telephone = 'Le telephone est requis';
      else if (!/^(?:[+\d\s().-]){8,}$/.test(formData.telephone)) errors.telephone = 'Numero de telephone invalide';
    }

    if (step === 2) {
      if (!formData.profession.trim()) errors.profession = 'La profession est requise';
      if (!formData.categorie_sociopro) errors.categorie_sociopro = 'La categorie est requise';
      if (!formData.tranche_revenus) errors.tranche_revenus = 'La tranche de revenus est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => prev + 1);
    }
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

      // Extraire le montant moyen de la tranche de revenus pour revenus_mensuels
      const revenusMap: Record<string, number> = {
        '0-300000': 150000,
        '300000-500000': 400000,
        '500000-1000000': 750000,
        '1000000-1500000': 1250000,
        '1500000+': 2000000,
      };

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
        revenus_mensuels: revenusMap[formData.tranche_revenus] || parseFloat(formData.revenus_mensuels) || 0,
        type_contrat: formData.type_contrat as any,
        anciennete_emploi: formData.anciennete_emploi,
        apport_personnel: parseFloat(formData.apport_personnel) || 0,
        montant_pret_sollicite: parseFloat(formData.montant_pret_sollicite) || 0,
        duree_pret: parseInt(formData.duree_pret) || 0,
        banque_actuelle: formData.banque_actuelle,
        documents: documentsFournis,
        statut: 'nouveau' as const,
        notes: `${selectedProduit ? 'Produit choisi: ' + (produits.find(pr => pr.id === selectedProduit)?.nom || selectedProduit) + ' | ' : ''}Categorie socio-pro: ${formData.categorie_sociopro} | Tranche revenus: ${formData.tranche_revenus}${formData.whatsapp ? ' | WhatsApp: ' + formData.whatsapp : ''}`,
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

  // Documents conditionnels pour l'etape 3 du formulaire
  const documentsFormulaire = getDocumentsParSituation(formData.situation_familiale);

  // Composant champ avec erreur
  const FieldError = ({ field }: { field: string }) =>
    formErrors[field] ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <CircleAlert className="w-3 h-3" />
        {formErrors[field]}
      </p>
    ) : null;

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
            {hasProduits && (
              <a href="#parcelles" className="hover:text-slate-900 transition">Parcelles</a>
            )}
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

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${colors.primary}15` }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${colors.secondary}15` }} />

        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                  {projet.type_bien === 'terrain' ? <Trees className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  {typeBienLabel} {!hasProduits && projet.surface > 0 && `— ${projet.surface} m2`}
                  {hasProduits && `— ${produits.length} offre${produits.length > 1 ? 's' : ''} disponible${produits.length > 1 ? 's' : ''}`}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    {projet.titre}
                  </span>
                </h1>

                {hasProduits ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-slate-500">A partir de</span>
                    <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                      {formatFCFA(Math.min(...produits.map(pr => pr.prix)))}
                    </span>
                  </div>
                ) : projet.prix > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold" style={{ color: colors.primary }}>{formatFCFA(projet.prix)}</span>
                  </div>
                ) : null}

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

      {/* ========== SECTION PARCELLES / PRODUITS ========== */}
      {hasProduits && (
        <section id="parcelles" className="py-24" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Nos offres</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">Choisissez la parcelle qui correspond a vos besoins.</p>
            </div>

            <div className={`grid gap-8 ${produits.length === 1 ? 'max-w-lg mx-auto' : produits.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {produits.map((produit) => (
                <Card key={produit.id} className="overflow-hidden border-slate-200 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                  {produit.image ? (
                    <div className="relative h-52">
                      <img src={produit.image} alt={produit.nom} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <Badge className="text-white text-sm px-3 py-1" style={{ backgroundColor: colors.primary }}>
                          {produit.surface} m2
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                      <div className="text-center text-white">
                        <Maximize className="w-10 h-10 mx-auto mb-2 opacity-80" />
                        <span className="text-2xl font-bold">{produit.surface} m2</span>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{produit.nom}</h3>
                    {produit.description && (
                      <p className="text-slate-500 text-sm mb-4">{produit.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold" style={{ color: colors.primary }}>{formatFCFA(produit.prix)}</span>
                    </div>
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                        <span>Surface : {produit.surface} m2</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                        <span>Titre foncier securise</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                        <span>Accompagnement notarial</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedProduit(produit.id);
                        setFormOpen(true);
                      }}
                      className="w-full text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      Choisir cette offre
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== DETAILS DU BIEN ========== */}
      <section id="details" className="py-24" style={hasProduits ? undefined : { background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)` }}>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Details du bien</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Toutes les informations sur ce programme immobilier.</p>
          </div>

          {/* Description du projet - deplacee ici */}
          {projet.description && (
            <div className="mb-12 border rounded-2xl p-6 max-w-4xl mx-auto" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)`, borderColor: `${colors.primary}20` }}>
              <div className="flex items-start gap-4">
                <div className="w-1 rounded-full shrink-0 self-stretch min-h-[60px]" style={{ backgroundColor: colors.primary }} />
                <p className="text-slate-700 text-lg leading-relaxed">
                  {projet.description}
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
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

              {/* Documents requis - affichage conditionnel */}
              <Card className="shadow-lg border-slate-200">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6" style={{ color: colors.primary }} />
                    Pieces a fournir
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">Documents requis en format numerique :</p>

                  <div className="space-y-3">
                    {DOCUMENTS_BASE.map((doc, i) => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                          <span className="font-bold" style={{ color: colors.primary }}>{i + 1}</span>
                        </div>
                        <span className="text-slate-700 font-medium">{doc.nom}</span>
                        <Badge className="ml-auto text-white text-xs" style={{ backgroundColor: colors.primary }}>
                          Obligatoire
                        </Badge>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-100">
                        <span className="font-bold text-amber-700">3</span>
                      </div>
                      <div>
                        <span className="text-slate-700 font-medium">Acte de mariage / Livret de famille</span>
                        <p className="text-xs text-amber-600 mt-0.5">Si concerne selon votre situation matrimoniale</p>
                      </div>
                      <Badge className="ml-auto text-xs bg-amber-100 text-amber-700 border-amber-300">
                        Conditionnel
                      </Badge>
                    </div>
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
            &copy; {new Date().getFullYear()} {projet.titre}. Tous droits reserves. Propulse par PPEO.
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
              {chatLoading && (
                <div className="bg-slate-100 text-slate-500 mr-8 rounded-2xl rounded-bl-md p-3 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ecrivez votre message..."
                onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                className="rounded-xl"
                disabled={chatLoading}
              />
              <Button
                size="icon"
                onClick={handleChatSubmit}
                className="text-white rounded-xl"
                style={{ backgroundColor: colors.primary }}
                disabled={chatLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ========== FORMULAIRE D'ACQUISITION (3 etapes style Bolokoboue) ========== */}
      <Dialog open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) {
          setFormStep(1);
          setFormErrors({});
          if (!hasProduits) setSelectedProduit('');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              Formulaire d'Acquisition
            </DialogTitle>
            <p className="text-slate-500 text-sm mt-1">{projet.titre}</p>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}15` }}>
                <CheckCircle className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Inscription envoyee avec succes !</h3>
              <p className="text-slate-500 mb-2">Votre dossier a bien ete enregistre.</p>
              <p className="text-slate-400 text-sm">Nous vous contacterons dans les plus brefs delais pour la suite de la procedure.</p>
              <Button className="mt-6 text-white" onClick={() => setFormOpen(false)} style={{ backgroundColor: colors.primary }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Indicateur de progression */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex-1 flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                          step < formStep
                            ? 'text-white'
                            : step === formStep
                            ? 'text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                        style={step <= formStep ? { backgroundColor: colors.primary } : undefined}
                      >
                        {step < formStep ? <CheckCircle className="w-4 h-4" /> : step}
                      </div>
                      {step < 3 && (
                        <div
                          className="flex-1 h-1 rounded-full transition-colors"
                          style={{ backgroundColor: step < formStep ? colors.primary : '#e2e8f0' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold" style={{ color: colors.primary }}>Etape {formStep} sur 3</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-500">
                    {formStep === 1 && 'Informations personnelles'}
                    {formStep === 2 && 'Situation professionnelle'}
                    {formStep === 3 && 'Pieces justificatives'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400">
                Veuillez remplir le formulaire ci-dessous pour initier votre demande d'acquisition. Preparez vos pieces justificatives numeriques avant de commencer.
              </p>

              {/* ===== ETAPE 1 : Informations personnelles ===== */}
              {formStep === 1 && (
                <div className="space-y-5">
                  {/* Selection du produit si multi-produits */}
                  {hasProduits && (
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 mb-3">
                        <Maximize className="w-5 h-5" style={{ color: colors.primary }} />
                        Choix de la parcelle *
                      </h3>
                      <div className={`grid gap-3 ${produits.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                        {produits.map(produit => (
                          <button
                            key={produit.id}
                            type="button"
                            onClick={() => setSelectedProduit(produit.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedProduit === produit.id
                                ? 'shadow-lg'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            style={selectedProduit === produit.id ? { borderColor: colors.primary, backgroundColor: `${colors.primary}08` } : undefined}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800">{produit.nom}</span>
                              {selectedProduit === produit.id && (
                                <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{produit.surface} m2</p>
                            <p className="font-bold mt-1" style={{ color: colors.primary }}>{formatFCFA(produit.prix)}</p>
                          </button>
                        ))}
                      </div>
                      {formErrors.selectedProduit && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <CircleAlert className="w-3 h-3" />
                          {formErrors.selectedProduit}
                        </p>
                      )}
                    </div>
                  )}

                  <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <User className="w-5 h-5" style={{ color: colors.primary }} />
                    Informations personnelles
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700">Nom *</Label>
                      <Input
                        value={formData.nom}
                        onChange={e => updateField('nom', e.target.value)}
                        placeholder="Votre nom de famille"
                        className={formErrors.nom ? 'border-red-400' : ''}
                      />
                      <FieldError field="nom" />
                    </div>
                    <div>
                      <Label className="text-slate-700">Prenom *</Label>
                      <Input
                        value={formData.prenom}
                        onChange={e => updateField('prenom', e.target.value)}
                        placeholder="Votre prenom"
                        className={formErrors.prenom ? 'border-red-400' : ''}
                      />
                      <FieldError field="prenom" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700">Date de naissance *</Label>
                      <Input
                        type="date"
                        value={formData.date_naissance}
                        onChange={e => updateField('date_naissance', e.target.value)}
                        className={formErrors.date_naissance ? 'border-red-400' : ''}
                      />
                      <FieldError field="date_naissance" />
                    </div>
                    <div>
                      <Label className="text-slate-700">Lieu de naissance *</Label>
                      <Input
                        value={formData.lieu_naissance}
                        onChange={e => updateField('lieu_naissance', e.target.value)}
                        placeholder="Ex: Libreville"
                        className={formErrors.lieu_naissance ? 'border-red-400' : ''}
                      />
                      <FieldError field="lieu_naissance" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700">Situation matrimoniale *</Label>
                    <select
                      value={formData.situation_familiale}
                      onChange={e => updateField('situation_familiale', e.target.value)}
                      className={`w-full h-10 px-3 rounded-md border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        formErrors.situation_familiale ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-slate-400'
                      }`}
                    >
                      <option value="">Selectionnez votre situation</option>
                      {SITUATIONS_MATRIMONIALES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <FieldError field="situation_familiale" />
                    {formData.situation_familiale && (
                      <p className="text-xs mt-1.5 px-2 py-1 rounded bg-blue-50 text-blue-600">
                        {formData.situation_familiale === 'celibataire' && "Aucun document supplementaire requis pour votre situation."}
                        {formData.situation_familiale === 'marie' && "Vous devrez fournir votre acte de mariage et livret de famille a l'etape 3."}
                        {formData.situation_familiale === 'union_libre' && "Vous devrez fournir votre acte de mariage et livret de famille a l'etape 3."}
                        {formData.situation_familiale === 'divorce' && "Vous devrez fournir votre jugement de divorce a l'etape 3."}
                        {formData.situation_familiale === 'veuf' && "Vous devrez fournir l'acte de deces du conjoint a l'etape 3."}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        placeholder="votre@email.com"
                        className={formErrors.email ? 'border-red-400' : ''}
                      />
                      <FieldError field="email" />
                    </div>
                    <div>
                      <Label className="text-slate-700">Telephone *</Label>
                      <Input
                        value={formData.telephone}
                        onChange={e => updateField('telephone', e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className={formErrors.telephone ? 'border-red-400' : ''}
                      />
                      <FieldError field="telephone" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700">WhatsApp <span className="text-slate-400 font-normal">(optionnel, si different du telephone)</span></Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={e => updateField('whatsapp', e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700">Adresse actuelle</Label>
                    <Input
                      value={formData.adresse}
                      onChange={e => updateField('adresse', e.target.value)}
                      placeholder="Votre adresse de residence"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-700">Ville / Pays</Label>
                      <Input
                        value={formData.ville}
                        onChange={e => updateField('ville', e.target.value)}
                        placeholder="Ex: Libreville, Gabon"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700">Nationalite</Label>
                      <Input
                        value={formData.nationalite}
                        onChange={e => updateField('nationalite', e.target.value)}
                        placeholder="Gabonaise"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== ETAPE 2 : Situation professionnelle ===== */}
              {formStep === 2 && (
                <div className="space-y-5">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-5 h-5" style={{ color: colors.primary }} />
                    Situation professionnelle
                  </h3>

                  <div>
                    <Label className="text-slate-700">Profession *</Label>
                    <Input
                      value={formData.profession}
                      onChange={e => updateField('profession', e.target.value)}
                      placeholder="Ex: Ingenieur, Enseignant, Medecin..."
                      className={formErrors.profession ? 'border-red-400' : ''}
                    />
                    <FieldError field="profession" />
                  </div>

                  <div>
                    <Label className="text-slate-700">Entreprise / Employeur</Label>
                    <Input
                      value={formData.employeur}
                      onChange={e => updateField('employeur', e.target.value)}
                      placeholder="Nom de votre employeur ou entreprise"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700">Categorie socio-professionnelle *</Label>
                    <select
                      value={formData.categorie_sociopro}
                      onChange={e => updateField('categorie_sociopro', e.target.value)}
                      className={`w-full h-10 px-3 rounded-md border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        formErrors.categorie_sociopro ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-slate-400'
                      }`}
                    >
                      <option value="">Selectionnez votre categorie</option>
                      {CATEGORIES_SOCIOPRO.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <FieldError field="categorie_sociopro" />
                  </div>

                  <div>
                    <Label className="text-slate-700">Revenus annuels *</Label>
                    <select
                      value={formData.tranche_revenus}
                      onChange={e => updateField('tranche_revenus', e.target.value)}
                      className={`w-full h-10 px-3 rounded-md border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        formErrors.tranche_revenus ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-slate-400'
                      }`}
                    >
                      <option value="">Selectionnez votre tranche de revenus</option>
                      {TRANCHES_REVENUS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <FieldError field="tranche_revenus" />
                  </div>
                </div>
              )}

              {/* ===== ETAPE 3 : Pieces justificatives ===== */}
              {formStep === 3 && (
                <div className="space-y-5">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <Upload className="w-5 h-5" style={{ color: colors.primary }} />
                    Pieces justificatives
                  </h3>
                  <p className="text-sm text-slate-500">
                    Telechargez vos documents en format PDF ou image (JPG, PNG). Taille maximale : 10 Mo par fichier.
                  </p>

                  {formData.situation_familiale && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">
                        Documents requis pour votre situation : {SITUATIONS_MATRIMONIALES.find(s => s.value === formData.situation_familiale)?.label}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {documentsFormulaire.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-xl bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: documents[doc.id] ? `${colors.primary}15` : '#f1f5f9' }}
                            >
                              {documents[doc.id] ? (
                                <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                              ) : (
                                <FileText className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{doc.nom}</p>
                              {doc.obligatoire && (
                                <Badge className="mt-1 text-white text-xs" style={{ backgroundColor: colors.primary }}>
                                  Obligatoire
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-13">
                          <label
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                              documents[doc.id]
                                ? 'border-green-300 bg-green-50'
                                : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {documents[doc.id] ? documents[doc.id].name : 'Choisir un fichier'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setDocuments(prev => ({ ...prev, [doc.id]: file }));
                                }
                              }}
                            />
                          </label>
                          {documents[doc.id] && (
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Fichier selectionne ({(documents[doc.id].size / 1024 / 1024).toFixed(2)} Mo)
                              </p>
                              <button
                                type="button"
                                onClick={() => setDocuments(prev => {
                                  const next = { ...prev };
                                  delete next[doc.id];
                                  return next;
                                })}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Documents supplementaires du projet */}
                  {docsRequis.length > 0 && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-3">Documents supplementaires demandes par le projet :</p>
                      </div>
                      {docsRequis.map((doc: DocumentRequis) => (
                        <div key={doc.id} className="p-4 border rounded-xl bg-white">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: documents[doc.id] ? `${colors.primary}15` : '#f1f5f9' }}
                            >
                              {documents[doc.id] ? (
                                <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                              ) : (
                                <FileText className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{doc.nom}</p>
                              {doc.description && <p className="text-xs text-slate-400">{doc.description}</p>}
                              {doc.obligatoire && (
                                <Badge className="mt-1 text-white text-xs" style={{ backgroundColor: colors.primary }}>
                                  Obligatoire
                                </Badge>
                              )}
                            </div>
                          </div>
                          <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                            documents[doc.id]
                              ? 'border-green-300 bg-green-50'
                              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                          }`}>
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                              {documents[doc.id] ? documents[doc.id].name : 'Choisir un fichier'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) setDocuments(prev => ({ ...prev, [doc.id]: file }));
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Navigation entre etapes */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                  disabled={formStep === 1}
                >
                  Precedent
                </Button>
                {formStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
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
                    {creatingCandidat ? 'Envoi en cours...' : "Envoyer mon dossier"}
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
