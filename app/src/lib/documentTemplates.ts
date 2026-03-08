import { CABINET_DEFAULT } from './cabinetDefaults';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const baseStyle = `
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #1a1a1a; line-height: 1.6; }
  .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
  .header p { font-size: 12px; color: #555; margin: 4px 0 0; }
  .title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 30px 0; text-decoration: underline; }
  .date { text-align: right; margin-bottom: 20px; }
  .body { text-align: justify; }
  .body p { margin: 12px 0; }
  .signature { margin-top: 60px; }
  .signature .left, .signature .right { display: inline-block; width: 45%; vertical-align: top; }
  .signature .right { text-align: right; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  table th, table td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
  table th { background: #f5f5f5; }
  @media print { body { margin: 0; padding: 20px; } }
`;

function header(cabinet: any) {
  const nom = cabinet?.nom || CABINET_DEFAULT.nom;
  const adresse = cabinet?.adresse || CABINET_DEFAULT.adresse;
  const ville = cabinet?.ville || CABINET_DEFAULT.ville;
  const tel = cabinet?.telephone || CABINET_DEFAULT.telephone;
  const email = cabinet?.email || CABINET_DEFAULT.email;
  return `<div class="header"><h1>${nom}</h1><p>${adresse}, ${ville}</p><p>Tel: ${tel} | Email: ${email}</p></div>`;
}

export function generateAttestation(candidat: any, projet: any, cabinet: any): string {
  return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
${header(cabinet)}
<div class="date">${projet?.ville || ''}, le ${today()}</div>
<div class="title">Attestation de Reservation</div>
<div class="body">
<p>Le soussigne, <strong>${cabinet?.nom || ''}</strong>, Notaire a ${cabinet?.ville || ''}, certifie par la presente que :</p>
<p>Monsieur/Madame <strong>${candidat?.prenom || ''} ${candidat?.nom || ''}</strong>, ne(e) le ${candidat?.date_naissance || 'N/A'}, demeurant a ${candidat?.adresse || ''}, ${candidat?.ville || ''},</p>
<p>a effectue une reservation sur le bien immobilier suivant :</p>
<table>
<tr><th>Projet</th><td>${projet?.titre || ''}</td></tr>
<tr><th>Type de bien</th><td>${projet?.type_bien || ''}</td></tr>
<tr><th>Adresse du bien</th><td>${projet?.adresse || ''}, ${projet?.ville || ''}</td></tr>
<tr><th>Surface</th><td>${projet?.surface || 'N/A'} m2</td></tr>
<tr><th>Prix</th><td>${projet?.prix ? fmt(projet.prix) : 'N/A'}</td></tr>
</table>
<p>Cette attestation est delivree pour servir et valoir ce que de droit.</p>
</div>
<div class="signature"><div class="left"><p>Le Reservant,</p><br/><br/><p>${candidat?.prenom || ''} ${candidat?.nom || ''}</p></div><div class="right"><p>Le Notaire,</p><br/><br/><p>${cabinet?.nom || ''}</p></div></div>
</body></html>`;
}

export function generatePromesse(candidat: any, projet: any, cabinet: any): string {
  return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
${header(cabinet)}
<div class="date">${projet?.ville || ''}, le ${today()}</div>
<div class="title">Promesse de Vente</div>
<div class="body">
<p><strong>ENTRE LES SOUSSIGNES :</strong></p>
<p><strong>Le Vendeur :</strong> represente par l'etude <strong>${cabinet?.nom || ''}</strong>, ${cabinet?.adresse || ''}, ${cabinet?.ville || ''}.</p>
<p><strong>L'Acquereur :</strong> Monsieur/Madame <strong>${candidat?.prenom || ''} ${candidat?.nom || ''}</strong>, ne(e) le ${candidat?.date_naissance || 'N/A'}, de nationalite ${candidat?.nationalite || 'gabonaise'}, demeurant a ${candidat?.adresse || ''}, ${candidat?.ville || ''}.</p>
<p><strong>IL A ETE CONVENU CE QUI SUIT :</strong></p>
<p><strong>Article 1 - Objet :</strong> Le Vendeur promet de vendre a l'Acquereur, qui accepte, le bien immobilier denomme "${projet?.titre || ''}", situe a ${projet?.adresse || ''}, ${projet?.ville || ''}, d'une surface de ${projet?.surface || 'N/A'} m2.</p>
<p><strong>Article 2 - Prix :</strong> La vente est consentie et acceptee moyennant le prix de <strong>${projet?.prix ? fmt(projet.prix) : 'N/A'}</strong>.</p>
<p><strong>Article 3 - Apport personnel :</strong> L'Acquereur declare disposer d'un apport personnel de ${candidat?.apport_personnel ? fmt(candidat.apport_personnel) : 'N/A'}.</p>
<p><strong>Article 4 - Conditions suspensives :</strong> La presente promesse est conclue sous les conditions suspensives habituelles, notamment l'obtention du financement par l'Acquereur.</p>
<p>Fait en deux exemplaires originaux a ${projet?.ville || ''}, le ${today()}.</p>
</div>
<div class="signature"><div class="left"><p>L'Acquereur,</p><br/><br/><p>${candidat?.prenom || ''} ${candidat?.nom || ''}</p></div><div class="right"><p>Pour le Vendeur,</p><br/><br/><p>${cabinet?.nom || ''}</p></div></div>
</body></html>`;
}

