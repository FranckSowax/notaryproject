import type { Candidat } from '@/types';
import { serializeNotesEtape, type EtapeDossier } from '@/hooks/usePipeline';
import type { CandidatFinance } from '@/hooks/useFinances';
import type { RendezVous } from '@/hooks/useCalendrier';
import { format, addDays, subDays } from 'date-fns';

// ─── Demo candidats for pipeline ────────────────────────────────────

function makeDemoCandidat(
  id: string, prenom: string, nom: string, tel: string, email: string,
  etape: EtapeDossier, joursDansEtape: number,
  extras: Partial<Candidat> = {},
): Candidat {
  const etapeDate = format(subDays(new Date(), joursDansEtape), 'yyyy-MM-dd');
  return {
    id, prenom, nom, telephone: tel, email,
    created_at: subDays(new Date(), 30 + joursDansEtape).toISOString(),
    updated_at: subDays(new Date(), joursDansEtape).toISOString(),
    projet_id: 'demo-project-1',
    statut: 'retenu',
    date_naissance: '1985-03-15', lieu_naissance: 'Libreville', nationalite: 'gabonaise',
    situation_familiale: 'marie',
    adresse: 'Quartier Louis, Rue des Palmiers', ville: 'Libreville', code_postal: '',
    profession: 'Ingenieur', employeur: 'Total Energies', revenus_mensuels: 1200000,
    type_contrat: 'cdi', anciennete_emploi: '5 ans',
    apport_personnel: 5000000, montant_pret_sollicite: 15000000, duree_pret: 180,
    banque_actuelle: 'BGFI Bank',
    documents: [],
    notes: serializeNotesEtape({ etape, etape_date: etapeDate }, ''),
    whatsapp_conversations: [],
    ...extras,
  };
}

export const DEMO_CANDIDATS: Candidat[] = [
  makeDemoCandidat('demo-1', 'Jean-Pierre', 'Moussavou', '+241 77 12 34 56', 'jp.moussavou@email.com', 'retenu', 2),
  makeDemoCandidat('demo-2', 'Marie', 'Ndong', '+241 66 98 76 54', 'marie.ndong@email.com', 'retenu', 5),
  makeDemoCandidat('demo-3', 'Paul', 'Ondo Mba', '+241 74 55 12 33', 'paul.ondo@email.com', 'verification_docs', 3, { profession: 'Medecin', employeur: 'CHU de Libreville', revenus_mensuels: 1800000 }),
  makeDemoCandidat('demo-4', 'Sylvie', 'Obame', '+241 65 44 33 22', 'sylvie.obame@email.com', 'verification_docs', 8, { apport_personnel: 8000000, montant_pret_sollicite: 12000000 }),
  makeDemoCandidat('demo-5', 'Eric', 'Nzue', '+241 77 88 99 00', 'eric.nzue@email.com', 'montage_dossier', 4, { profession: 'Directeur commercial', employeur: 'Comilog', revenus_mensuels: 2200000 }),
  makeDemoCandidat('demo-6', 'Aline', 'Mba Nzoghe', '+241 66 11 22 33', 'aline.mba@email.com', 'montage_dossier', 6),
  makeDemoCandidat('demo-7', 'Fabrice', 'Nguema', '+241 74 22 33 44', 'fabrice.nguema@email.com', 'validation_juridique', 2, { profession: 'Avocat', employeur: 'Cabinet Nguema & Associes', revenus_mensuels: 2500000 }),
  makeDemoCandidat('demo-8', 'Claudine', 'Mintsa', '+241 65 33 44 55', 'claudine.mintsa@email.com', 'rdv_notaire', 1, { apport_personnel: 10000000, montant_pret_sollicite: 10000000 }),
  makeDemoCandidat('demo-9', 'Patrick', 'Essono', '+241 77 44 55 66', 'patrick.essono@email.com', 'signature', 3, { profession: 'Banquier', employeur: 'UGB', revenus_mensuels: 1500000 }),
  makeDemoCandidat('demo-10', 'Isabelle', 'Bekale', '+241 66 55 66 77', 'isabelle.bekale@email.com', 'cloture', 1),
];

// ─── Demo finance data ──────────────────────────────────────────────

export const DEMO_FINANCES: CandidatFinance[] = DEMO_CANDIDATS.slice(0, 7).map((c, i) => {
  const statuts: Array<'en_attente' | 'partiellement_paye' | 'solde'> = ['en_attente', 'partiellement_paye', 'solde', 'partiellement_paye', 'en_attente', 'solde', 'partiellement_paye'];
  const montantsVerses = [0, 3000000, 20000000, 5000000, 0, 20000000, 2000000];
  return {
    candidat: c,
    finance: { statut: statuts[i], montant_verse: montantsVerses[i], echeances: [] },
    parcelle: `Lot ${String.fromCharCode(65 + i)}${i + 1}`,
  };
});

