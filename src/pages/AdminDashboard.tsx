import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface PendingRequest {
  id: string;
  tournament_id: string;
  user_id: string;
  created_at: string;
  users: {
    username: string;
    game_id?: string;
    game_name?: string;
  };
  tournaments: {
    title: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTournaments: 0,
    activeParticipants: 0,
    totalPrizePool: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.role === 'admin') {
      navigate('/');
      return;
    }

    fetchDashboardData();
    subscribeToRequests();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      
      // Fetch pending requests
      const { data: requests } = await supabase
        .from('tournament_requests')
        .select(`
          *,
          users (username, game_id, game_name),
          tournaments (title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(requests || []);

      // Fetch statistics
      const { data: usersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('prize_pool');

      const { data: participantsCount } = await supabase
        .from('tournament_participants')
        .select('id', { count: 'exact' });

      const totalPrizePool = tournamentsData?.reduce((sum, t) => sum + (t.prize_pool || 0), 0) || 0;

      setStats({
        totalUsers: usersCount?.length || 0,
        totalTournaments: tournamentsData?.length || 0,
        activeParticipants: participantsCount?.length || 0,
        totalPrizePool,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRequests() {
    const subscription = supabase
      .channel('tournament_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_requests',
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleRequest(requestId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('tournament_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      if (status === 'approved') {
        const request = pendingRequests.find(r => r.id === requestId);
        if (request) {
          const { error: participantError } = await supabase
            .from('tournament_participants')
            .insert({
              tournament_id: request.tournament_id,
              user_id: request.user_id,
              payment_status: 'pending'
            });

          if (participantError) throw participantError;
        }
      }

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Failed to process request');
    }
  }

  if (!user?.role === 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total Tournaments</p>
                <h3 className="text-2xl font-bold">{stats.totalTournaments}</h3>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Active Participants</p>
                <h3 className="text-2xl font-bold">{stats.activeParticipants}</h3>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total Prize Pool</p>
                <h3 className="text-2xl font-bold">${stats.totalPrizePool}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'tournaments'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Users
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Pending Tournament Requests</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-700 rounded-lg" />
                  ))}
                </div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{request.users.username}</h3>
                      <p className="text-sm text-gray-400">
                        Tournament: {request.tournaments.title}
                      </p>
                      {request.users.game_id && (
                        <p className="text-sm text-gray-400">
                          Game ID: {request.users.game_id}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequest(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRequest(request.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No pending requests
                </div>
              )}
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tournament Management</h2>
              {/* Tournament management interface */}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              {/* User management interface */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
