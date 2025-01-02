import React, { useState, useEffect } from 'react';
import { User, GamepadIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/user';

const ProfileInfo: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [gameId, setGameId] = useState('');
    const [gameName, setGameName] = useState(''); // New state for game name
    const [isEditing, setIsEditing] = useState(false); // State for editing mode

    useEffect(() => {
        if (user?.numeric_id) {
            fetchProfile(user.numeric_id);
        } else {
            setLoading(false);
            console.error('User ID is not available. User object:', user);
        }
    }, [user?.numeric_id]);

    async function fetchProfile(userId: number) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('numeric_id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
            setGameId(data.game_id || '');
            setGameName(data.game_name || ''); // Set initial game name
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }

    const updateProfile = async (userId: number, profileData: object) => {
        setUpdating(true);
        const { data, error } = await supabase
            .from('users')
            .update(profileData)
            .eq('numeric_id', userId);

        if (error) {
            console.error('Error updating profile:', error.message);
            setUpdating(false);
            return;
        }

        console.log('Profile updated:', data);
        setUpdating(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        const profileData = { game_id: gameId, game_name: gameName };
        updateProfile(user?.numeric_id as number, profileData);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{profile?.username}</h2>
                    <p className="text-gray-400">{user?.email}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="gameId" className="block text-sm font-medium text-gray-400 mb-1">
                        Free Fire Game ID
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <GamepadIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                id="gameId"
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none 
                                         focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your Free Fire ID"
                                disabled={!isEditing} // Disable input when not editing
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="gameName" className="block text-sm font-medium text-gray-400 mb-1">
                        Game Name
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                id="gameName"
                                value={gameName}
                                onChange={(e) => setGameName(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg pl-4 pr-4 py-2 focus:outline-none 
                                         focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter your Game Name"
                                disabled={!isEditing} // Disable input when not editing
                            />
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={updating || (gameId === profile?.game_id && gameName === profile?.game_name)}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                                     disabled:cursor-not-allowed px-4 py-2 rounded-lg"
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
