import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2,
  User,
  Users,
  MessageCircle,
  Palette,
  Save,
  UserPlus,
  Upload,
  Eye,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, uploadFile } from '@/lib/supabase';
import { toast } from 'sonner';

// ==============================
// Onglet Cabinet
// ==============================
function CabinetTab({ cabinetId }: { cabinetId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    ville: '',
    code_postal: '',
    telephone: '',
    email: '',
    site_web: '',
    logo: '' as string | null,
  });

  useEffect(() => {
    async function load() {
      if (!cabinetId) return;
      try {
        const { data, error } = await supabase
          .from('cabinets')
          .select('*')
          .eq('id', cabinetId)
          .single();
        if (error) throw error;
        if (data) {
          const d = data as Record<string, unknown>;
          setForm({
            nom: (d.nom as string) || '',
            adresse: (d.adresse as string) || '',
            ville: (d.ville as string) || '',
            code_postal: (d.code_postal as string) || '',
            telephone: (d.telephone as string) || '',
            email: (d.email as string) || '',
            site_web: (d.site_web as string) || '',
            logo: (d.logo as string) || null,
          });
        }
      } catch (err) {
        console.error('Erreur chargement cabinet:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cabinetId]);

  const handleSave = async () => {
    if (!cabinetId) return;
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {
        nom: form.nom,
        adresse: form.adresse,
        ville: form.ville,
        code_postal: form.code_postal,
        telephone: form.telephone,
        email: form.email,
        logo: form.logo,
      };
      const { error } = await supabase
        .from('cabinets')
        .update(updateData as never)
        .eq('id', cabinetId);
      if (error) throw error;
      toast.success('Informations du cabinet enregistrees');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cabinetId) return;
    try {
      setLogoUploading(true);
      const path = `logos/${cabinetId}/${Date.now()}_${file.name}`;
      const url = await uploadFile('cabinets', path, file);
      if (url) {
        setForm((prev) => ({ ...prev, logo: url }));
        toast.success('Logo telecharge');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du telechargement du logo');
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du cabinet</CardTitle>
        <CardDescription>Modifiez les informations generales de votre cabinet notarial.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <Label>Logo du cabinet</Label>
          <div className="flex items-center gap-4">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
              >
                {logoUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {logoUploading ? 'Telechargement...' : 'Changer le logo'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cabinet-nom">Nom du cabinet</Label>
            <Input
              id="cabinet-nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Cabinet Notarial..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabinet-email">Email</Label>
            <Input
              id="cabinet-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@cabinet.ga"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabinet-telephone">Telephone</Label>
            <Input
              id="cabinet-telephone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="+241 XX XX XX XX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabinet-site">Site web</Label>
            <Input
              id="cabinet-site"
              value={form.site_web}
              onChange={(e) => setForm({ ...form, site_web: e.target.value })}
              placeholder="https://www.cabinet.ga"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="cabinet-adresse">Adresse</Label>
            <Input
              id="cabinet-adresse"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              placeholder="Adresse du cabinet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabinet-ville">Ville</Label>
            <Input
              id="cabinet-ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              placeholder="Libreville"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabinet-cp">Code postal</Label>
            <Input
              id="cabinet-cp"
              value={form.code_postal}
              onChange={(e) => setForm({ ...form, code_postal: e.target.value })}
              placeholder="00000"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer les modifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==============================
// Onglet Profil
// ==============================
function ProfilTab() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        nom: (user as Record<string, unknown>).nom as string || '',
        prenom: (user as Record<string, unknown>).prenom as string || '',
        email: (user as Record<string, unknown>).email as string || '',
        telephone: (user as Record<string, unknown>).telephone as string || '',
      });
    }
  }, [user]);

  const handleSaveProfil = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
      };
      const { error } = await supabase
        .from('utilisateurs')
        .update(updateData as never)
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profil mis a jour');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise a jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      toast.success('Mot de passe modifie avec succes');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Modifiez votre profil utilisateur.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profil-prenom">Prenom</Label>
              <Input
                id="profil-prenom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profil-nom">Nom</Label>
              <Input
                id="profil-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profil-email">Email</Label>
              <Input
                id="profil-email"
                type="email"
                value={form.email}
                readOnly
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profil-telephone">Telephone</Label>
              <Input
                id="profil-telephone"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="+241 XX XX XX XX"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfil} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>Mettez a jour votre mot de passe de connexion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirmez le mot de passe"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleChangePassword}
              disabled={saving || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==============================
// Onglet Equipe
// ==============================
interface Utilisateur {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  cabinet_id: string;
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  notaire: 'bg-purple-100 text-purple-700',
  collaborateur: 'bg-blue-100 text-blue-700',
  secretaire: 'bg-emerald-100 text-emerald-700',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  notaire: 'Notaire',
  collaborateur: 'Collaborateur',
  secretaire: 'Secretaire',
};

function EquipeTab({ cabinetId }: { cabinetId: string | null }) {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('collaborateur');
  const [inviting, setInviting] = useState(false);

  const fetchEquipe = useCallback(async () => {
    if (!cabinetId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('cabinet_id', cabinetId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setUtilisateurs((data as Utilisateur[]) || []);
    } catch (err) {
      console.error('Erreur chargement equipe:', err);
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => {
    fetchEquipe();
  }, [fetchEquipe]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !cabinetId) return;
    try {
      setInviting(true);
      // Creer l'utilisateur via l'API admin ou une edge function
      // Pour l'instant, on insere directement dans la table utilisateurs
      const insertData: Record<string, unknown> = {
        email: inviteEmail,
        role: inviteRole,
        cabinet_id: cabinetId,
        nom: '',
        prenom: '',
      };
      const { error } = await supabase
        .from('utilisateurs')
        .insert(insertData as never);
      if (error) throw error;
      toast.success(`Invitation envoyee a ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('collaborateur');
      setInviteOpen(false);
      fetchEquipe();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'invitation");
    } finally {
      setInviting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equipe</CardTitle>
            <CardDescription>Gerez les membres de votre cabinet.</CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter un collaborateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un collaborateur</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email pour rejoindre votre cabinet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Adresse email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@cabinet.ga"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="notaire">Notaire</option>
                    <option value="collaborateur">Collaborateur</option>
                    <option value="secretaire">Secretaire</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : utilisateurs.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Aucun membre dans l'equipe</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {utilisateurs.map((u) => (
              <div key={u.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
                    {u.prenom?.charAt(0) || ''}{u.nom?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {u.prenom} {u.nom}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{u.email}</p>
                </div>
                <Badge className={`${roleBadgeColors[u.role] || 'bg-slate-100 text-slate-700'} border-0`}>
                  {roleLabels[u.role] || u.role}
                </Badge>
                <span className="text-xs text-slate-400 hidden sm:block">
                  {new Date(u.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==============================
// Onglet WhatsApp
// ==============================
function WhatsAppTab({ cabinetId }: { cabinetId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    whapi_token: '',
    whapi_channel_id: '',
    whatsapp_enabled: false,
  });

  useEffect(() => {
    async function load() {
      if (!cabinetId) return;
      try {
        const { data, error } = await supabase
          .from('cabinets')
          .select('whapi_token, whapi_channel_id')
          .eq('id', cabinetId)
          .single();
        if (error) throw error;
        if (data) {
          const d = data as Record<string, unknown>;
          setForm({
            whapi_token: (d.whapi_token as string) || '',
            whapi_channel_id: (d.whapi_channel_id as string) || '',
            whatsapp_enabled: !!(d.whapi_token && d.whapi_channel_id),
          });
        }
      } catch (err) {
        console.error('Erreur chargement config WhatsApp:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cabinetId]);

  const handleSave = async () => {
    if (!cabinetId) return;
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {
        whapi_token: form.whatsapp_enabled ? form.whapi_token : null,
        whapi_channel_id: form.whatsapp_enabled ? form.whapi_channel_id : null,
      };
      const { error } = await supabase
        .from('cabinets')
        .update(updateData as never)
        .eq('id', cabinetId);
      if (error) throw error;
      toast.success('Configuration WhatsApp enregistree');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!form.whapi_token) {
      toast.error('Veuillez renseigner le token WHAPI');
      return;
    }
    try {
      setTesting(true);
      // Test basique de la connexion WHAPI
      const response = await fetch('https://gate.whapi.cloud/settings', {
        headers: {
          Authorization: `Bearer ${form.whapi_token}`,
        },
      });
      if (response.ok) {
        toast.success('Connexion WhatsApp reussie');
      } else {
        toast.error('Echec de la connexion. Verifiez votre token.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Impossible de contacter le serveur WHAPI');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration WhatsApp</CardTitle>
        <CardDescription>
          Configurez votre integration WhatsApp via WHAPI pour communiquer avec les candidats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle activation */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Activer l'integration WhatsApp</p>
            <p className="text-sm text-slate-500">
              Permet d'envoyer et recevoir des messages WhatsApp
            </p>
          </div>
          <Switch
            checked={form.whatsapp_enabled}
            onCheckedChange={(checked) => setForm({ ...form, whatsapp_enabled: checked })}
          />
        </div>

        {form.whatsapp_enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whapi-token">Token WHAPI</Label>
              <Input
                id="whapi-token"
                type="password"
                value={form.whapi_token}
                onChange={(e) => setForm({ ...form, whapi_token: e.target.value })}
                placeholder="Votre token WHAPI..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whapi-channel">Channel ID WHAPI</Label>
              <Input
                id="whapi-channel"
                value={form.whapi_channel_id}
                onChange={(e) => setForm({ ...form, whapi_channel_id: e.target.value })}
                placeholder="ID du channel WHAPI"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Tester la connexion
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==============================
// Onglet Apparence
// ==============================
function ApparenceTab({ cabinetId }: { cabinetId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    couleur_primaire: '#1e40af',
    couleur_secondaire: '#f59e0b',
  });

  useEffect(() => {
    async function load() {
      if (!cabinetId) return;
      try {
        const { data, error } = await supabase
          .from('cabinets')
          .select('couleur_primaire, couleur_secondaire')
          .eq('id', cabinetId)
          .single();
        if (error) throw error;
        if (data) {
          const d = data as Record<string, unknown>;
          setForm({
            couleur_primaire: (d.couleur_primaire as string) || '#1e40af',
            couleur_secondaire: (d.couleur_secondaire as string) || '#f59e0b',
          });
        }
      } catch (err) {
        console.error('Erreur chargement couleurs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cabinetId]);

  const handleSave = async () => {
    if (!cabinetId) return;
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = {
        couleur_primaire: form.couleur_primaire,
        couleur_secondaire: form.couleur_secondaire,
      };
      const { error } = await supabase
        .from('cabinets')
        .update(updateData as never)
        .eq('id', cabinetId);
      if (error) throw error;
      toast.success('Couleurs enregistrees');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>
          Personnalisez les couleurs de vos landing pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="couleur-primaire">Couleur primaire</Label>
            <div className="flex items-center gap-3">
              <input
                id="couleur-primaire"
                type="color"
                value={form.couleur_primaire}
                onChange={(e) => setForm({ ...form, couleur_primaire: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer border border-slate-200"
              />
              <Input
                value={form.couleur_primaire}
                onChange={(e) => setForm({ ...form, couleur_primaire: e.target.value })}
                className="flex-1"
                placeholder="#1e40af"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="couleur-secondaire">Couleur secondaire</Label>
            <div className="flex items-center gap-3">
              <input
                id="couleur-secondaire"
                type="color"
                value={form.couleur_secondaire}
                onChange={(e) => setForm({ ...form, couleur_secondaire: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer border border-slate-200"
              />
              <Input
                value={form.couleur_secondaire}
                onChange={(e) => setForm({ ...form, couleur_secondaire: e.target.value })}
                className="flex-1"
                placeholder="#f59e0b"
              />
            </div>
          </div>
        </div>

        {/* Apercu */}
        <div className="space-y-2">
          <Label>Apercu</Label>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <div
              className="p-6"
              style={{ backgroundColor: form.couleur_primaire }}
            >
              <h3 className="text-white text-lg font-bold mb-2">Titre de la landing page</h3>
              <p className="text-white/80 text-sm">
                Voici un apercu de vos couleurs sur une landing page type.
              </p>
              <button
                className="mt-4 px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: form.couleur_secondaire,
                  color: '#fff',
                }}
              >
                Bouton d'action
              </button>
            </div>
            <div className="p-4 bg-white">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Apercu en temps reel</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer les couleurs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==============================
// Page principale Parametres
// ==============================
export function ParametresPage() {
  const { cabinetId } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parametres</h1>
        <p className="text-slate-500 mt-1">
          Gerez les parametres de votre cabinet et de votre compte.
        </p>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="cabinet" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="cabinet" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Cabinet</span>
          </TabsTrigger>
          <TabsTrigger value="profil" className="gap-1.5">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="equipe" className="gap-1.5">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Equipe</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="apparence" className="gap-1.5">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cabinet">
          <CabinetTab cabinetId={cabinetId} />
        </TabsContent>

        <TabsContent value="profil">
          <ProfilTab />
        </TabsContent>

        <TabsContent value="equipe">
          <EquipeTab cabinetId={cabinetId} />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppTab cabinetId={cabinetId} />
        </TabsContent>

        <TabsContent value="apparence">
          <ApparenceTab cabinetId={cabinetId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
