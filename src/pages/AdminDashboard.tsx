import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PaymentSettings from '../components/admin/PaymentSettings';
import {
  Users,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Settings,
  CreditCard
} from 'lucide-react';

// ... (keep existing interfaces)

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTournaments: 0,
    activeParticipants: 0,
    totalPrizePool: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  // ... (keep existing useEffect and fetchDashboardData)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... (keep existing stat cards) */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Pending Payments</p>
                <h3 className="text-2xl font-bold">{stats.pendingPayments}</h3>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Payment Settings
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'tournaments'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
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
          {activeTab === 'dashboard' && (
            <div>
              {/* ... (keep existing dashboard content) */}
            </div>
          )}

          {activeTab === 'payments' && (
            <PaymentSettings />
          )}

          {activeTab === 'tournaments' && (
            <div>
              {/* ... (keep existing tournaments content) */}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {/* ... (keep existing users content) */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
