import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Explore from './components/Explore';
import Register from './components/Register';
import Profile from './components/Profile';
import CreatePost from './components/CreatePost';
import Feed from './components/Feed';
import Post from './components/Post';
import UserFeed from './components/UserFeed';
import AllPosts from './components/AllPosts';





function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/all-posts" element={<AllPosts />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/post" element={<Post />} />
            <Route path="/users" element={<UserFeed />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;