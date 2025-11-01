import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../data/mockData';

type AuthMode = 'welcome' | 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const testUser = MOCK_USERS[0];
      await signIn(testUser.email, testUser.password);
    } catch (err) {
      setError('שגיאה בהתחברות דרך Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const testUser = MOCK_USERS[1];
      await signIn(testUser.email, testUser.password);
    } catch (err) {
      setError('שגיאה בהתחברות דרך Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const testUser = MOCK_USERS[2];
      await signIn(testUser.email, testUser.password);
    } catch (err) {
      setError('שגיאה בהתחברות דרך Microsoft');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError('שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, name);
    } catch (err) {
      setError('שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'welcome' && (
          <div className="bg-gray-800 rounded-lg p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-white">vaxtop</h1>
              <p className="text-gray-400">ברוכים הבאים לפלטפורמה</p>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-300 text-sm">{error}</div>}

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>🔵</span>
                התחברות דרך Google
              </button>

              <button
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>🍎</span>
                התחברות דרך Apple
              </button>

              <button
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>🔷</span>
                התחברות דרך Microsoft
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">או</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMode('login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                התחברות
              </button>
              <button
                onClick={() => setMode('signup')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                הרשמה
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="bg-gray-800 rounded-lg p-8 shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">התחברות</h2>
            {error && <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-300 text-sm">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder='דוא"ל'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-4 py-2"
              />
              <input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-4 py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 rounded-lg"
              >
                {loading ? 'מטעין...' : 'התחברות'}
              </button>
            </form>
            <button
              onClick={() => setMode('welcome')}
              className="w-full text-gray-400 hover:text-gray-300 py-2"
            >
              חזרה
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <div className="bg-gray-800 rounded-lg p-8 shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">הרשמה</h2>
            {error && <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-300 text-sm">{error}</div>}
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                placeholder="שם"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-4 py-2"
              />
              <input
                type="email"
                placeholder='דוא"ל'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-4 py-2"
              />
              <input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-4 py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 rounded-lg"
              >
                {loading ? 'מטעין...' : 'הרשמה'}
              </button>
            </form>
            <button
              onClick={() => setMode('welcome')}
              className="w-full text-gray-400 hover:text-gray-300 py-2"
            >
              חזרה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
