import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const {
      candidatId, candidatNom, candidatPhone,
      projetId, typeRdv, creneaux,
      cabinetId, cabinetNom, cabinetAdresse, cabinetVille,
      cabinetTelephone, lienMaps,
    } = JSON.parse(event.body || '{}');

    const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
    const APP_URL = process.env.VITE_APP_URL || process.env.URL || 'https://ppeo.netlify.app';

    if (!WHAPI_TOKEN) {
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'WHAPI_TOKEN non configure' }) };
    }

    // Generate unique booking token
    const token = crypto.randomUUID();

    // Store the booking request in activity_logs
    const { error: dbError } = await supabase.from('activity_logs').insert({
      type: 'rendez_vous',
      description: `Demande de RDV - ${candidatNom}`,
      candidat_id: candidatId,
      projet_id: projetId,
      metadata: {
        token,
        cabinet_id: cabinetId,
        candidat_nom: candidatNom,
        candidat_phone: candidatPhone,
        type_rdv: typeRdv || 'verification',
        creneaux, // Array of { date: string, heures: string[] }
        statut: 'en_attente',
        date_rdv: '',
        heure: '',
        cabinet_nom: cabinetNom,
        cabinet_adresse: cabinetAdresse,
        cabinet_ville: cabinetVille,
        cabinet_telephone: cabinetTelephone,
        lien_maps: lienMaps || '',
        notes: '',
      },
    } as never);

    if (dbError) {
      console.error('DB error:', dbError);
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Erreur base de donnees' }) };
    }

    // Build booking URL
    const bookingUrl = `${APP_URL}/rdv/${token}`;

    // Format available dates for the message
    const datesText = creneaux
      .map((c: { date: string; heures: string[] }) => {
        const d = new Date(c.date + 'T00:00');
        const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        return `  - ${jour} : ${c.heures.join(', ')}`;
      })
      .join('\n');

    // Send WhatsApp via Whapi
    const message = `Bonjour ${candidatNom.split(' ')[0]},\n\n` +
      `L'etude *${cabinetNom}* vous propose un rendez-vous.\n\n` +
      `Creneaux disponibles :\n${datesText}\n\n` +
      `Confirmez votre creneau en cliquant ici :\n${bookingUrl}\n\n` +
      `A bientot !`;

    const phone = candidatPhone.replace(/[^0-9]/g, '');
    const whatsappResponse = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: phone, body: message }),
    });

    const whatsappData = await whatsappResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        bookingUrl,
        whatsappSent: whatsappResponse.ok,
        whatsappData,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Erreur serveur' }),
    };
  }
};
