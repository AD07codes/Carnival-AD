import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface PaymentRequest {
  id: string;
  tournament_id: string;
  user_id: string;
  utr_number: string;
  payer_name: string;
  amount: number;
  status: string;
  created_at: string;
  users: {
    email: string;
  };
  tournaments: {
    title: string;
  };
}

export default function PaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    subscribeToRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          users (email),
          tournaments (title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRequests() {
    const subscription = supabase
      .channel('payment_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_requests'
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleRequest(requestId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          // Update tournament participant status
          const { error: participantError } = await supabase
            .from('tournament_participants')
            .update({ payment_status: 'completed' })
            .eq('tournament_id', request.tournament_id)
            .eq('user_id', request.user_id);

          if (participantError) throw participantError;
        }
      }

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error handling payment request:', error);
      alert('Failed to process payment request');
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Payment Requests</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No pending payment requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-800 rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{request.payer_name}</h3>
                  <p className="text-sm text-gray-400">{request.users.email}</p>
                  <p className="text-sm text-gray-400">Tournament: {request.tournaments.title}</p>
                  <p className="text-sm text-gray-400">UTR Number: {request.utr_number}</p>
                  <p className="text-sm text-gray-400">
                    Amount: ${request.amount}
                  </p>
                  <p className="text-sm text-gray-400">
                    Submitted: {format(new Date(request.created_at), 'PPp')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(request.id, 'approved')}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRequest(request.id, 'rejected')}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
