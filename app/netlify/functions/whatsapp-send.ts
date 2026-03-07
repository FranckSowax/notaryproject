// Proxy pour envoyer des messages WhatsApp via l'API WHAPI
// Evite d'exposer le token WHAPI cote client
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { phone, message } = JSON.parse(event.body || '{}');
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN;

    if (!WHAPI_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'WHAPI_TOKEN non configure' }),
      };
    }

    const response = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone.replace('+', ''),
        body: message,
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 400,
      body: JSON.stringify({ success: response.ok, data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Erreur WhatsApp' }),
    };
  }
};