// ─── Demo calendar RDVs ─────────────────────────────────────────────

const today = new Date();
export const DEMO_RDVS: RendezVous[] = [
  {
    id: 'rdv-demo-1', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Verification docs - Jean-Pierre Moussavou',
    projet_id: 'demo-project-1', candidat_id: 'demo-1',
    metadata: { date_rdv: format(addDays(today, 2), 'yyyy-MM-dd'), heure: '09:00', type_rdv: 'verification', candidat_nom: 'Jean-Pierre Moussavou', notes: '', statut: 'planifie' },
  },
  {
    id: 'rdv-demo-2', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Signature acte - Claudine Mintsa',
    projet_id: 'demo-project-1', candidat_id: 'demo-8',
    metadata: { date_rdv: format(addDays(today, 5), 'yyyy-MM-dd'), heure: '14:30', type_rdv: 'signature', candidat_nom: 'Claudine Mintsa', notes: '', statut: 'confirme' },
  },
  {
    id: 'rdv-demo-3', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Remise des cles - Isabelle Bekale',
    projet_id: 'demo-project-1', candidat_id: 'demo-10',
    metadata: { date_rdv: format(addDays(today, 8), 'yyyy-MM-dd'), heure: '10:00', type_rdv: 'remise_cles', candidat_nom: 'Isabelle Bekale', notes: '', statut: 'planifie' },
  },
  {
    id: 'rdv-demo-4', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Verification docs - Sylvie Obame',
    projet_id: 'demo-project-1', candidat_id: 'demo-4',
    metadata: { date_rdv: format(addDays(today, 3), 'yyyy-MM-dd'), heure: '11:00', type_rdv: 'verification', candidat_nom: 'Sylvie Obame', notes: '', statut: 'planifie' },
  },
  {
    id: 'rdv-demo-5', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Signature promesse - Eric Nzue',
    projet_id: 'demo-project-1', candidat_id: 'demo-5',
    metadata: { date_rdv: format(addDays(today, 12), 'yyyy-MM-dd'), heure: '15:00', type_rdv: 'signature', candidat_nom: 'Eric Nzue', notes: 'Apporter 2 copies originales', statut: 'planifie' },
  },
  {
    id: 'rdv-demo-6', created_at: today.toISOString(),
    type: 'rendez_vous', description: 'Verification docs - Paul Ondo Mba',
    projet_id: 'demo-project-1', candidat_id: 'demo-3',
    metadata: { date_rdv: format(subDays(today, 2), 'yyyy-MM-dd'), heure: '09:30', type_rdv: 'verification', candidat_nom: 'Paul Ondo Mba', notes: '', statut: 'termine' },
  },
];

// ─── Demo statistics ────────────────────────────────────────────────

export const DEMO_STATS = {
  projetsActifs: 3,
  totalCandidats: 47,
  tauxConversion: 28,
  delaiMoyenTraitement: 12,
  candidatsParStatut: {
    nouveau: 15,
    en_cours: 12,
    retenu: 10,
    refuse: 6,
    desiste: 4,
  } as Record<string, number>,
  inscriptionsParSemaine: [
    { semaine: 'S1 Fev', count: 5 },
    { semaine: 'S2 Fev', count: 8 },
    { semaine: 'S3 Fev', count: 6 },
    { semaine: 'S4 Fev', count: 11 },
    { semaine: 'S1 Mar', count: 9 },
    { semaine: 'S2 Mar', count: 7 },
  ],
  dossiersAlerte: [
    { id: 'alert-1', prenom: 'Sylvie', nom: 'Obame', projet_titre: 'Residence Akanda', statut: 'retenu', updated_at: subDays(today, 9).toISOString(), jours_inactivite: 9 },
    { id: 'alert-2', prenom: 'Aline', nom: 'Mba Nzoghe', projet_titre: 'Residence Akanda', statut: 'retenu', updated_at: subDays(today, 12).toISOString(), jours_inactivite: 12 },
    { id: 'alert-3', prenom: 'Michel', nom: 'Ovono', projet_titre: 'Les Jardins de Nzeng-Ayong', statut: 'en_cours', updated_at: subDays(today, 16).toISOString(), jours_inactivite: 16 },
  ],
  repartitionParProjet: [
    { titre: 'Residence Akanda', count: 22 },
    { titre: 'Les Jardins de Nzeng-Ayong', count: 15 },
    { titre: 'Villa Oloumi Premium', count: 10 },
  ],
};
