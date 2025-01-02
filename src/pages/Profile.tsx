import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileInfo from '../components/profile/ProfileInfo';
import TournamentHistory from '../components/profile/TournamentHistory';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfo />
        <TournamentHistory />
      </div>
    </div>
  );
}
