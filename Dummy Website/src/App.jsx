import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

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
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <a href="/" className="d-flex align-items-center text-dark text-decoration-none">
          <span className="fs-2 fw-bold text-primary">FileFox</span>
        </a>
      </header>

      <main>
        {isLoggedIn ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <Auth onLogin={() => setIsLoggedIn(true)} />
        )}
      </main>

      <footer className="pt-3 mt-4 text-muted border-top">
        &copy; {new Date().getFullYear()} FileFox - Secure File Storage
      </footer>
    </div>
  );
}

export default App;
