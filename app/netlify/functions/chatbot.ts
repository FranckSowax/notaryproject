import type { Handler, HandlerResponse } from '@netlify/functions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ProjetContext {
  titre: string;
  description: string;
  type_bien: string;
  prix: number | null;
  surface: number | null;
  nb_pieces: number | null;
  nb_chambres: number | null;
  adresse: string;
  ville: string;
  quartier: string;
  contact_email: string;
  contact_phone: string;
  conditions_eligibilite: string[];
  documents_requis: { nom: string; description: string; obligatoire: boolean }[];
  produits: { nom: string; surface: number; prix: number; description: string }[];
  lien_localisation: string;
}

interface ChatRequest {
  message: string;
  conversation: { role: 'user' | 'assistant'; message: string }[];
  projet: ProjetContext;
}

function buildSystemPrompt(projet: ProjetContext): string {
  const formatFCFA = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const docs = projet.documents_requis
    ?.map(d => `- ${d.nom}${d.obligatoire ? ' (obligatoire)' : ' (facultatif)'}${d.description ? ': ' + d.description : ''}`)
    .join('\n') || 'Non renseigne';

  const conditions = projet.conditions_eligibilite?.length
    ? projet.conditions_eligibilite.map(c => `- ${c}`).join('\n')
    : 'Non renseigne';

  const produits = projet.produits?.length
    ? projet.produits.map(p => `- ${p.nom}: ${p.surface} m2, ${formatFCFA(p.prix)}${p.description ? ' - ' + p.description : ''}`).join('\n')
    : '';

  return `Tu es l'assistant virtuel du projet immobilier "${projet.titre}". Tu reponds aux questions des visiteurs de maniere professionnelle, chaleureuse et concise en francais.

INFORMATIONS DU PROJET:
- Titre: ${projet.titre}
- Description: ${projet.description || 'Non renseigne'}
- Type de bien: ${projet.type_bien || 'Non renseigne'}
- Prix: ${projet.prix ? formatFCFA(projet.prix) : 'Non renseigne'}
- Surface: ${projet.surface ? projet.surface + ' m2' : 'Non renseigne'}
- Nombre de pieces: ${projet.nb_pieces || 'Non renseigne'}
- Nombre de chambres: ${projet.nb_chambres || 'Non renseigne'}
- Adresse: ${projet.adresse || 'Non renseigne'}${projet.quartier ? ', ' + projet.quartier : ''}, ${projet.ville || 'Non renseigne'}
- Contact email: ${projet.contact_email || 'Non renseigne'}
- Contact telephone: ${projet.contact_phone || 'Non renseigne'}
${projet.lien_localisation ? `- Localisation: ${projet.lien_localisation}` : ''}

${produits ? `PARCELLES / OFFRES DISPONIBLES:\n${produits}` : ''}

DOCUMENTS REQUIS POUR L'INSCRIPTION:
${docs}

CONDITIONS D'ELIGIBILITE:
${conditions}

REGLES:
- Reponds UNIQUEMENT a partir des informations ci-dessus. Ne fabrique jamais d'informations.
- Si tu ne connais pas la reponse, dis-le honnement et invite le visiteur a contacter le cabinet directement.
- Encourage les visiteurs a s'inscrire via le formulaire sur la page.
- Sois concis (2-4 phrases maximum par reponse).
- Ne reponds qu'aux questions liees au projet immobilier. Pour toute autre question, redirige poliment vers le sujet du projet.
- Utilise un ton professionnel mais accessible.`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' } satisfies HandlerResponse;
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
    };
  }

  try {
    const { message, conversation, projet } = JSON.parse(event.body || '{}') as ChatRequest;

    if (!message || !projet) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing message or projet' }),
      };
    }

    const systemPrompt = buildSystemPrompt(projet);

    // Build messages from conversation history (last 10 exchanges max)
    const recentConversation = conversation?.slice(-20) || [];
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];
    for (const m of recentConversation) {
      if (m.role === 'user' || m.role === 'assistant') {
        messages.push({ role: m.role, content: m.message });
      }
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'AI service error' }),
      };
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Desolee, je n\'ai pas pu generer une reponse.';

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ response: assistantMessage }),
    };
  } catch (error) {
    console.error('Chatbot function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
