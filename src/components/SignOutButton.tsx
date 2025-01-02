import React from 'react';
import { supabase } from '../lib/supabaseClient';

const SignOutButton: React.FC = () => {
    const handleSignOut = async () => {
        console.log('Sign-out button clicked');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            console.log('Successfully signed out');
        }
    };

    return (
        <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
        </button>
    );
};

export default SignOutButton;
