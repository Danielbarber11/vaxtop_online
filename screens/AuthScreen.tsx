import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../data/mockData';
import { User } from '../types';
import { GoogleGenAI } from "@google/genai";
import Modal from '../components/Modal';
import TermsModal from '../components/TermsModal';

type AuthMode = 'welcome' | 'login' | 'signup' | 'forgot_password_question' | 'forgot_password_reset';

const TermsOfServiceModal: React.FC<{onAgree: () => void, onClose: () => void}> = ({ onAgree, onClose }) => {
  const [isChecked, setIsChecked] = useState(false);
  
  return (
    <Modal isOpen={true} onClose={onClose} title="תנאי שימוש">
      <div className="flex flex-col gap-4 max-h-[60vh]">
        <div className="overflow-y-auto p-2 bg-gray-900/50 rounded-lg text-sm text-gray-300 space-y-2">
          <h3 className="font-bold text-base text-white">1. כללי</h3>
          <p>ברוכים הבאים לאתר vaxtop. השימוש באתר, לרבות בתכנים הכלולים בו ובשירותים השונים הפועלים בו, מעיד על הסכמתך לתנאים אלה, ולכן הנך מתבקש לקרוא אותם בקפידה.</p>
          <h3 className="font-bold text-base text-white">2. קניין רוחני</h3>
          <p>כל זכויות הקניין הרוחני באתר, לרבות עיצובו, קוד המקור, התכנים והסימנים המסחריים, הינם רכושו הבלעדי של vaxtop או של צדדים שלישיים שהעניקו לאתר הרשאה להשתמש בהם.</p>
          <h3 className="font-bold text-base text-white">3. אחריות המשתמש</h3>
          <p>הנך מתחייב שלא להעלות, לשלוף, לשדר, להפיץ או לפרסם מידע או חומר אחר אשר הינו בלתי חוקי, מאיים, גס, פוגעני, או מהווה לשון הרע. <strong className="text-yellow-300">האחריות המלאה על כל תוכן שאתה מעלה לאתר חלה עליך בלבד.</strong></p>
          <h3 className="font-bold text-base text-white">4. הגבלת אחריות</h3>
          <p>השירות באתר ניתן לשימוש כמות שהוא (AS IS). לא תהיה לך כל טענה, תביעה או דרישה כלפי vaxtop בגין תכונות השירות, יכולותיו, מגבלותיו או התאמתו לצרכיך ולדרישותיך.</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} className="w-5 h-5 accent-accent" />
          <span>קראתי ואני מסכים לתנאי השימוש</span>
        </label>
        <button 
          onClick={onAgree} 
          disabled={!isChecked}
          className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          המשך
        </button>
      </div>
    </Modal>
  );
};

const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithMicrosoft, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showTos, setShowTos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'התחברות נכשלה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'הרשמה נכשלה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google התחברות נכשלה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithApple();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple התחברות נכשלה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithMicrosoft();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft התחברות נכשלה');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">התחברות</h2>
            <input
              type="email"
              placeholder="מייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </button>
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="text-sm text-gray-400 hover:underline mt-2"
            >
              חזור
            </button>
          </form>
        );
      case 'signup':
        return (
          <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">יצירת חשבון</h2>
            <input
              type="text"
              placeholder="שם"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <input
              type="email"
              placeholder="מייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? 'מעבד...' : 'צור חשבון'}
            </button>
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="text-sm text-gray-400 hover:underline mt-2"
            >
              חזור
            </button>
          </form>
        );
      default:
        return (
          <div className="text-center flex flex-col gap-4 w-full">
            <h1 className="text-4xl font-bold">ברוך הבא ל-vaxtop</h1>
            
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600 flex items-center justify-center gap-2"
              >
                🔵 התחבר דרך Google
              </button>
              <button
                onClick={handleAppleSignIn}
                disabled={isLoading}
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-600 flex items-center justify-center gap-2"
              >
                🍎 התחבר דרך Apple
              </button>
              <button
                onClick={handleMicrosoftSignIn}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 flex items-center justify-center gap-2"
              >
                🔶 התחבר דרך Microsoft
              </button>
            </div>
            
            {/* Traditional Login */}
            <div className="border-t border-gray-600 my-4"></div>
            
            <button
              onClick={() => setMode('login')}
              className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors w-full"
            >
              התחבר
            </button>
            <button
              onClick={() => setMode('signup')}
              className="bg-gray-700 text-secondary font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors w-full"
            >
              צור חשבון
            </button>
            <button
              onClick={() => setMode('welcome')}
              className="text-gray-400 hover:underline mt-4"
            >
              המשך כאורח
            </button>
          </div>
        );
    }
  };

  return (
    <div className="bg-primary text-secondary min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        {renderForm()}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AuthScreen;
