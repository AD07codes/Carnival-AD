import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../contexts/AuthContext';
    import AdminGuard from '../components/guards/AdminGuard';
    import TournamentForm from '../components/tournaments/TournamentForm';

    export default function CreateTournament() {
      const navigate = useNavigate();
      const { user } = useAuth();
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');

      const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        entryFee: 0,
        maxParticipants: 100,
        prizePool: 0,
        rules: ''
      });

      async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        try {
          setLoading(true);
          setError('');

          const { data, error: createError } = await supabase
            .from('tournaments')
            .insert([{
              title: formData.title,
              description: formData.description,
              start_time: formData.startTime,
              entry_fee: formData.entryFee,
              max_participants: formData.maxParticipants,
              prize_pool: formData.prizePool,
              rules: formData.rules,
              status: 'upcoming',
              created_by: user.id
            }])
            .select()
            .single();

          if (createError) throw createError;
          navigate(`/tournaments/${data.id}`);
        } catch (err: any) {
          setError(err.message || 'Failed to create tournament');
        } finally {
          setLoading(false);
        }
      }

      const handleFormChange = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
      };

      return (
        <AdminGuard>
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create Tournament</h1>
            <TournamentForm
              formData={formData}
              onChange={handleFormChange}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
            />
          </div>
        </AdminGuard>
      );
    }
