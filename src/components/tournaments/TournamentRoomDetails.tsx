import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Users, Copy, CheckCircle } from 'lucide-react';

interface RoomDetails {
  id: string;
  tournament_id: string;
  room_id: string;
  room_password: string;
  updated_at: string;
}

interface Props {
  tournamentId: string;
}

export default function TournamentRoomDetails({ tournamentId }: Props) {
  const { user } = useAuth();
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newRoomId, setNewRoomId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState<'id' | 'password' | null>(null);

  useEffect(() => {
    fetchRoomDetails();
    subscribeToRoomUpdates();
  }, [tournamentId]);

  async function fetchRoomDetails() {
    try {
      const { data, error } = await supabase
        .from('tournament_rooms')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single();

      if (error) throw error;
      setRoomDetails(data);
      setNewRoomId(data?.room_id || '');
      setNewPassword(data?.room_password || '');
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRoomUpdates() {
    const subscription = supabase
      .channel('tournament_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_rooms',
        filter: `tournament_id=eq.${tournamentId}`,
      }, () => {
        fetchRoomDetails();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleSave() {
    try {
      const { error } = await supabase
        .from('tournament_rooms')
        .upsert({
          tournament_id: tournamentId,
          room_id: newRoomId,
          room_password: newPassword,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setEditing(false);
      fetchRoomDetails();
    } catch (error) {
      console.error('Error updating room details:', error);
      alert('Failed to update room details');
    }
  }

  const handleCopy = (type: 'id' | 'password', value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-32"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Room Details
        </h2>
        {user?.role === 'admin' && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Update Details
          </button>
        )}
      </div>

      {editing && user?.role === 'admin' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Room ID
            </label>
            <input
              type="text"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Room Password
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNewRoomId(roomDetails?.room_id || '');
                setNewPassword(roomDetails?.room_password || '');
              }}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {roomDetails ? (
            <>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Room ID</p>
                  <p className="font-mono">{roomDetails.room_id}</p>
                </div>
                <button
                  onClick={() => handleCopy('id', roomDetails.room_id)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Copy Room ID"
                >
                  {copied === 'id' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Password</p>
                  <p className="font-mono">{roomDetails.room_password}</p>
                </div>
                <button
                  onClick={() => handleCopy('password', roomDetails.room_password)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Copy Password"
                >
                  {copied === 'password' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">
              Room details will be posted here before the tournament starts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
