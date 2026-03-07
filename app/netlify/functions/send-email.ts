// Fonction pour envoyer des emails de notification
// Utilise l'API Resend ou similaire
// Triggered quand un nouveau candidat s'inscrit
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { to, subject, html } = JSON.parse(event.body || '{}');

    // Pour l'instant, log simplement (a configurer avec un service email)
    console.log('Email notification:', { to, subject });

    // TODO: Integrer un service email (Resend, SendGrid, etc.)
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ from: 'NotarialPro <noreply@notarialpro.ga>', to, subject, html }),
    // });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email envoye' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Erreur lors de l'envoi" }),
    };
  }
};
