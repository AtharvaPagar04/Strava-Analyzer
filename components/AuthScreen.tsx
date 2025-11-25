import React, { useState } from 'react';
import { KeyRound, ExternalLink, Activity } from 'lucide-react';

interface AuthScreenProps {
  onTokenSubmit: (token: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onTokenSubmit }) => {
  const [inputToken, setInputToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.length < 10) {
      setError('Please enter a valid Strava Access Token');
      return;
    }
    onTokenSubmit(inputToken);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 p-3 rounded-full mb-4 shadow-lg shadow-orange-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StravaLens AI</h1>
          <p className="text-slate-400 text-center">
            Connect your Strava account to view analytics and get AI-powered coaching insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-300 mb-2">
              Access Token
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                id="token"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Paste your Access Token here"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-lg hover:shadow-orange-500/25"
          >
            Connect Dashboard
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            How to get a token
          </h4>
          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
            <li>Go to your <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 inline-flex items-center gap-1">Strava API Settings <ExternalLink className="w-3 h-3" /></a></li>
            <li>Create an application if you haven't already.</li>
            <li>Copy the <strong>Your Access Token</strong> from the "My Access Token" section.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
