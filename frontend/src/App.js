import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Explore from './components/Explore';
import Register from './components/Register';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
