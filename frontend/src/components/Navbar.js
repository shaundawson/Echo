import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!currentUser) {
        return null; // Do not display the navbar if there is no logged-in user
    }

    return (
        <nav>
            <div>{currentUser.username}</div> {/* Display the user's username */}
            <div>
                <button onClick={handleLogout}>Log Out</button>
            </div>
        </nav>
    );
};

export default Navbar;