export function generateConvocation(candidat: any, projet: any, cabinet: any, dateRdv: string): string {
  return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
${header(cabinet)}
<div class="date">${projet?.ville || ''}, le ${today()}</div>
<p>A l'attention de<br/><strong>${candidat?.prenom || ''} ${candidat?.nom || ''}</strong><br/>${candidat?.adresse || ''}<br/>${candidat?.ville || ''}</p>
<div class="title">Convocation a la Signature</div>
<div class="body">
<p>Monsieur/Madame,</p>
<p>Nous avons le plaisir de vous informer que votre dossier d'acquisition du bien "<strong>${projet?.titre || ''}</strong>" situe a ${projet?.adresse || ''}, ${projet?.ville || ''}, est desormais complet.</p>
<p>Nous vous invitons a vous presenter a notre etude pour la <strong>signature de l'acte de vente</strong> :</p>
<table>
<tr><th>Date</th><td><strong>${dateRdv || 'A definir'}</strong></td></tr>
<tr><th>Lieu</th><td>${cabinet?.nom || ''}, ${cabinet?.adresse || ''}, ${cabinet?.ville || ''}</td></tr>
<tr><th>Bien concerne</th><td>${projet?.titre || ''}</td></tr>
<tr><th>Prix de vente</th><td>${projet?.prix ? fmt(projet.prix) : 'N/A'}</td></tr>
</table>
<p>Nous vous prions de vous munir de votre piece d'identite en cours de validite ainsi que de l'ensemble des documents originaux precedemment transmis.</p>
<p>En cas d'empechement, merci de nous prevenir dans les plus brefs delais au ${cabinet?.telephone || ''}.</p>
<p>Veuillez agreer, Monsieur/Madame, l'expression de nos salutations distinguees.</p>
</div>
<div class="signature"><div class="right"><p>${cabinet?.nom || ''}</p></div></div>
</body></html>`;
}

export function generateRecu(candidat: any, projet: any, cabinet: any, paiement: { montant: number; date: string; reference: string }): string {
  return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body>
${header(cabinet)}
<div class="date">${projet?.ville || ''}, le ${today()}</div>
<div class="title">Recu de Paiement</div>
<div class="body">
<p>Le soussigne, <strong>${cabinet?.nom || ''}</strong>, reconnait avoir recu de :</p>
<p>Monsieur/Madame <strong>${candidat?.prenom || ''} ${candidat?.nom || ''}</strong>,</p>
<p>la somme de :</p>
<table>
<tr><th>Montant</th><td><strong>${fmt(paiement.montant)}</strong></td></tr>
<tr><th>Date du paiement</th><td>${paiement.date}</td></tr>
<tr><th>Reference</th><td>${paiement.reference}</td></tr>
<tr><th>Objet</th><td>Paiement relatif au bien "${projet?.titre || ''}"</td></tr>
<tr><th>Adresse du bien</th><td>${projet?.adresse || ''}, ${projet?.ville || ''}</td></tr>
</table>
<p>Ce recu est delivre pour servir de justificatif de paiement.</p>
</div>
<div class="signature"><div class="right"><p>Le Notaire,</p><br/><br/><p>${cabinet?.nom || ''}</p></div></div>
</body></html>`;
}
