import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ChatbotMessage {
  id: string;
  created_at: string;
  session_id: string;
  candidat_id: string | null;
  role: 'user' | 'assistant';
  message: string;
  candidats?: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  } | null;
}

interface Conversation {
  sessionId: string;
  candidatId: string | null;
  candidatNom: string;
  candidatPrenom: string;
  candidatEmail: string;
  candidatTelephone: string;
  lastMessage: string;
  lastMessageDate: string;
  messageCount: number;
  messages: ChatbotMessage[];
}

export function MessagesPage() {
  const { cabinetId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!cabinetId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*, candidats(nom, prenom, email, telephone)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper les messages par session_id
      const grouped = new Map<string, ChatbotMessage[]>();
      for (const msg of (data as ChatbotMessage[]) || []) {
        const key = msg.session_id || msg.candidat_id || msg.id;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(msg);
      }

      // Construire les conversations
      const convos: Conversation[] = [];
      grouped.forEach((messages, sessionId) => {
        // Trier les messages par date croissante dans chaque conversation
        messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const firstWithCandidat = messages.find((m) => m.candidats);
        const candidat = firstWithCandidat?.candidats;

        convos.push({
          sessionId,
          candidatId: messages[0].candidat_id,
          candidatNom: candidat?.nom || 'Visiteur',
          candidatPrenom: candidat?.prenom || 'Anonyme',
          candidatEmail: candidat?.email || '',
          candidatTelephone: candidat?.telephone || '',
          lastMessage: messages[messages.length - 1].message,
          lastMessageDate: messages[messages.length - 1].created_at,
          messageCount: messages.length,
          messages,
        });
      });

      // Trier par date du dernier message (plus recent en premier)
      convos.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());

      setConversations(convos);
      setFilteredConversations(convos);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filtrage par recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredConversations(
      conversations.filter(
        (c) =>
          c.candidatNom.toLowerCase().includes(term) ||
          c.candidatPrenom.toLowerCase().includes(term) ||
          c.candidatEmail.toLowerCase().includes(term) ||
          c.lastMessage.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, conversations]);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
    setMobileShowThread(true);
  };

  const handleBackToList = () => {
    setMobileShowThread(false);
    setSelectedConversation(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const openWhatsApp = (telephone: string) => {
    const cleaned = telephone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  // -- Conversation List --
  const renderConversationList = () => (
    <div className="flex flex-col h-full">
      {/* Recherche */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              Aucune conversation pour le moment
            </h3>
            <p className="text-sm text-slate-500">
              Les conversations avec les candidats apparaitront ici
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredConversations.map((convo) => (
              <button
                key={convo.sessionId}
                onClick={() => handleSelectConversation(convo)}
                className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${
                  selectedConversation?.sessionId === convo.sessionId
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : ''
                }`}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                    {getInitials(convo.candidatNom, convo.candidatPrenom)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900 truncate text-sm">
                      {convo.candidatPrenom} {convo.candidatNom}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(convo.lastMessageDate)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {convo.lastMessage}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {convo.messageCount} message{convo.messageCount > 1 ? 's' : ''}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // -- Thread view --
  const renderThread = () => {
    if (!selectedConversation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">
            Selectionnez une conversation
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Cliquez sur une conversation pour afficher les messages
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header du thread */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-white">
          <button
            onClick={handleBackToList}
            className="lg:hidden p-1 hover:bg-slate-100 rounded-md"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
              {getInitials(selectedConversation.candidatNom, selectedConversation.candidatPrenom)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">
              {selectedConversation.candidatPrenom} {selectedConversation.candidatNom}
            </p>
            {selectedConversation.candidatEmail && (
              <p className="text-xs text-slate-500 truncate">
                {selectedConversation.candidatEmail}
              </p>
            )}
          </div>
          {selectedConversation.candidatTelephone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openWhatsApp(selectedConversation.candidatTelephone)}
              className="shrink-0"
            >
              <Phone className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Contacter via WhatsApp</span>
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-2xl mx-auto">
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {formatFullDate(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">
          {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Layout principal */}
      <Card className="overflow-hidden border border-slate-200" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Desktop : 2 colonnes */}
        <div className="hidden lg:grid lg:grid-cols-[360px_1fr] h-full">
          <div className="border-r border-slate-200 h-full overflow-hidden">
            {renderConversationList()}
          </div>
          <div className="h-full overflow-hidden">
            {renderThread()}
          </div>
        </div>

        {/* Mobile : 1 colonne */}
        <div className="lg:hidden h-full overflow-hidden">
          {mobileShowThread ? renderThread() : renderConversationList()}
        </div>
      </Card>
    </div>
  );
}
