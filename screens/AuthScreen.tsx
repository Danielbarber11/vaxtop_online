import React, { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
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
  const { login, enterAsGuest } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [userForReset, setUserForReset] = useState<User | null>(null);
  const [showGuestTos, setShowGuestTos] = useState(false);
  const [showViewTos, setShowViewTos] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const initialMode = localStorage.getItem('authMode');
    if (initialMode === 'login' || initialMode === 'signup') {
      setMode(initialMode);
    }
    localStorage.removeItem('authMode');
  }, []);

  const getAIFeedback = useCallback(async (prompt: string): Promise<string> => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (err) {
      console.error("AI feedback error:", err);
      return "שגיאה בקבלת משוב.";
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const validatePassword = useCallback(async () => {
    if (password.length > 0) {
      const prompt = `Analyze the strength of this password: "${password}". Provide a short, helpful recommendation for improvement in Hebrew. Focus on length, character types (upper, lower, number, symbol), and avoiding common patterns. Do not repeat the password. Start your response with "המלצת הבוט:".`;
      const feedback = await getAIFeedback(prompt);
      setPasswordFeedback(feedback);
    } else {
      setPasswordFeedback('');
    }
  }, [password, getAIFeedback]);

  const validateSecurityQuestion = useCallback(async () => {
    if (securityQuestion.length > 0 && name.length > 0) {
      const prompt = `The user's name is "${name}". They provided the following security question: "${securityQuestion}". Is this a good, secure question that is not easily guessable from their name or common knowledge? Please answer with a short, helpful recommendation for the user in Hebrew. If the question is good, say so. Start your response with "המלצת הבוט:".`;
      const feedback = await getAIFeedback(prompt);
      setQuestionFeedback(feedback);
    } else {
      setQuestionFeedback('');
    }
  }, [securityQuestion, name, getAIFeedback]);

  // FIX: Implement the missing handleLogin function to resolve the reference error.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      if (foundUser.isBlocked) {
        setError('חשבון זה נחסם.');
        return;
      }
      login(foundUser);
    } else {
      setError('מייל או סיסמה שגויים.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('יש למלא שם, מייל וסיסמה.');
      return;
    }
    if (securityQuestion && !securityAnswer) {
      setError('יש לספק תשובה לשאלת האבטחה.');
      return;
    }
    if (!tosAccepted) {
      setError('יש להסכים לתנאי השימוש.');
      return;
    }
    // FIX: Initialize missing properties 'subscriptions' and 'viewedNotifications' for the new User object.
    const newUser: User = {
      id: `u${MOCK_USERS.length + 1}`,
      name,
      email,
      password,
      securityQuestion: securityQuestion || undefined,
      securityAnswer: securityAnswer || undefined,
      isPartner: false,
      subscriptions: [],
      viewedNotifications: [],
      savedProducts: [],
      isBlocked: false,
    };
    MOCK_USERS.push(newUser);
    login(newUser);
  };
  
  const handleForgotPassword = () => {
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if(foundUser && foundUser.securityQuestion) {
          setUserForReset(foundUser);
          setMode('forgot_password_question');
          setError('');
      } else {
          setError('לא נמצא משתמש עם המייל הזה או שלא הוגדרה שאלת אבטחה.');
      }
  };
  
  const handleSecurityQuestionSubmit = () => {
      if(userForReset && securityAnswer.toLowerCase() === userForReset.securityAnswer?.toLowerCase()) {
          setMode('forgot_password_reset');
          setError('');
      } else {
          setError('התשובה שגויה.');
      }
  };

  const handlePasswordReset = () => {
      if(userForReset) {
          console.log(`Password for ${userForReset.email} has been reset to: ${password}`);
          alert('הסיסמה שונתה בהצלחה. אנא התחבר מחדש.');
          setPassword('');
          setSecurityAnswer('');
          setUserForReset(null);
          setMode('login');
      }
  }
  
  const handleGuestEntry = () => {
      setShowGuestTos(true);
  }
  
  const handleAgreeToS = () => {
      setShowGuestTos(false);
      enterAsGuest();
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">התחברות</h2>
            <input type="email" placeholder="מייל" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
            <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
            <button type="submit" className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors">התחבר</button>
            <button type="button" onClick={handleForgotPassword} className="text-sm text-gray-400 hover:underline">שכחתי סיסמה</button>
            <button type="button" onClick={() => setMode('welcome')} className="text-sm text-gray-400 hover:underline mt-2">חזור</button>
          </form>
        );
      case 'signup':
        return (
          <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center">יצירת חשבון</h2>
            <input type="text" placeholder="שם" value={name} onChange={e => setName(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
            <input type="email" placeholder="מייל" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
            <div>
              <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} onBlur={validatePassword} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
              {passwordFeedback && <p className="text-xs text-accent mt-1 p-1">{passwordFeedback}</p>}
            </div>
            <div>
              <input type="text" placeholder="שאלת אבטחה (אופציונלי)" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} onBlur={validateSecurityQuestion} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
              {questionFeedback && <p className="text-xs text-accent mt-1 p-1">{questionFeedback}</p>}
            </div>
            <input type="text" placeholder="תשובה לשאלת האבטחה" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
            
            <div className="my-1">
              <label htmlFor="tos" className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  id="tos"
                  checked={tosAccepted}
                  onChange={(e) => setTosAccepted(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent bg-gray-700 border-gray-600 focus:ring-accent"
                />
                <span>
                  אני מסכים/ה ל
                  <button type="button" onClick={() => setShowViewTos(true)} className="text-accent underline font-semibold mx-1">
                    תנאי השימוש ומדיניות הפרטיות
                  </button>.
                </span>
              </label>
            </div>

            <button type="submit" disabled={!tosAccepted} className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">צור חשבון</button>
            <button type="button" onClick={() => setMode('welcome')} className="text-sm text-gray-400 hover:underline mt-2">חזור</button>
          </form>
        );
    case 'forgot_password_question':
        return (
             <div className="w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center">אימות זהות</h2>
                <p className="text-center text-gray-300">{userForReset?.securityQuestion}</p>
                <input type="text" placeholder="התשובה שלך" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
                <button onClick={handleSecurityQuestionSubmit} className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors">אמת</button>
                <button type="button" onClick={() => setMode('login')} className="text-sm text-gray-400 hover:underline mt-2">חזור להתחברות</button>
            </div>
        )
    case 'forgot_password_reset':
        return (
            <div className="w-full flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center">איפוס סיסמה</h2>
                <input type="password" placeholder="סיסמה חדשה" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" required />
                <button onClick={handlePasswordReset} className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors">אפס סיסמה</button>
            </div>
        )
      default:
        return (
          <div className="text-center flex flex-col gap-4 w-full">
            <h1 className="text-4xl font-bold">ברוך הבא ל-vaxtop</h1>
            <button onClick={() => setMode('login')} className="bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors w-full">התחבר</button>
            <button onClick={() => setMode('signup')} className="bg-gray-700 text-secondary font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors w-full">צור חשבון</button>
            <button onClick={handleGuestEntry} className="text-gray-400 hover:underline mt-4">המשך כאורח</button>
          </div>
        );
    }
  };

  return (
    <div className="bg-primary text-secondary min-h-screen flex flex-col justify-center items-center p-6">
      {showGuestTos && <TermsOfServiceModal onAgree={handleAgreeToS} onClose={() => setShowGuestTos(false)} />}
      {showViewTos && <TermsModal isOpen={true} onClose={() => setShowViewTos(false)} title="תנאי שימוש ומדיניות פרטיות" />}
      <div className="w-full max-w-sm flex flex-col items-center">
        {isAiLoading && <div className="text-sm text-accent mb-2">הבוט חושב...</div>}
        {renderForm()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default AuthScreen;