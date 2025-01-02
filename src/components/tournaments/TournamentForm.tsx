import React from 'react';
    import { Trophy, Calendar, Users, DollarSign } from 'lucide-react';

    interface FormData {
      title: string;
      description: string;
      startTime: string;
      entryFee: number;
      maxParticipants: number;
      prizePool: number;
      rules: string;
    }

    interface Props {
      formData: FormData;
      onChange: (data: Partial<FormData>) => void;
      loading: boolean;
      error: string;
      onSubmit: (e: React.FormEvent) => void;
    }

    export default function TournamentForm({ formData, onChange, loading, error, onSubmit }: Props) {
      return (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                Tournament Title
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-400 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => onChange({ startTime: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-400 mb-1">
                  Entry Fee ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="entryFee"
                    min="0"
                    step="0.01"
                    value={formData.entryFee}
                    onChange={(e) => onChange({ entryFee: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prizePool" className="block text-sm font-medium text-gray-400 mb-1">
                  Prize Pool ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="prizePool"
                    min="0"
                    step="0.01"
                    value={formData.prizePool}
                    onChange={(e) => onChange({ prizePool: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-400 mb-1">
                Max Participants
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="maxParticipants"
                  min="2"
                  value={formData.maxParticipants}
                  onChange={(e) => onChange({ maxParticipants: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="rules" className="block text-sm font-medium text-gray-400 mb-1">
                Tournament Rules
              </label>
              <textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => onChange({ rules: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={5}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                     disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
          >
            {loading ? 'Creating Tournament...' : 'Create Tournament'}
          </button>
        </form>
      );
    }
