import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send } from 'lucide-react';
import { ChatMessage } from '../../types/chat';

interface Props {
  tournamentId: string;
}

export default function TournamentChat({ tournamentId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      checkParticipantStatus();
      fetchMessages();
      subscribeToMessages();
    }
  }, [tournamentId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function checkParticipantStatus() {
    try {
      const { data } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user?.id)
        .single();

      setIsParticipant(!!data);
    } catch (error) {
      console.error('Error checking participant status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, users:user_id(username)')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  }

  function subscribeToMessages() {
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `tournament_id=eq.${tournamentId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user || !isParticipant) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        message: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse h-[600px]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Tournament Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.user_id === user?.id ? 'items-end' : 'items-start'
            }`}
          >
            <div className="text-sm text-gray-400">
              {message.users?.username}
            </div>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.user_id === user?.id
                ? 'bg-purple-600'
                : 'bg-gray-700'
            }`}>
              {message.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isParticipant ? (
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                       disabled:cursor-not-allowed p-2 rounded-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-700 text-center text-gray-400">
          You must be a participant to chat in this tournament
        </div>
      )}
    </div>
  );
}
