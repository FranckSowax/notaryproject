import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotesInternes, useAddNote } from '@/hooks/useCalendrier';

interface NotesInternesProps {
  candidatId: string;
  projetId: string;
}

export function NotesInternes({ candidatId, projetId }: NotesInternesProps) {
  const { user } = useAuth();
  const { notes, loading, refresh } = useNotesInternes(candidatId, projetId);
  const { addNote, loading: adding } = useAddNote();
  const [contenu, setContenu] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSubmit = async () => {
    if (!contenu.trim()) return;
    const auteur = user ? `${(user as any).prenom} ${(user as any).nom}` : 'Utilisateur';
    const ok = await addNote({ candidatId, projetId, contenu: contenu.trim(), auteur });
    if (ok) { setContenu(''); refresh(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4" />
          Notes internes
          <Badge variant="secondary" className="ml-auto">{notes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
          {loading && <p className="text-sm text-slate-500 text-center py-4">Chargement...</p>}
          {!loading && notes.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucune note</p>}
          {notes.map(note => (
            <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-medium text-slate-700">{note.metadata?.auteur || 'Inconnu'}</span>
                <span className="text-xs text-slate-400 ml-auto">
                  {new Date(note.created_at).toLocaleDateString('fr-FR')} {new Date(note.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{note.description}</p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            placeholder="Ajouter une note..."
            rows={2}
            className="resize-none"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          />
          <Button size="icon" onClick={handleSubmit} disabled={adding || !contenu.trim()} className="shrink-0 self-end">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
