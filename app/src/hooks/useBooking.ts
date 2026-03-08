import { useState } from 'react';

interface Creneau {
  date: string;
  heures: string[];
}

interface SendBookingParams {
  candidatId: string;
  candidatNom: string;
  candidatPhone: string;
  projetId: string;
  typeRdv: string;
  creneaux: Creneau[];
  cabinetId: string;
  cabinetNom: string;
  cabinetAdresse: string;
  cabinetVille: string;
  cabinetTelephone: string;
  lienMaps: string;
}

export function useSendBookingRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (params: SendBookingParams) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/.netlify/functions/send-rdv-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }

      return data as { success: true; token: string; bookingUrl: string; whatsappSent: boolean };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, error };
}
