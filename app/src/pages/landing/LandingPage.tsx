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
  Menu,
  Award,
  Handshake,
  ChevronRight,
  Star,
  Baby,
  ToggleRight,
  ToggleLeft,
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
import { CABINET_DEFAULT } from '@/lib/cabinetDefaults';
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

/* ── useInView hook for scroll reveal ── */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...options },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

/* ── ScrollReveal wrapper ── */
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
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

// Documents conditionnels selon la situation matrimoniale et statut mineur
function getDocumentsParSituation(situation: string, isMineur: boolean) {
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

  if (isMineur) {
    docs.push({ id: 'acte_naissance_representant', nom: 'Copie legalisee de l\'acte de naissance du representant legal', obligatoire: true });
    docs.push({ id: 'piece_identite_representant', nom: 'Copie de la piece d\'identite du representant legal', obligatoire: true });
    docs.push({ id: 'piece_identite_mineur', nom: 'Copie de la piece d\'identite du mineur', obligatoire: true });
    docs.push({ id: 'acte_naissance_mineur', nom: 'Copie legalisee de l\'acte de naissance du mineur', obligatoire: true });
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
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
  const [isMineur, setIsMineur] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Header scroll state
  const [scrolled, setScrolled] = useState(false);
  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Details tab state
  const [detailsTab, setDetailsTab] = useState<'caracteristiques' | 'documents' | 'conditions'>('caracteristiques');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        notes: `${selectedProduit ? 'Produit choisi: ' + (produits.find(pr => pr.id === selectedProduit)?.nom || selectedProduit) + ' | ' : ''}${isMineur ? 'MINEUR (representant legal) | ' : ''}Categorie socio-pro: ${formData.categorie_sociopro} | Tranche revenus: ${formData.tranche_revenus}${formData.whatsapp ? ' | WhatsApp: ' + formData.whatsapp : ''}`,
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
  const documentsFormulaire = getDocumentsParSituation(formData.situation_familiale, isMineur);

  // Composant champ avec erreur
  const FieldError = ({ field }: { field: string }) =>
    formErrors[field] ? (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <CircleAlert className="w-3 h-3" />
        {formErrors[field]}
      </p>
    ) : null;

  // Price display helper
  const displayPrice = hasProduits
    ? formatFCFA(Math.min(...produits.map(pr => pr.prix)))
    : projet.prix > 0
    ? formatFCFA(projet.prix)
    : null;

  const images: string[] = p.images || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========== HEADER - Scroll-based opacity ========== */}
      <header
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(248,250,252,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(226,232,240,0.5)' : '1px solid transparent',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              {projet.titre?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <span className={`text-xl font-bold hidden sm:block transition-colors duration-300 ${scrolled ? 'text-slate-800' : 'text-white'}`}>
              {projet.titre}
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {[
              { href: '#presentation', label: 'Le Projet' },
              ...(hasProduits ? [{ href: '#parcelles', label: 'Parcelles' }] : []),
              { href: '#details', label: 'Details' },
              ...(images.length > 0 ? [{ href: '#galerie', label: 'Galerie' }] : []),
              ...(conditionsElig.length > 0 ? [{ href: '#conditions', label: 'Conditions' }] : []),
              { href: '#contact', label: 'Contact' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors duration-300 hover:opacity-100 ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setFormOpen(true)}
              className="text-white shadow-lg hidden sm:inline-flex"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              S'inscrire
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: scrolled ? colors.primary : '#fff' }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile slide-out nav */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div
              className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl p-6 flex flex-col"
              style={{ animation: 'slideInRight 0.3s ease-out' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-slate-800">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {[
                  { href: '#presentation', label: 'Le Projet' },
                  ...(hasProduits ? [{ href: '#parcelles', label: 'Parcelles' }] : []),
                  { href: '#details', label: 'Details' },
                  ...(images.length > 0 ? [{ href: '#galerie', label: 'Galerie' }] : []),
                  ...(conditionsElig.length > 0 ? [{ href: '#conditions', label: 'Conditions' }] : []),
                  { href: '#contact', label: 'Contact' },
                ].map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: colors.primary }} />
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto">
                <Button
                  onClick={() => { setMobileMenuOpen(false); setFormOpen(true); }}
                  className="w-full text-white"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  S'inscrire
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========== HERO SECTION - Full-screen immersive ========== */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Background image */}
        {projet.banner_image ? (
          <img
            src={projet.banner_image}
            alt={projet.titre}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          />
        )}

        {/* Animated gradient orbs */}
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            backgroundColor: colors.primary,
            animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{
            backgroundColor: colors.secondary,
            animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s',
          }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero content */}
        <div className="relative w-full pb-8 pt-32">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="max-w-3xl mb-12">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-white/15 backdrop-blur-md text-white border border-white/20"
              >
                {projet.type_bien === 'terrain' ? <Trees className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                {typeBienLabel} {!hasProduits && projet.surface > 0 && `-- ${projet.surface} m\u00B2`}
                {hasProduits && `-- ${produits.length} offre${produits.length > 1 ? 's' : ''} disponible${produits.length > 1 ? 's' : ''}`}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white mb-6">
                {projet.titre}
              </h1>

              {displayPrice && (
                <div className="flex items-baseline gap-3 mb-8">
                  {hasProduits && <span className="text-lg text-white/70">A partir de</span>}
                  <span className="text-4xl sm:text-5xl font-bold text-white">{displayPrice}</span>
                  <span className="text-lg text-white/50">FCFA</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-white/80 mb-8">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{locationFull}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setFormOpen(true)}
                  className="text-white text-lg px-8 py-6 shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  S'inscrire maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6"
                >
                  Decouvrir le bien
                </Button>
              </div>
            </div>

            {/* Floating glass-morphism stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white">
                <Maximize className="w-5 h-5 mb-2 opacity-70" />
                <p className="text-2xl font-bold">{projet.surface} m&sup2;</p>
                <p className="text-sm text-white/60">Surface</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white">
                <Home className="w-5 h-5 mb-2 opacity-70" />
                <p className="text-2xl font-bold">{typeBienLabel}</p>
                <p className="text-sm text-white/60">Type de bien</p>
              </div>
              {displayPrice && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white col-span-2 sm:col-span-1">
                  <TrendingUp className="w-5 h-5 mb-2 opacity-70" />
                  <p className="text-2xl font-bold truncate">{displayPrice}</p>
                  <p className="text-sm text-white/60">{hasProduits ? 'A partir de' : 'Prix'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <ScrollReveal>
        <section className="py-8 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { icon: ShieldCheck, label: 'Notaire certifie', value: 'Garantie legale' },
                { icon: Award, label: 'Titre foncier garanti', value: 'Securise 100%' },
                { icon: Handshake, label: 'Accompagnement A-Z', value: 'Suivi complet' },
                { icon: Scale, label: '0% commission cachee', value: 'Transparence totale' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ========== POURQUOI INVESTIR - Bento grid ========== */}
      <section id="presentation" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Avantages</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Pourquoi choisir ce bien ?</h2>
              <p className="text-xl text-slate-500 max-w-3xl mx-auto">Emplacement strategique et accompagnement notarial de confiance.</p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* First card - spans 2 cols */}
            <ScrollReveal className="sm:col-span-2" delay={0}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 h-full border border-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}12, ${colors.secondary}08)`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Emplacement Premium</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {projet.ville}{p.quartier ? `, ${p.quartier}` : ''} -- une zone en plein developpement avec un fort potentiel de valorisation.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 h-full border border-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}05)`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Securite Juridique</h3>
                <p className="text-slate-600">Accompagnement notarial complet et titre foncier garanti</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 h-full border border-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}05)`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Valorisation</h3>
                <p className="text-slate-600">Zone en plein developpement economique</p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="sm:col-span-2 lg:col-span-2" delay={300}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 h-full border border-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${colors.secondary}08, ${colors.primary}05)`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-start gap-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    <Scale className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Accompagnement de A a Z</h3>
                    <p className="text-slate-600">Procedure d'acquisition securisee, de la reservation jusqu'a l'obtention de votre titre foncier. Aucune commission cachee.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="sm:col-span-2 lg:col-span-2" delay={400}>
              <div
                className="relative overflow-hidden rounded-3xl p-8 h-full border border-white/20 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}06, ${colors.secondary}10)`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-start gap-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
                    style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }}
                  >
                    <Star className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Investissement de Confiance</h3>
                    <p className="text-slate-600">Un projet porte par une etude notariale reconnue, avec une transparence totale sur les couts et les demarches.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== SECTION PARCELLES / PRODUITS - Premium ========== */}
      {hasProduits && (
        <section id="parcelles" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Offres</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Nos offres</h2>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto">Choisissez la parcelle qui correspond a vos besoins.</p>
              </div>
            </ScrollReveal>

            <div className={`grid gap-8 ${produits.length === 1 ? 'max-w-lg mx-auto' : produits.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {produits.map((produit, idx) => {
                const isPopulaire = produits.length >= 3 && idx === 1;
                return (
                  <ScrollReveal key={produit.id} delay={idx * 120}>
                    <div
                      className={`relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 group ${isPopulaire ? 'ring-2' : ''}`}
                      style={{
                        borderTopColor: colors.primary,
                        ...(isPopulaire ? { ringColor: colors.primary } : {}),
                      }}
                    >
                      {/* Populaire badge */}
                      {isPopulaire && (
                        <div
                          className="absolute top-4 right-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                        >
                          Populaire
                        </div>
                      )}

                      {produit.image ? (
                        <div className="relative h-52 overflow-hidden">
                          <img src={produit.image} alt={produit.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <Badge className="text-white text-sm px-3 py-1 backdrop-blur-sm bg-white/20 border border-white/30">
                              {produit.surface} m&sup2;
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-52 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                          <div className="text-center text-white">
                            <Maximize className="w-10 h-10 mx-auto mb-2 opacity-80" />
                            <span className="text-2xl font-bold">{produit.surface} m&sup2;</span>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{produit.nom}</h3>
                        {produit.description && (
                          <p className="text-slate-500 text-sm mb-4">{produit.description}</p>
                        )}
                        <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                            {formatFCFA(produit.prix).replace(' FCFA', '')}
                          </span>
                          <span className="text-sm font-medium text-slate-400">FCFA</span>
                        </div>
                        <div className="space-y-2 mb-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                            <span>Surface : {produit.surface} m&sup2;</span>
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
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== DETAILS DU BIEN - Tabbed approach ========== */}
      <section id="details" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Informations</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Details du bien</h2>
              <p className="text-xl text-slate-500 max-w-3xl mx-auto">Toutes les informations sur ce programme immobilier.</p>
            </div>
          </ScrollReveal>

          {/* Description du projet */}
          {projet.description && (
            <ScrollReveal>
              <div className="mb-12 border rounded-2xl p-6 max-w-4xl mx-auto" style={{ background: `linear-gradient(135deg, ${colors.primary}05, ${colors.secondary}08)`, borderColor: `${colors.primary}20` }}>
                <div className="flex items-start gap-4">
                  <div className="w-1 rounded-full shrink-0 self-stretch min-h-[60px]" style={{ backgroundColor: colors.primary }} />
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {projet.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left - Image + Price card */}
              <div className="lg:col-span-2">
                <div className="sticky top-28">
                  <Card className="overflow-hidden border-slate-200 shadow-lg">
                    {projet.banner_image && (
                      <div className="relative h-56">
                        <img src={projet.banner_image} alt={projet.titre} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-bold text-lg">{projet.titre}</p>
                          <p className="text-white/70 text-sm">{typeBienLabel} -- {projet.ville}</p>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      {projet.prix > 0 && (
                        <div className="mb-5">
                          <p className="text-sm text-slate-500 mb-1">Prix</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold" style={{ color: colors.primary }}>{formatFCFA(projet.prix).replace(' FCFA', '')}</span>
                            <span className="text-sm text-slate-400 font-medium">FCFA</span>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => setFormOpen(true)}
                        className="w-full text-white"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      >
                        S'inscrire
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right - Tabbed content */}
              <div className="lg:col-span-3">
                {/* Tab buttons */}
                <div className="flex gap-1 mb-8 bg-slate-100 rounded-2xl p-1.5">
                  {[
                    { id: 'caracteristiques' as const, label: 'Caracteristiques' },
                    { id: 'documents' as const, label: 'Documents' },
                    ...(conditionsElig.length > 0 ? [{ id: 'conditions' as const, label: 'Conditions' }] : []),
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDetailsTab(tab.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        detailsTab === tab.id
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Caracteristiques */}
                {detailsTab === 'caracteristiques' && (
                  <div className="space-y-4">
                    {[
                      { icon: Home, label: 'Type de bien', value: typeBienLabel },
                      { icon: Maximize, label: 'Surface', value: `${projet.surface} m\u00B2` },
                      ...(projet.type_bien !== 'terrain' ? [
                        { icon: Home, label: 'Pieces', value: String(projet.nb_pieces || '--') },
                        { icon: Home, label: 'Chambres', value: String(projet.nb_chambres || '--') },
                      ] : []),
                      { icon: MapPin, label: 'Localisation', value: `${p.quartier ? `${p.quartier}, ` : ''}${projet.ville}` },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${colors.primary}10` }}
                        >
                          <row.icon className="w-5 h-5" style={{ color: colors.primary }} />
                        </div>
                        <span className="text-slate-500 flex-1">{row.label}</span>
                        <span className="font-semibold text-slate-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Documents */}
                {detailsTab === 'documents' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 mb-4">Documents requis en format numerique :</p>
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
                    <Button
                      onClick={() => setFormOpen(true)}
                      className="w-full mt-6 text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Commencer mon inscription
                    </Button>
                  </div>
                )}

                {/* Tab: Conditions */}
                {detailsTab === 'conditions' && conditionsElig.length > 0 && (
                  <div id="conditions" className="space-y-4">
                    {conditionsElig.map((condition: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${colors.primary}15` }}>
                          <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                        </div>
                        <p className="text-slate-700 pt-1">{condition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== GALERIE PHOTOS - Masonry-style ========== */}
      {images.length > 0 && (
        <section id="galerie" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Photos</p>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Galerie photos</h2>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto">Decouvrez le bien en images</p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
                {images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer overflow-hidden rounded-2xl ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                    onClick={() => { setLightboxImage(image); setLightboxIndex(index); }}
                  >
                    <img
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Image counter badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {index + 1}/{images.length}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
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
          {/* Counter */}
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
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
              <ScrollReveal>
                <div className="text-center mb-12">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Carte</p>
                  <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Localisation</h2>
                  <p className="text-xl text-slate-500 max-w-3xl mx-auto">{locationFull}</p>
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
              </ScrollReveal>
            </div>
          </section>
        );
      })()}

      {/* ========== CONTACT - Modern glass cards ========== */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>Contact</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Contactez-nous</h2>
              <p className="text-xl text-slate-500 max-w-3xl mx-auto">Pour toute question, n'hesitez pas a nous contacter</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projet.contact_email && (
                <a
                  href={`mailto:${projet.contact_email}`}
                  className="group relative overflow-hidden rounded-2xl p-6 text-center bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}10` }}>
                    <Mail className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">Email</h4>
                  <p className="text-sm break-all" style={{ color: colors.primary }}>
                    {projet.contact_email}
                  </p>
                </a>
              )}

              {projet.contact_phone && (
                <a
                  href={`tel:${projet.contact_phone}`}
                  className="group relative overflow-hidden rounded-2xl p-6 text-center bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}10` }}>
                    <Phone className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">Telephone</h4>
                  <p className="text-sm" style={{ color: colors.primary }}>
                    {projet.contact_phone}
                  </p>
                </a>
              )}

              {/* WhatsApp button */}
              {projet.contact_phone && (
                <a
                  href={`https://wa.me/${projet.contact_phone.replace(/[\s()+\-]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-2xl p-6 text-center bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-green-50">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">WhatsApp</h4>
                  <p className="text-sm text-green-600">Ecrivez-nous</p>
                </a>
              )}

              <div className="relative overflow-hidden rounded-2xl p-6 text-center bg-white/70 backdrop-blur-xl border border-slate-200/50">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.primary}10` }}>
                  <MapPin className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
                <h4 className="font-bold text-slate-800 mb-1">Adresse</h4>
                <p className="text-slate-500 text-sm">
                  {projet.adresse}
                  {p.quartier && <><br />{p.quartier}</>}
                  <br />{projet.ville}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mt-12 text-center">
              <Button
                size="lg"
                onClick={() => setFormOpen(true)}
                className="text-white text-lg px-8 py-6 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                Demarrer mon inscription
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== FOOTER - Cleaner ========== */}
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
          {/* Etude Ogoula info line */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-sm text-center">
              {CABINET_DEFAULT.nom} -- {CABINET_DEFAULT.adresse}, {CABINET_DEFAULT.ville} | Tel: {CABINET_DEFAULT.telephone}
            </p>
          </div>
          <div className="mt-4 text-center text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} {projet.titre}. Tous droits reserves. Propulse par PPEO.
          </div>
        </div>
      </footer>

      {/* ========== MOBILE CTA BAR ========== */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3 flex items-center justify-between gap-3"
        style={{
          animation: 'slideUp 0.5s ease-out',
        }}
      >
        <div className="min-w-0">
          {displayPrice && (
            <p className="text-lg font-bold truncate" style={{ color: colors.primary }}>
              {displayPrice}
            </p>
          )}
          <p className="text-xs text-slate-400 truncate">{projet.titre}</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="text-white shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        >
          S'inscrire
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* ========== CHATBOT ========== */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
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
          setIsMineur(false);
          if (!hasProduits) setSelectedProduit('');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header gradient */}
          <div className="px-6 pt-6 pb-4 rounded-t-lg" style={{ background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)` }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Formulaire d'Acquisition
              </DialogTitle>
              <p className="text-slate-500 text-sm mt-1">{projet.titre}</p>
            </DialogHeader>

            {/* Progress bar moderne */}
            {!submitSuccess && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  {[
                    { step: 1, icon: User, label: 'Identite' },
                    { step: 2, icon: Briefcase, label: 'Profession' },
                    { step: 3, icon: Upload, label: 'Documents' },
                  ].map(({ step, icon: Icon, label }) => (
                    <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step < formStep
                            ? 'text-white shadow-md'
                            : step === formStep
                            ? 'text-white shadow-lg scale-110'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                        style={step <= formStep ? { backgroundColor: colors.primary } : undefined}
                      >
                        {step < formStep ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-medium ${step <= formStep ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3].map(step => (
                    <div
                      key={step}
                      className="flex-1 h-1.5 rounded-full transition-all duration-500"
                      style={{ backgroundColor: step <= formStep ? colors.primary : '#e2e8f0' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
          {submitSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce" style={{ backgroundColor: `${colors.primary}12` }}>
                <CheckCircle className="w-10 h-10" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Inscription envoyee avec succes !</h3>
              <p className="text-slate-500 mb-2">Votre dossier a bien ete enregistre.</p>
              <p className="text-slate-400 text-sm">Nous vous contacterons dans les plus brefs delais pour la suite de la procedure.</p>
              <Button className="mt-6 text-white rounded-full px-8" onClick={() => setFormOpen(false)} style={{ backgroundColor: colors.primary }}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-5 mt-4">

              {/* ===== ETAPE 1 : Informations personnelles ===== */}
              {formStep === 1 && (
                <div className="space-y-5">
                  {/* Selection du produit si multi-produits */}
                  {hasProduits && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h3 className="font-semibold text-base flex items-center gap-2 text-slate-800 mb-3">
                        <Maximize className="w-5 h-5" style={{ color: colors.primary }} />
                        Choix de la parcelle <span className="text-red-400">*</span>
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
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                            style={selectedProduit === produit.id ? { borderColor: colors.primary, backgroundColor: `${colors.primary}08` } : undefined}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800">{produit.nom}</span>
                              {selectedProduit === produit.id && (
                                <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{produit.surface} m&sup2;</p>
                            <p className="font-bold mt-1" style={{ color: colors.primary }}>{formatFCFA(produit.prix)}</p>
                          </button>
                        ))}
                      </div>
                      {formErrors.selectedProduit && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <CircleAlert className="w-3 h-3" />
                          {formErrors.selectedProduit}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Carte informations personnelles */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-slate-800">
                      <User className="w-5 h-5" style={{ color: colors.primary }} />
                      Informations personnelles
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Nom <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.nom}
                          onChange={e => updateField('nom', e.target.value)}
                          placeholder="Votre nom de famille"
                          className={`rounded-lg ${formErrors.nom ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:border-blue-300'}`}
                        />
                        <FieldError field="nom" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Prenom <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.prenom}
                          onChange={e => updateField('prenom', e.target.value)}
                          placeholder="Votre prenom"
                          className={`rounded-lg ${formErrors.prenom ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:border-blue-300'}`}
                        />
                        <FieldError field="prenom" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Date de naissance <span className="text-red-400">*</span></Label>
                        <Input
                          type="date"
                          value={formData.date_naissance}
                          onChange={e => updateField('date_naissance', e.target.value)}
                          className={`rounded-lg ${formErrors.date_naissance ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                        />
                        <FieldError field="date_naissance" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Lieu de naissance <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.lieu_naissance}
                          onChange={e => updateField('lieu_naissance', e.target.value)}
                          placeholder="Ex: Libreville"
                          className={`rounded-lg ${formErrors.lieu_naissance ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                        />
                        <FieldError field="lieu_naissance" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-sm">Situation matrimoniale <span className="text-red-400">*</span></Label>
                      <select
                        value={formData.situation_familiale}
                        onChange={e => updateField('situation_familiale', e.target.value)}
                        className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          formErrors.situation_familiale ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-300'
                        }`}
                      >
                        <option value="">Selectionnez votre situation</option>
                        {SITUATIONS_MATRIMONIALES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <FieldError field="situation_familiale" />
                      {formData.situation_familiale && (
                        <p className="text-xs mt-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 flex items-start gap-2">
                          <CircleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>
                            {formData.situation_familiale === 'celibataire' && "Aucun document supplementaire requis pour votre situation."}
                            {formData.situation_familiale === 'marie' && "Vous devrez fournir votre acte de mariage et livret de famille a l'etape 3."}
                            {formData.situation_familiale === 'union_libre' && "Vous devrez fournir votre acte de mariage et livret de famille a l'etape 3."}
                            {formData.situation_familiale === 'divorce' && "Vous devrez fournir votre jugement de divorce a l'etape 3."}
                            {formData.situation_familiale === 'veuf' && "Vous devrez fournir l'acte de deces du conjoint a l'etape 3."}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle mineur */}
                  <button
                    type="button"
                    onClick={() => setIsMineur(!isMineur)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                      isMineur
                        ? 'border-amber-400 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMineur ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Baby className={`w-5 h-5 ${isMineur ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isMineur ? 'text-amber-800' : 'text-slate-700'}`}>
                        L'acquereur est mineur
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isMineur
                          ? '4 documents supplementaires requis (representant legal + mineur)'
                          : 'Cochez si le candidat / acquereur est une personne mineure'
                        }
                      </p>
                    </div>
                    {isMineur ? (
                      <ToggleRight className="w-8 h-8 text-amber-500 shrink-0" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300 shrink-0" />
                    )}
                  </button>

                  {/* Carte coordonnees */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-slate-800">
                      <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                      Coordonnees
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Email <span className="text-red-400">*</span></Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={e => updateField('email', e.target.value)}
                          placeholder="votre@email.com"
                          className={`rounded-lg ${formErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                        />
                        <FieldError field="email" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Telephone <span className="text-red-400">*</span></Label>
                        <Input
                          value={formData.telephone}
                          onChange={e => updateField('telephone', e.target.value)}
                          placeholder="+241 XX XX XX XX"
                          className={`rounded-lg ${formErrors.telephone ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                        />
                        <FieldError field="telephone" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-sm">WhatsApp <span className="text-slate-400 font-normal text-xs">(optionnel, si different)</span></Label>
                      <Input
                        value={formData.whatsapp}
                        onChange={e => updateField('whatsapp', e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        className="rounded-lg border-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-600 text-sm">Adresse actuelle</Label>
                      <Input
                        value={formData.adresse}
                        onChange={e => updateField('adresse', e.target.value)}
                        placeholder="Votre adresse de residence"
                        className="rounded-lg border-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Ville / Pays</Label>
                        <Input
                          value={formData.ville}
                          onChange={e => updateField('ville', e.target.value)}
                          placeholder="Ex: Libreville, Gabon"
                          className="rounded-lg border-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-sm">Nationalite</Label>
                        <Input
                          value={formData.nationalite}
                          onChange={e => updateField('nationalite', e.target.value)}
                          placeholder="Gabonaise"
                          className="rounded-lg border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== ETAPE 2 : Situation professionnelle ===== */}
              {formStep === 2 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-5">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-5 h-5" style={{ color: colors.primary }} />
                    Situation professionnelle
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-slate-600 text-sm">Profession <span className="text-red-400">*</span></Label>
                    <Input
                      value={formData.profession}
                      onChange={e => updateField('profession', e.target.value)}
                      placeholder="Ex: Ingenieur, Enseignant, Medecin..."
                      className={`rounded-lg ${formErrors.profession ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                    />
                    <FieldError field="profession" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-600 text-sm">Entreprise / Employeur</Label>
                    <Input
                      value={formData.employeur}
                      onChange={e => updateField('employeur', e.target.value)}
                      placeholder="Nom de votre employeur ou entreprise"
                      className="rounded-lg border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-600 text-sm">Categorie socio-professionnelle <span className="text-red-400">*</span></Label>
                    <select
                      value={formData.categorie_sociopro}
                      onChange={e => updateField('categorie_sociopro', e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        formErrors.categorie_sociopro ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-300'
                      }`}
                    >
                      <option value="">Selectionnez votre categorie</option>
                      {CATEGORIES_SOCIOPRO.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <FieldError field="categorie_sociopro" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-600 text-sm">Revenus annuels <span className="text-red-400">*</span></Label>
                    <select
                      value={formData.tranche_revenus}
                      onChange={e => updateField('tranche_revenus', e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        formErrors.tranche_revenus ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-300'
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
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-base text-slate-800">Pieces justificatives</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Format accepte : PDF, JPG, PNG. Taille max : 10 Mo par fichier.
                        </p>
                      </div>
                    </div>
                  </div>

                  {(formData.situation_familiale || isMineur) && (
                    <div className="flex flex-wrap gap-2">
                      {formData.situation_familiale && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <User className="w-3 h-3" />
                          {SITUATIONS_MATRIMONIALES.find(s => s.value === formData.situation_familiale)?.label}
                        </span>
                      )}
                      {isMineur && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Baby className="w-3 h-3" />
                          Acquereur mineur
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {documentsFormulaire.map((doc) => (
                      <div key={doc.id} className={`p-4 rounded-xl border transition-all ${
                        documents[doc.id]
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-slate-200 bg-white hover:shadow-sm'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: documents[doc.id] ? `${colors.primary}15` : '#f1f5f9' }}
                          >
                            {documents[doc.id] ? (
                              <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{doc.nom}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {doc.obligatoire && (
                                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.primary }}>
                                  Obligatoire
                                </span>
                              )}
                              {documents[doc.id] && (
                                <span className="text-xs text-green-600">{(documents[doc.id].size / 1024 / 1024).toFixed(2)} Mo</span>
                              )}
                            </div>
                          </div>
                          {documents[doc.id] ? (
                            <button
                              type="button"
                              onClick={() => setDocuments(prev => {
                                const next = { ...prev };
                                delete next[doc.id];
                                return next;
                              })}
                              className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                            >
                              Retirer
                            </button>
                          ) : (
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-slate-100 text-slate-600 shrink-0 border border-slate-200">
                              <Upload className="w-3.5 h-3.5" />
                              Choisir
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Documents supplementaires du projet */}
                  {docsRequis.length > 0 && (
                    <>
                      <div className="border-t pt-4 mt-2">
                        <p className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                          Documents supplementaires du projet
                        </p>
                      </div>
                      <div className="space-y-3">
                        {docsRequis.map((doc: DocumentRequis) => (
                          <div key={doc.id} className={`p-4 rounded-xl border transition-all ${
                            documents[doc.id]
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-slate-200 bg-white hover:shadow-sm'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: documents[doc.id] ? `${colors.primary}15` : '#f1f5f9' }}
                              >
                                {documents[doc.id] ? (
                                  <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                                ) : (
                                  <FileText className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-800 truncate">{doc.nom}</p>
                                {doc.description && <p className="text-xs text-slate-400 truncate">{doc.description}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  {doc.obligatoire && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.primary }}>
                                      Obligatoire
                                    </span>
                                  )}
                                  {documents[doc.id] && (
                                    <span className="text-xs text-green-600">{(documents[doc.id].size / 1024 / 1024).toFixed(2)} Mo</span>
                                  )}
                                </div>
                              </div>
                              {documents[doc.id] ? (
                                <button
                                  type="button"
                                  onClick={() => setDocuments(prev => {
                                    const next = { ...prev };
                                    delete next[doc.id];
                                    return next;
                                  })}
                                  className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                >
                                  Retirer
                                </button>
                              ) : (
                                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-slate-100 text-slate-600 shrink-0 border border-slate-200">
                                  <Upload className="w-3.5 h-3.5" />
                                  Choisir
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
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Navigation entre etapes */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                  disabled={formStep === 1}
                  className="rounded-full px-6"
                >
                  Precedent
                </Button>
                {formStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="text-white rounded-full px-6"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFormSubmit}
                    disabled={creatingCandidat}
                    className="text-white rounded-full px-6"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    {creatingCandidat ? 'Envoi en cours...' : "Envoyer mon dossier"}
                  </Button>
                )}
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== CSS Keyframes ========== */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
