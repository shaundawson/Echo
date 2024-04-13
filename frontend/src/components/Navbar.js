import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
            <div>
                <Link to="/">Home</Link> {/* Existing link */}
                {currentUser && <Link to="/create-post">Create Post</Link>} {/* Add this line */}
                {currentUser ? (
                    <>
                        <Link to={`/profile/${currentUser.user_id}`}>Profile</Link>
                        <button onClick={handleLogout}>Log Out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;