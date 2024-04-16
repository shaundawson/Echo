import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css'; // This line imports the CSS from above


const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!currentUser) {
        // Do not display the navbar if there is no logged-in user
        return null;
    }

    return (
        <nav>
            <div>
                <Link to="/">Home</Link> {/* Existing link */}
                {currentUser && (
                    <>
                        <Link to="/create-post">Create Post</Link> {/* Link for creating posts */}
                        <Link to="/feed">Your Posts</Link> {/* Link to view all posts by the user */}
                        <Link to="/all-posts">Friend Activity</Link> {/* Link to view all posts from all users */}
                        <Link to="/users">All Users</Link> {/* Link to view all users and their bios */}
                        <Link to={`/profile/${currentUser.user_id}`}>Profile</Link>
                        <button onClick={handleLogout}>Log Out</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
