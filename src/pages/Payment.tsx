import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export default function Payment() {
  const { tournamentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  const UPI_ID = 'darkevil@yespop'; // This could be fetched from admin settings

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setShowQR(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Create payment request
      const { error: requestError } = await supabase
        .from('payment_requests')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          utr_number: utrNumber,
          payer_name: name,
          status: 'pending',
          amount: parseFloat(amount)
        });

      if (requestError) throw requestError;

      navigate(`/tournaments/${tournamentId}`);
      alert('Payment verification request submitted! Waiting for admin approval.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-center mb-8">Tournament Payment</h2>

          {!showQR ? (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-400 mb-1">
                  Entry Fee Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold"
              >
                Proceed to Payment
              </button>
            </form>
          ) : (
            <>
              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&am=${amount}&pn=Tournament%20Entry%20Fee`}
                  alt="Payment QR Code"
                  className="rounded-lg"
                />
              </div>

              {/* UPI ID */}
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">UPI ID</p>
                  <p className="font-mono">{UPI_ID}</p>
                </div>
                <button
                  onClick={handleCopyUPI}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="utr" className="block text-sm font-medium text-gray-400 mb-1">
                    UTR Number
                  </label>
                  <input
                    type="text"
                    id="utr"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                           disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
                >
                  {loading ? 'Submitting...' : 'Submit Payment Details'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
