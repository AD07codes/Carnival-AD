import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, DollarSign, Gamepad, Shield, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section with 3D effect */}
      <div className="relative h-[600px] -mt-8 flex items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center rounded-b-[80px] transform hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-purple-900/70 rounded-b-[80px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 transform hover:-translate-y-2 transition-transform duration-500">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Welcome to Carnival-AD
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Join the ultimate Free Fire tournament platform. Compete with the best players,
            win amazing prizes, and become a legend in the gaming community.
          </p>
          {!user && (
            <Link
              to="/auth"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold 
                       transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Features Section with 3D Cards */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Why Choose Carnival-AD?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Tournaments</h3>
            <p className="text-gray-400">
              Participate in well-organized tournaments with clear rules and professional management.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Exciting Prize Pools</h3>
            <p className="text-gray-400">
              Compete for substantial prize pools and earn recognition in the gaming community.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fair Play & Security</h3>
            <p className="text-gray-400">
              Advanced anti-cheat systems and strict monitoring ensure fair competition for all players.
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Active Community</h3>
            <p className="text-gray-400">
              Join a thriving community of passionate gamers and make new friends along the way.
            </p>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Gamepad className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Regular Events</h3>
            <p className="text-gray-400">
              Weekly and monthly tournaments ensure there's always something exciting to participate in.
            </p>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-gray-800 rounded-xl p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ranking System</h3>
            <p className="text-gray-400">
              Climb the leaderboards and earn recognition as one of the top players in the community.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 rounded-[40px] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of players already competing in our tournaments.
            Don't miss out on the action!
          </p>
          {!user ? (
            <Link
              to="/auth"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold 
                       transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Create Account
            </Link>
          ) : (
            <Link
              to="/tournaments"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-semibold 
                       transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Browse Tournaments
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
