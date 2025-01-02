import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';

interface PaymentHistory {
  id: string;
  tournament_id: string;
  amount: number;
  status: string;
  created_at: string;
  tournaments: {
    title: string;
  };
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
      subscribeToPayments();
    }
  }, [user]);

  async function fetchPaymentHistory() {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          tournaments (title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToPayments() {
    const subscription = supabase
      .channel('payment_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_requests',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchPaymentHistory();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Receipt className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-semibold">Payment History</h2>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{payment.tournaments.title}</h3>
                  <p className="text-sm text-gray-400">
                    Amount: ${payment.amount}
                  </p>
                  <p className="text-sm text-gray-400">
                    Date: {format(new Date(payment.created_at), 'PPp')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  payment.status === 'approved' ? 'bg-green-900 text-green-300' :
                  payment.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {payment.status === 'approved' ? 'Success' :
                   payment.status === 'pending' ? 'Pending' :
                   'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No payment history found
        </div>
      )}
    </div>
  );
}
