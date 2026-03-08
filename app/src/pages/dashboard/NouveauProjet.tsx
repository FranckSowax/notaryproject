import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  Palette,
  Eye,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Check,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, generateSlug } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatFCFA } from '@/lib/formatCurrency';
import type { DocumentRequis, Produit } from '@/types';

const typeBienOptions = [
  { value: 'terrain', label: 'Terrain' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison', label: 'Maison' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'commerce', label: 'Local commercial' },
  { value: 'immeuble', label: 'Immeuble' },
  { value: 'autre', label: 'Autre' },
];

const documentsParDefaut: DocumentRequis[] = [
  { id: '1', nom: 'Piece d\'identite', description: 'Carte nationale d\'identite ou passeport', obligatoire: true, type_fichier: ['pdf', 'jpg', 'png'], taille_max: 5242880 },
  { id: '2', nom: 'Justificatif de domicile', description: 'Facture de moins de 3 mois', obligatoire: true, type_fichier: ['pdf', 'jpg', 'png'], taille_max: 5242880 },
  { id: '3', nom: 'Bulletins de salaire', description: 'Des 3 derniers mois', obligatoire: true, type_fichier: ['pdf'], taille_max: 10485760 },
  { id: '4', nom: 'Avis d\'imposition', description: 'Dernier avis d\'imposition', obligatoire: true, type_fichier: ['pdf'], taille_max: 5242880 },
  { id: '5', nom: 'Releves bancaires', description: 'Des 3 derniers mois', obligatoire: false, type_fichier: ['pdf'], taille_max: 10485760 },
];

const colorPresets = [
  { label: 'Bleu', value: '#1e40af' },
  { label: 'Vert', value: '#047857' },
  { label: 'Amber', value: '#b45309' },
  { label: 'Rouge', value: '#b91c1c' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Noir', value: '#1e293b' },
];

const STEPS = [
  { id: 'infos', label: 'Informations', icon: FileText },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'conditions', label: 'Conditions', icon: CheckCircle },
  { id: 'theme', label: 'Theme & Apercu', icon: Palette },
];

// Composant de preview miniature de la landing page
function LandingPreview({
  titre,
  description,
  typeBien,
  prix,
  surface,
  nbPieces,
  adresse,
  ville,
  bannerPreview,
  couleurPrimaire,
  couleurSecondaire,
  conditions,
  contactEmail,
  contactPhone,
}: {
  titre: string;
  description: string;
  typeBien: string;
  prix: string;
  surface: string;
  nbPieces: string;
  adresse: string;
  ville: string;
  bannerPreview: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  conditions: string[];
  contactEmail: string;
  contactPhone: string;
}) {
  const prixNum = parseFloat(prix) || 0;

  return (
    <div className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-white">
      {/* Barre navigateur simulee */}
      <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 truncate mx-4">
          ppeo.ga/p/{titre ? generateSlug(titre) : 'mon-projet'}
        </div>
      </div>

      {/* Contenu miniature */}
      <div className="overflow-hidden" style={{ maxHeight: 480 }}>
        {/* Mini Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b" style={{ backgroundColor: `${couleurPrimaire}10` }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: couleurPrimaire }}>
              {titre ? titre.charAt(0).toUpperCase() : 'N'}
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">
              {titre || 'Nom du projet'}
            </span>
          </div>
          <div
            className="text-[10px] text-white px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: couleurPrimaire }}
          >
            Postuler
          </div>
        </div>

        {/* Mini Hero */}
        <div className="relative h-36">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${couleurPrimaire}, ${couleurSecondaire})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <div className="text-[10px] text-white/80 font-medium mb-1 px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: `${couleurPrimaire}90` }}>
              {typeBienOptions.find(o => o.value === typeBien)?.label || typeBien}
            </div>
            <p className="text-sm font-bold text-white leading-tight truncate">
              {titre || 'Titre du projet'}
            </p>
            {(adresse || ville) && (
              <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {adresse && `${adresse}, `}{ville || 'Ville'}
              </p>
            )}
          </div>
        </div>

        {/* Mini Caracteristiques */}
        <div className="px-3 py-3 grid grid-cols-3 gap-2" style={{ backgroundColor: `${couleurPrimaire}08` }}>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <div className="text-xs font-bold" style={{ color: couleurPrimaire }}>
              {prixNum > 0 ? formatFCFA(prixNum) : '-- FCFA'}
            </div>
            <div className="text-[9px] text-slate-500">Prix</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <div className="text-xs font-bold" style={{ color: couleurPrimaire }}>
              {surface || '--'} m2
            </div>
            <div className="text-[9px] text-slate-500">Surface</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <div className="text-xs font-bold" style={{ color: couleurPrimaire }}>
              {nbPieces || '--'}
            </div>
            <div className="text-[9px] text-slate-500">Pieces</div>
          </div>
        </div>

        {/* Mini Description */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-800 mb-1">Description</p>
          <p className="text-[9px] text-slate-500 line-clamp-3">
            {description || 'Description du projet immobilier...'}
          </p>
        </div>

        {/* Mini Conditions */}
        {conditions.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-[10px] font-semibold text-slate-800 mb-1">Conditions</p>
            <div className="space-y-1">
              {conditions.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" style={{ color: couleurPrimaire }} />
                  <span className="text-[9px] text-slate-600 truncate">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini CTA */}
        <div className="mx-4 my-3 py-3 rounded-lg text-center text-white text-xs font-bold" style={{ backgroundColor: couleurPrimaire }}>
          Postuler maintenant
        </div>

        {/* Mini Footer */}
        <div className="px-4 py-3 text-[9px] text-slate-400 border-t bg-slate-50">
          <div className="flex items-center gap-3">
            {contactEmail && (
              <span className="flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                {contactEmail}
              </span>
            )}
            {contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />
                {contactPhone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NouveauProjet() {
  const navigate = useNavigate();
  const { cabinetId, user } = useAuth();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Etape 1: Informations de base
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    adresse: '',
    ville: '',
    quartier: '',
    lien_localisation: '',
    type_bien: 'appartement',
    prix: '',
    surface: '',
    nb_pieces: '',
    nb_chambres: '',
    contact_email: '',
    contact_phone: '',
  });

  // Etape 2: Images
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectImagesPreviews, setProjectImagesPreviews] = useState<string[]>([]);

  // Etape 3: Documents requis
  const [documentsRequis, setDocumentsRequis] = useState<DocumentRequis[]>(documentsParDefaut);
  const [newDocDialogOpen, setNewDocDialogOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ nom: '', description: '', obligatoire: true });

  // Etape 4: Conditions
  const [conditions, setConditions] = useState<string[]>([
    'Revenus stables et reguliers',
    'Apport personnel recommande',
  ]);
  const [newCondition, setNewCondition] = useState('');

  // Produits (parcelles multiples)
  const [produitsEnabled, setProduitsEnabled] = useState(false);
  const [produits, setProduits] = useState<Array<{
    id: string;
    nom: string;
    surface: string;
    prix: string;
    description: string;
    imageFile: File | null;
    imagePreview: string;
  }>>([]);

  const addProduit = () => {
    setProduits(prev => [...prev, {
      id: Date.now().toString(),
      nom: '',
      surface: '',
      prix: '',
      description: '',
      imageFile: null,
      imagePreview: '',
    }]);
  };

  const updateProduit = (id: string, field: string, value: string) => {
    setProduits(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProduit = (id: string) => {
    setProduits(prev => prev.filter(p => p.id !== id));
  };

  const handleProduitImageChange = (id: string, file: File) => {
    setProduits(prev => prev.map(p => p.id === id ? { ...p, imageFile: file, imagePreview: URL.createObjectURL(file) } : p));
  };

  // Etape 5: Theme
  const [couleurPrimaire, setCouleurPrimaire] = useState('#1e40af');
  const [couleurSecondaire, setCouleurSecondaire] = useState('#047857');

  // Calcul de la completion
  const completionPercentage = useMemo(() => {
    let filled = 0;
    let total = 10; // nombre de champs obligatoires

    if (formData.titre.trim()) filled++;
    if (formData.description.trim()) filled++;
    if (formData.type_bien) filled++;
    if (formData.prix) filled++;
    if (formData.surface) filled++;
    if (formData.adresse.trim()) filled++;
    if (formData.ville.trim()) filled++;
    if (formData.contact_email.trim()) filled++;
    if (formData.contact_phone.trim()) filled++;
    if (bannerPreview) filled++;

    return Math.round((filled / total) * 100);
  }, [formData, bannerPreview]);

  // Validation par etape
  const stepValidation = useMemo(() => {
    const step0Valid = Boolean(
      formData.titre.trim() &&
      formData.description.trim() &&
      formData.prix &&
      formData.surface &&
      formData.adresse.trim() &&
      formData.ville.trim() &&
      formData.contact_email.trim() &&
      formData.contact_phone.trim()
    );
    const step1Valid = Boolean(bannerPreview);
    const step2Valid = true; // documents ont des valeurs par defaut
    const step3Valid = true; // conditions ont des valeurs par defaut
    const step4Valid = true; // theme a des valeurs par defaut

    return [step0Valid, step1Valid, step2Valid, step3Valid, step4Valid];
  }, [formData, bannerPreview]);

  const getStepErrors = (step: number): string[] => {
    const errors: string[] = [];
    if (step === 0) {
      if (!formData.titre.trim()) errors.push('Titre du projet');
      if (!formData.description.trim()) errors.push('Description');
      if (!formData.prix) errors.push('Prix');
      if (!formData.surface) errors.push('Surface');
      if (!formData.adresse.trim()) errors.push('Adresse');
      if (!formData.ville.trim()) errors.push('Ville');
      if (!formData.contact_email.trim()) errors.push('Email de contact');
      if (!formData.contact_phone.trim()) errors.push('Telephone de contact');
    }
    if (step === 1) {
      if (!bannerPreview) errors.push('Image de banniere');
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setProjectImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setProjectImagesPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    setProjectImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addDocument = () => {
    if (newDoc.nom.trim()) {
      setDocumentsRequis(prev => [...prev, {
        id: Date.now().toString(),
        nom: newDoc.nom,
        description: newDoc.description,
        obligatoire: newDoc.obligatoire,
        type_fichier: ['pdf', 'jpg', 'png'],
        taille_max: 5242880,
      }]);
      setNewDoc({ nom: '', description: '', obligatoire: true });
      setNewDocDialogOpen(false);
    }
  };

  const removeDocument = (id: string) => {
    setDocumentsRequis(prev => prev.filter(d => d.id !== id));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const goToNextStep = () => {
    const errors = getStepErrors(currentStep);
    if (errors.length > 0) {
      toast.error(`Veuillez remplir les champs obligatoires : ${errors.join(', ')}`);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // Validation finale
    const allErrors = [
      ...getStepErrors(0),
      ...getStepErrors(1),
    ];
    if (allErrors.length > 0) {
      toast.error(`Champs manquants : ${allErrors.join(', ')}`);
      return;
    }

    try {
      setLoading(true);

      // Upload banner
      let bannerUrl = '';
      if (bannerImage) {
        const path = `banners/${Date.now()}_${bannerImage.name}`;
        const { data, error } = await supabase.storage
          .from('projets')
          .upload(path, bannerImage);
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('projets')
            .getPublicUrl(data.path);
          bannerUrl = publicUrl;
        }
      }

      // Upload images du projet
      const imageUrls: string[] = [];
      for (const image of projectImages) {
        const path = `images/${Date.now()}_${image.name}`;
        const { data, error } = await supabase.storage
          .from('projets')
          .upload(path, image);
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('projets')
            .getPublicUrl(data.path);
          imageUrls.push(publicUrl);
        }
      }

      // Upload product images and build produits array
      let uploadedProduits: Produit[] | undefined;
      if (produitsEnabled && produits.length > 0) {
        uploadedProduits = [];
        for (const produit of produits) {
          let produitImageUrl = '';
          if (produit.imageFile) {
            const path = `produits/${Date.now()}_${produit.imageFile.name}`;
            const { data, error } = await supabase.storage
              .from('projets')
              .upload(path, produit.imageFile);
            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage
                .from('projets')
                .getPublicUrl(data.path);
              produitImageUrl = publicUrl;
            }
          }
          uploadedProduits.push({
            id: produit.id,
            nom: produit.nom,
            surface: parseFloat(produit.surface) || 0,
            prix: parseFloat(produit.prix) || 0,
            description: produit.description,
            image: produitImageUrl,
          });
        }
      }

      // Creer le projet
      const slug = generateSlug(formData.titre);
      const projetData = {
        cabinet_id: cabinetId,
        created_by: user?.id,
        titre: formData.titre,
        slug,
        description: formData.description,
        adresse: formData.adresse,
        ville: formData.ville,
        quartier: formData.quartier,
        lien_localisation: formData.lien_localisation || null,
        type_bien: formData.type_bien,
        prix: parseFloat(formData.prix) || 0,
        surface: parseFloat(formData.surface) || 0,
        nb_pieces: parseInt(formData.nb_pieces) || 0,
        nb_chambres: parseInt(formData.nb_chambres) || 0,
        banner_image: bannerUrl,
        images: imageUrls,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        conditions_eligibilite: conditions,
        statut: 'actif',
        date_ouverture: new Date().toISOString(),
        metadata: {
          couleur_primaire: couleurPrimaire,
          couleur_secondaire: couleurSecondaire,
          ...(uploadedProduits ? { produits: uploadedProduits } : {}),
        },
      };

      const { data: projet, error: projetError } = await supabase
        .from('projets')
        .insert(projetData as any)
        .select()
        .single();

      if (projetError) throw projetError;

      // Creer les documents requis
      if (projet) {
        const docsToInsert = documentsRequis.map(doc => ({
          projet_id: (projet as any).id,
          nom: doc.nom,
          description: doc.description,
          obligatoire: doc.obligatoire,
          type_fichier: doc.type_fichier,
          taille_max: doc.taille_max,
        }));

        await supabase.from('documents_requis').insert(docsToInsert as any);

        // Creer la config chatbot
        await supabase.from('chatbot_configs').insert({
          projet_id: (projet as any).id,
          enabled: true,
        } as any);
      }

      setCreatedSlug(slug);
      setSuccess(true);
      toast.success('Projet cree avec succes !');
    } catch (error) {
      console.error('Erreur creation projet:', error);
      toast.error('Erreur lors de la creation du projet');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Projet cree avec succes !
        </h1>
        <p className="text-slate-500 mb-8">
          Votre landing page est maintenant prete a etre partagee avec vos candidats.
        </p>
        <div className="bg-slate-100 p-4 rounded-lg mb-8">
          <p className="text-sm text-slate-600 mb-2">Lien de votre landing page :</p>
          <code className="text-sm bg-white px-3 py-2 rounded border">
            {window.location.origin}/p/{createdSlug}
          </code>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/dashboard/projets')}>
            Voir mes projets
          </Button>
          <Button onClick={() => window.open(`/p/${createdSlug}`, '_blank')}>
            Voir la page
          </Button>
        </div>
      </div>
    );
  }

  const RequiredMark = () => <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/projets')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Nouveau projet immobilier</h1>
          <p className="text-slate-500">Creez une landing page pour votre programme</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progression</span>
          <span className="text-sm font-bold" style={{ color: completionPercentage === 100 ? '#047857' : '#1e40af' }}>
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: completionPercentage === 100 ? '#047857' : '#1e40af',
            }}
          />
        </div>
      </div>

      {/* Steps navigation */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isValid = stepValidation[index];

          return (
            <button
              key={step.id}
              onClick={() => {
                // Permettre de revenir en arriere, mais valider pour avancer
                if (index <= currentStep) {
                  setCurrentStep(index);
                } else if (index === currentStep + 1) {
                  goToNextStep();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : isCompleted
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <div className="relative">
                {isCompleted && isValid ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
                {!isValid && isCompleted && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{index + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des etapes */}
      <div className="min-h-[500px]">
        {/* Etape 1 : Informations */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titre">Titre du projet <RequiredMark /></Label>
                  <Input
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="Ex: Residence Les Jardins de la Ville"
                    className={!formData.titre.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description <RequiredMark /></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Decrivez le projet..."
                    rows={4}
                    className={!formData.description.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type_bien">Type de bien <RequiredMark /></Label>
                    <select
                      id="type_bien"
                      name="type_bien"
                      value={formData.type_bien}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {typeBienOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="prix">Prix (FCFA) <RequiredMark /></Label>
                    <Input
                      id="prix"
                      name="prix"
                      type="number"
                      value={formData.prix}
                      onChange={handleInputChange}
                      placeholder="250000"
                      className={!formData.prix ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                    />
                    {formData.prix && (
                      <p className="text-xs text-slate-500 mt-1">{formatFCFA(parseFloat(formData.prix))}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="surface">Surface (m2) <RequiredMark /></Label>
                    <Input
                      id="surface"
                      name="surface"
                      type="number"
                      value={formData.surface}
                      onChange={handleInputChange}
                      placeholder="85"
                      className={!formData.surface ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nb_pieces">Nombre de pieces</Label>
                    <Input
                      id="nb_pieces"
                      name="nb_pieces"
                      type="number"
                      value={formData.nb_pieces}
                      onChange={handleInputChange}
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nb_chambres">Nombre de chambres</Label>
                    <Input
                      id="nb_chambres"
                      name="nb_chambres"
                      type="number"
                      value={formData.nb_chambres}
                      onChange={handleInputChange}
                      placeholder="2"
                    />
                  </div>
                </div>

                {/* Produits / Parcelles multiples */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Produits / Parcelles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="produitsEnabled"
                      checked={produitsEnabled}
                      onChange={e => {
                        setProduitsEnabled(e.target.checked);
                        if (e.target.checked && produits.length === 0) addProduit();
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <Label htmlFor="produitsEnabled" className="cursor-pointer text-sm">
                      Ce projet propose plusieurs produits (parcelles de differentes tailles)
                    </Label>
                  </div>

                  {produitsEnabled && (
                    <div className="space-y-4 pt-3">
                      <p className="text-sm text-slate-500">
                        Definissez les differentes parcelles proposees. Les champs Prix et Surface ci-dessus serviront de valeurs par defaut.
                      </p>

                      {produits.map((produit, index) => (
                        <div key={produit.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">Produit {index + 1}</span>
                            <button
                              onClick={() => removeProduit(produit.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Nom *</Label>
                              <Input
                                value={produit.nom}
                                onChange={e => updateProduit(produit.id, 'nom', e.target.value)}
                                placeholder="Ex: Standard, Premium"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Surface (m2) *</Label>
                              <Input
                                type="number"
                                value={produit.surface}
                                onChange={e => updateProduit(produit.id, 'surface', e.target.value)}
                                placeholder="525"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Prix (FCFA) *</Label>
                              <Input
                                type="number"
                                value={produit.prix}
                                onChange={e => updateProduit(produit.id, 'prix', e.target.value)}
                                placeholder="5000000"
                              />
                              {produit.prix && (
                                <p className="text-xs text-slate-400 mt-0.5">{formatFCFA(parseFloat(produit.prix))}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Description courte</Label>
                            <Input
                              value={produit.description}
                              onChange={e => updateProduit(produit.id, 'description', e.target.value)}
                              placeholder="Frais inclus, bornage, titre foncier..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Image du produit</Label>
                            <div className="flex items-center gap-3 mt-1">
                              {produit.imagePreview ? (
                                <img src={produit.imagePreview} alt={produit.nom} className="w-16 h-16 rounded-lg object-cover" />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                {produit.imagePreview ? 'Changer' : 'Ajouter une image'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleProduitImageChange(produit.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button variant="outline" size="sm" onClick={addProduit} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un produit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adresse">Adresse <RequiredMark /></Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    placeholder="Quartier Glass, Rue des Cocotiers"
                    className={!formData.adresse.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ville">Ville <RequiredMark /></Label>
                    <Input
                      id="ville"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      placeholder="Libreville"
                      className={!formData.ville.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quartier">Quartier</Label>
                    <Input
                      id="quartier"
                      name="quartier"
                      value={formData.quartier}
                      onChange={handleInputChange}
                      placeholder="Akebe, Glass, Nzeng-Ayong..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lien_localisation">Lien Google Maps <span className="text-xs text-slate-400">(facultatif)</span></Label>
                  <Input
                    id="lien_localisation"
                    name="lien_localisation"
                    value={formData.lien_localisation}
                    onChange={handleInputChange}
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Collez un lien Google Maps pour afficher la carte sur la page du projet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contact_email">Email de contact <RequiredMark /></Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="contact@cabinet.ga"
                    className={!formData.contact_email.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Telephone de contact <RequiredMark /></Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+241 XX XX XX XX"
                    className={!formData.contact_phone.trim() ? 'border-amber-300 focus:border-amber-500' : 'border-green-300'}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etape 2 : Images */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Banniere (Hero) <RequiredMark />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    bannerPreview ? 'border-green-400 bg-green-50' : 'border-amber-300 hover:border-amber-400 bg-amber-50/50'
                  }`}
                >
                  {bannerPreview ? (
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBannerImage(null);
                          setBannerPreview('');
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">Cliquez pour ajouter une banniere</p>
                      <p className="text-sm text-slate-400 mt-1">Format recommande: 1920x600px</p>
                      <div className="flex items-center gap-1 justify-center mt-2 text-amber-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Champ obligatoire
                      </div>
                    </>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Images du projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {projectImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Project ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => imagesInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Ajouter</span>
                  </div>
                  <input
                    ref={imagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etape 3 : Documents */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Documents requis
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setNewDocDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documentsRequis.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.nom}</p>
                          <p className="text-sm text-slate-500">{doc.description}</p>
                        </div>
                        {doc.obligatoire && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">Obligatoire</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={newDocDialogOpen} onOpenChange={setNewDocDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un document requis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom du document</Label>
                    <Input
                      value={newDoc.nom}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="Ex: Attestation d'emploi"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newDoc.description}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du document..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="obligatoire"
                      checked={newDoc.obligatoire}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, obligatoire: e.target.checked }))}
                    />
                    <Label htmlFor="obligatoire">Document obligatoire</Label>
                  </div>
                  <Button onClick={addDocument} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Etape 4 : Conditions */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Conditions d'eligibilite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Ajouter une condition..."
                    onKeyDown={(e) => e.key === 'Enter' && addCondition()}
                  />
                  <Button onClick={addCondition}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>{condition}</span>
                      </div>
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etape 5 : Theme & Apercu */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Parametres de theme */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-600" />
                      Couleurs du theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Couleur primaire */}
                    <div>
                      <Label className="mb-2 block">Couleur primaire</Label>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="color"
                          value={couleurPrimaire}
                          onChange={(e) => setCouleurPrimaire(e.target.value)}
                          className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                        />
                        <Input
                          value={couleurPrimaire}
                          onChange={(e) => setCouleurPrimaire(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {colorPresets.map(preset => (
                          <button
                            key={preset.value}
                            onClick={() => setCouleurPrimaire(preset.value)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              couleurPrimaire === preset.value ? 'border-slate-900 scale-110 shadow-lg' : 'border-slate-200 hover:border-slate-400'
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Couleur secondaire */}
                    <div>
                      <Label className="mb-2 block">Couleur secondaire</Label>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="color"
                          value={couleurSecondaire}
                          onChange={(e) => setCouleurSecondaire(e.target.value)}
                          className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                        />
                        <Input
                          value={couleurSecondaire}
                          onChange={(e) => setCouleurSecondaire(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {colorPresets.map(preset => (
                          <button
                            key={preset.value}
                            onClick={() => setCouleurSecondaire(preset.value)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              couleurSecondaire === preset.value ? 'border-slate-900 scale-110 shadow-lg' : 'border-slate-200 hover:border-slate-400'
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Apercu couleurs */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-slate-500 mb-2">Apercu des couleurs</p>
                      <div className="flex gap-3">
                        <div className="flex-1 h-16 rounded-xl shadow-inner" style={{ backgroundColor: couleurPrimaire }}>
                          <div className="h-full flex items-center justify-center text-white text-xs font-medium">Primaire</div>
                        </div>
                        <div className="flex-1 h-16 rounded-xl shadow-inner" style={{ backgroundColor: couleurSecondaire }}>
                          <div className="h-full flex items-center justify-center text-white text-xs font-medium">Secondaire</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recapitulatif */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Recapitulatif
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Titre</span>
                        <span className="font-medium text-slate-900 text-right max-w-[180px] truncate">{formData.titre || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type</span>
                        <span className="font-medium text-slate-900">{typeBienOptions.find(o => o.value === formData.type_bien)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Prix</span>
                        <span className="font-medium text-slate-900">{formData.prix ? formatFCFA(parseFloat(formData.prix)) : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Surface</span>
                        <span className="font-medium text-slate-900">{formData.surface ? `${formData.surface} m2` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lieu</span>
                        <span className="font-medium text-slate-900 text-right max-w-[180px] truncate">{formData.ville || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Banniere</span>
                        <span className={`font-medium ${bannerPreview ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {bannerPreview ? 'Ajoutee' : 'Manquante'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Images</span>
                        <span className="font-medium text-slate-900">{projectImages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Documents</span>
                        <span className="font-medium text-slate-900">{documentsRequis.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Conditions</span>
                        <span className="font-medium text-slate-900">{conditions.length}</span>
                      </div>
                      {produitsEnabled && produits.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Produits</span>
                          <span className="font-medium text-slate-900">{produits.length}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-3">
                <div className="sticky top-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Apercu de la landing page</span>
                  </div>
                  <LandingPreview
                    titre={formData.titre}
                    description={formData.description}
                    typeBien={formData.type_bien}
                    prix={formData.prix}
                    surface={formData.surface}
                    nbPieces={formData.nb_pieces}
                    adresse={formData.adresse}
                    ville={formData.ville}
                    bannerPreview={bannerPreview}
                    couleurPrimaire={couleurPrimaire}
                    couleurSecondaire={couleurSecondaire}
                    conditions={conditions}
                    contactEmail={formData.contact_email}
                    contactPhone={formData.contact_phone}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions de navigation */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={goToPrevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Precedent
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard/projets')}>
            Annuler
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goToNextStep}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Creation en cours...' : 'Creer le projet'}
              {!loading && <CheckCircle className="w-4 h-4 ml-2" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
