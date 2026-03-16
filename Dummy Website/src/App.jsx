import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userPassword');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>FileFox Dummy Website</h1>
      </header>
      <main>
        {isLoggedIn ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <Auth onLogin={() => setIsLoggedIn(true)} />
        )}
      </main>
    </div>
  );
}

export default App;
