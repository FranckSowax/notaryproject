import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Plus,
  Image as ImageIcon,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, generateSlug } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { DocumentRequis } from '@/types';

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
  { id: '1', nom: 'Pièce d\'identité', description: 'Carte nationale d\'identité ou passeport', obligatoire: true, type_fichier: ['pdf', 'jpg', 'png'], taille_max: 5242880 },
  { id: '2', nom: 'Justificatif de domicile', description: 'Facture de moins de 3 mois', obligatoire: true, type_fichier: ['pdf', 'jpg', 'png'], taille_max: 5242880 },
  { id: '3', nom: 'Bulletins de salaire', description: 'Des 3 derniers mois', obligatoire: true, type_fichier: ['pdf'], taille_max: 10485760 },
  { id: '4', nom: 'Avis d\'imposition', description: 'Dernier avis d\'imposition', obligatoire: true, type_fichier: ['pdf'], taille_max: 5242880 },
  { id: '5', nom: 'Relevés bancaires', description: 'Des 3 derniers mois', obligatoire: false, type_fichier: ['pdf'], taille_max: 10485760 },
];

export function NouveauProjet() {
  const navigate = useNavigate();
  const { cabinetId, user } = useAuth();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  // Étape 1: Informations de base
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    adresse: '',
    ville: '',
    code_postal: '',
    type_bien: 'appartement',
    prix: '',
    surface: '',
    nb_pieces: '',
    nb_chambres: '',
    contact_email: '',
    contact_phone: '',
  });

  // Étape 2: Images
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectImagesPreviews, setProjectImagesPreviews] = useState<string[]>([]);

  // Étape 3: Documents requis
  const [documentsRequis, setDocumentsRequis] = useState<DocumentRequis[]>(documentsParDefaut);
  const [newDocDialogOpen, setNewDocDialogOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ nom: '', description: '', obligatoire: true });

  // Étape 4: Conditions
  const [conditions, setConditions] = useState<string[]>([
    'Revenus stables et réguliers',
    'Apport personnel recommandé',
  ]);
  const [newCondition, setNewCondition] = useState('');

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

  const handleSubmit = async () => {
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

      // Créer le projet
      const slug = generateSlug(formData.titre);
      const projetData = {
        cabinet_id: cabinetId,
        created_by: user?.id,
        titre: formData.titre,
        slug,
        description: formData.description,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.code_postal,
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
      };
      
      const { data: projet, error: projetError } = await supabase
        .from('projets')
        .insert(projetData as any)
        .select()
        .single();

      if (projetError) throw projetError;

      // Créer les documents requis
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

        // Créer la config chatbot
        await supabase.from('chatbot_configs').insert({
          projet_id: (projet as any).id,
          enabled: true,
        } as any);
      }

      setCreatedSlug(slug);
      setSuccess(true);
    } catch (error) {
      console.error('Erreur création projet:', error);
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
          Projet créé avec succès !
        </h1>
        <p className="text-slate-500 mb-8">
          Votre landing page est maintenant prête à être partagée avec vos candidats.
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/projets')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouveau projet immobilier</h1>
          <p className="text-slate-500">Créez une landing page pour votre programme</p>
        </div>
      </div>

      <Tabs defaultValue="infos" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="infos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titre">Titre du projet *</Label>
                <Input
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Résidence Les Jardins de la Ville"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le projet..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type_bien">Type de bien</Label>
                  <select
                    id="type_bien"
                    name="type_bien"
                    value={formData.type_bien}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {typeBienOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="prix">Prix (FCFA)</Label>
                  <Input
                    id="prix"
                    name="prix"
                    type="number"
                    value={formData.prix}
                    onChange={handleInputChange}
                    placeholder="250000"
                  />
                </div>
                <div>
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    name="surface"
                    type="number"
                    value={formData.surface}
                    onChange={handleInputChange}
                    placeholder="85"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nb_pieces">Nombre de pièces</Label>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="12 rue de la Paix"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    placeholder="Libreville"
                  />
                </div>
                <div>
                  <Label htmlFor="code_postal">Code postal</Label>
                  <Input
                    id="code_postal"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleInputChange}
                    placeholder="BP 1234"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contact@cabinet.ga"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+241 XX XX XX XX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Images */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bannière (Hero)</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => bannerInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  bannerPreview ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
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
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cliquez pour ajouter une bannière</p>
                    <p className="text-sm text-slate-400 mt-1">Format recommandé: 1920x600px</p>
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
              <CardTitle>Images du projet</CardTitle>
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
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents requis</CardTitle>
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
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.nom}</p>
                        <p className="text-sm text-slate-500">{doc.description}</p>
                      </div>
                      {doc.obligatoire && (
                        <Badge variant="secondary">Obligatoire</Badge>
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
        </TabsContent>

        {/* Onglet Conditions */}
        <TabsContent value="conditions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conditions d'éligibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Ajouter une condition..."
                  onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                />
                <Button onClick={addCondition}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <span>{condition}</span>
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
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={() => navigate('/dashboard/projets')}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.titre}
        >
          {loading ? 'Création en cours...' : 'Créer le projet'}
        </Button>
      </div>
    </div>
  );
}
