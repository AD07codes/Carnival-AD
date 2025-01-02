import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Shield } from 'lucide-react';

export default function TournamentChat({ tournamentId }: { tournamentId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    const subscription = subscribeToMessages();
    return () => subscription.unsubscribe();
  }, [tournamentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users:user_id (
          username,
          role
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    return supabase
      .channel(`chat:${tournamentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `tournament_id=eq.${tournamentId}`
      }, payload => {
        fetchMessages();
      })
      .subscribe();
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            tournament_id: tournamentId,
            user_id: user.id,
            message: newMessage.trim(),
            is_admin: user.role === 'admin'
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Tournament Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.user_id === user?.id ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{message.users?.username}</span>
              {message.users?.role === 'admin' && (
                <Shield className="w-4 h-4 text-purple-500" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.user_id === user?.id
                  ? 'bg-purple-600'
                  : message.users?.role === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gray-700'
              }`}
            >
              {message.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
            disabled={loading || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                     disabled:cursor-not-allowed p-2 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
