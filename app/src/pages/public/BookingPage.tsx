import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Calendar, Clock, MapPin, Phone, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface Creneau {
  date: string;
  heures: string[];
}

interface BookingData {
  id: string;
  metadata: {
    token: string;
    candidat_nom: string;
    type_rdv: string;
    creneaux: Creneau[];
    statut: string;
    date_rdv: string;
    heure: string;
    cabinet_nom: string;
    cabinet_adresse: string;
    cabinet_ville: string;
    cabinet_telephone: string;
    lien_maps: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  verification: 'Verification de documents',
  signature: 'Signature d\'acte',
  remise_cles: 'Remise des cles',
  autre: 'Rendez-vous',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function BookingPage() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHeure, setSelectedHeure] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmResult, setConfirmResult] = useState<{
    date: string; heure: string;
    cabinet: { nom: string; adresse: string; telephone: string; maps: string };
  } | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/.netlify/functions/confirm-rdv?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur');
        setBooking(data.booking);

        if (data.booking.metadata.statut === 'confirme') {
          setConfirmed(true);
          const meta = data.booking.metadata;
          const adresse = `${meta.cabinet_adresse || ''}, ${meta.cabinet_ville || ''}`.trim();
          const maps = meta.lien_maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
          setConfirmResult({
            date: formatDate(meta.date_rdv),
            heure: meta.heure,
            cabinet: { nom: meta.cabinet_nom, adresse, telephone: meta.cabinet_telephone, maps },
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lien invalide ou expire');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchBooking();
  }, [token]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedHeure || !token) return;
    setConfirming(true);
    try {
      const res = await fetch('/.netlify/functions/confirm-rdv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, date: selectedDate, heure: selectedHeure }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de confirmation');
      setConfirmed(true);
      setConfirmResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de confirmation');
    } finally {
      setConfirming(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Lien invalide</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;
  const meta = booking.metadata;

  // Confirmed state
  if (confirmed && confirmResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">RDV Confirme !</h1>
            <p className="text-slate-500 mt-1">Votre rendez-vous a ete enregistre</p>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-800 capitalize">{confirmResult.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-800">{confirmResult.heure}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">{confirmResult.cabinet.nom}</p>
                  <p className="text-sm text-slate-500">{confirmResult.cabinet.adresse}</p>
                </div>
              </div>
              {confirmResult.cabinet.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <a href={`tel:${confirmResult.cabinet.telephone}`} className="text-sm text-blue-600 hover:underline">
                    {confirmResult.cabinet.telephone}
                  </a>
                </div>
              )}
              <a
                href={confirmResult.cabinet.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Voir l'itineraire sur Google Maps</span>
              </a>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                Merci de vous munir de votre <strong>piece d'identite</strong> et de vos <strong>documents originaux</strong>.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            Un message de confirmation vous a ete envoye par WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // Selection state
  const selectedCreneaux = meta.creneaux?.find(c => c.date === selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:py-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">{meta.cabinet_nom}</h1>
          <p className="text-sm text-slate-500 mt-1">{TYPE_LABELS[meta.type_rdv] || 'Rendez-vous'}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">
        {/* Greeting */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-slate-700">
            Bonjour <strong>{meta.candidat_nom}</strong>, choisissez le creneau qui vous convient :
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Date selection */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Choisir une date
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {meta.creneaux?.map(c => (
              <button
                key={c.date}
                onClick={() => { setSelectedDate(c.date); setSelectedHeure(null); }}
                className={`p-3 rounded-xl text-center border-2 transition-all ${
                  selectedDate === c.date
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs text-slate-500 capitalize">{formatDateShort(c.date).split(' ')[0]}</div>
                <div className="font-bold text-lg">{new Date(c.date + 'T00:00').getDate()}</div>
                <div className="text-xs capitalize">{new Date(c.date + 'T00:00').toLocaleDateString('fr-FR', { month: 'short' })}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time selection */}
        {selectedDate && selectedCreneaux && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
              <Clock className="w-4 h-4 inline mr-1.5" />
              Choisir un horaire
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selectedCreneaux.heures.map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHeure(h)}
                  className={`py-3 px-2 rounded-xl text-center border-2 font-semibold transition-all ${
                    selectedHeure === h
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary and confirm */}
        {selectedDate && selectedHeure && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Recapitulatif :</strong><br />
                <span className="capitalize">{formatDate(selectedDate)}</span> a <strong>{selectedHeure}</strong>
              </p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-600/20"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmer le RDV
                </>
              )}
            </button>
          </div>
        )}

        {/* Cabinet info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-1" />
            <div className="text-sm text-slate-600">
              <p className="font-medium">{meta.cabinet_nom}</p>
              <p>{meta.cabinet_adresse}, {meta.cabinet_ville}</p>
            </div>
          </div>
          {meta.cabinet_telephone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <a href={`tel:${meta.cabinet_telephone}`} className="text-sm text-blue-600">{meta.cabinet_telephone}</a>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Propulse par NotarialPro
        </p>
      </div>
    </div>
  );
}
