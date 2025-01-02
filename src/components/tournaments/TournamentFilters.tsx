import React from 'react';
import { Filter } from 'lucide-react';

interface Props {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function TournamentFilters({ currentFilter, onFilterChange }: Props) {
  return (
    <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
      <Filter className="w-5 h-5 text-gray-400" />
      <div className="flex space-x-2">
        {['all', 'upcoming', 'ongoing', 'completed'].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1 rounded-lg capitalize ${
              currentFilter === filter
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
