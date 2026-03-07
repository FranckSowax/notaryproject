// Webhook appele par Supabase quand un nouveau candidat est cree
// Envoie une notification email au cabinet + optionnel WhatsApp
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { record } = payload; // Supabase webhook payload

    console.log('Nouveau candidat:', record?.nom, record?.prenom);

    // TODO: Envoyer notification email au cabinet
    // TODO: Envoyer message WhatsApp si configure

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false }),
    };
  }
};
