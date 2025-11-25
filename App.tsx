import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';

const STORAGE_KEY = 'strava_access_token';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem(STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const handleTokenSubmit = (newToken: string) => {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  if (!isInitialized) return null; // Or a loading spinner

  return (
    <>
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <AuthScreen onTokenSubmit={handleTokenSubmit} />
      )}
    </>
  );
};

export default App;
