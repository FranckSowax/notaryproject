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

  // GET: Fetch booking data by token
  if (event.httpMethod === 'GET') {
    const token = event.queryStringParameters?.token;
    if (!token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Token manquant' }) };
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('type', 'rendez_vous')
      .filter('metadata->>token', 'eq', token)
      .single();

    if (error || !data) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Demande introuvable ou expiree' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ booking: data }) };
  }

  // POST: Confirm the booking
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { token, date, heure } = JSON.parse(event.body || '{}');
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

    // Fetch the booking request
    const { data: booking, error: fetchErr } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('type', 'rendez_vous')
      .filter('metadata->>token', 'eq', token)
      .single();

    if (fetchErr || !booking) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Demande introuvable' }) };
    }

    const metadata = booking.metadata as Record<string, unknown>;

    if (metadata.statut === 'confirme') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ce rendez-vous est deja confirme' }) };
    }

    // Update the booking with confirmed date/time
    const updatedMetadata = {
      ...metadata,
      statut: 'confirme',
      date_rdv: date,
      heure: heure,
    };

    const { error: updateErr } = await supabase
      .from('activity_logs')
      .update({ metadata: updatedMetadata, description: `RDV confirme - ${metadata.candidat_nom} - ${date} ${heure}` } as never)
      .eq('id', booking.id);

    if (updateErr) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erreur mise a jour' }) };
    }

    // Format the date for messages
    const dateObj = new Date(date + 'T00:00');
    const dateFormatted = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Build Google Maps link
    const adresseComplete = `${metadata.cabinet_adresse || ''}, ${metadata.cabinet_ville || ''}`.trim();
    const mapsLink = metadata.lien_maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresseComplete)}`;

    if (WHAPI_TOKEN) {
      // Send confirmation to the candidate
      const candidatPhone = String(metadata.candidat_phone || '').replace(/[^0-9]/g, '');
      const prenomCandidat = String(metadata.candidat_nom || '').split(' ')[0];

      if (candidatPhone) {
        const confirmMsg = `Bonjour ${prenomCandidat},\n\n` +
          `Votre rendez-vous est confirme !\n\n` +
          `*${dateFormatted} a ${heure}*\n\n` +
          `Lieu : *${metadata.cabinet_nom}*\n` +
          `${adresseComplete}\n` +
          `Tel: ${metadata.cabinet_telephone || ''}\n\n` +
          `Itineraire : ${mapsLink}\n\n` +
          `Merci de vous munir de votre piece d'identite et de vos documents originaux.\n\n` +
          `A bientot !`;

        await fetch('https://gate.whapi.cloud/messages/text', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${WHAPI_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: candidatPhone, body: confirmMsg }),
        });
      }

      // Notify the admin (send to cabinet phone if available)
      const cabinetPhone = String(metadata.cabinet_telephone || '').replace(/[^0-9]/g, '');
      if (cabinetPhone && cabinetPhone.length >= 8) {
        const adminMsg = `Nouveau RDV confirme !\n\n` +
          `Candidat : *${metadata.candidat_nom}*\n` +
          `Date : *${dateFormatted} a ${heure}*\n` +
          `Type : ${metadata.type_rdv}\n` +
          `Tel candidat : ${metadata.candidat_phone}`;

        await fetch('https://gate.whapi.cloud/messages/text', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${WHAPI_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: cabinetPhone, body: adminMsg }),
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Rendez-vous confirme',
        date: dateFormatted,
        heure,
        cabinet: {
          nom: metadata.cabinet_nom,
          adresse: adresseComplete,
          telephone: metadata.cabinet_telephone,
          maps: mapsLink,
        },
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Erreur serveur' }) };
  }
};
