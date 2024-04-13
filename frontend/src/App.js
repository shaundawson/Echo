import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Explore from './components/Explore';
import Register from './components/Register';
import Profile from './components/Profile';
import Feed from './components/Feed';





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
            <Route path="/feed" element={<Feed />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
