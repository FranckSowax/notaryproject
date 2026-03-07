import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
});

export const projetSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caracteres'),
  type_bien: z.enum(['terrain', 'villa', 'maison', 'appartement', 'commerce', 'immeuble', 'autre']),
  prix: z.number().min(0, 'Le prix doit etre positif'),
  surface: z.number().min(0, 'La surface doit etre positive'),
  contact_email: z.string().email('Email de contact invalide'),
  contact_phone: z.string().regex(/^\+241\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, 'Format: +241 XX XX XX XX'),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  ville: z.string().min(1, 'La ville est obligatoire'),
});

export const candidatSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  email: z.string().email('Adresse email invalide'),
  telephone: z.string().min(8, 'Numero de telephone invalide'),
  date_naissance: z.string().min(1, 'La date de naissance est obligatoire'),
  lieu_naissance: z.string().min(1, 'Le lieu de naissance est obligatoire'),
  nationalite: z.string().min(1, 'La nationalite est obligatoire'),
  profession: z.string().min(1, 'La profession est obligatoire'),
});

export const cabinetSettingsSchema = z.object({
  nom: z.string().min(1, 'Le nom du cabinet est obligatoire'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(8, 'Numero invalide'),
});

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Types inferes depuis les schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type ProjetFormData = z.infer<typeof projetSchema>;
export type CandidatFormData = z.infer<typeof candidatSchema>;
export type CabinetSettingsFormData = z.infer<typeof cabinetSettingsSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
