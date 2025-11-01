import React, { useState, useContext, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { User, Product } from '../types';
import { AppStateContext } from '../App';
import NotificationsScreen from './NotificationsScreen';
import { QuestionMarkCircleIcon, KeyIcon, LockClosedIcon, BellIcon, UserCircleIcon, HeartIcon, BookmarkIcon, GridIcon, CogIcon, CameraIcon } from '../components/Icons';
import { CheckboxSetting } from './AccessibilityScreen';
import Modal from '../components/Modal';
import { generateGradientForId } from '../utils/color';
import TermsModal from '../components/TermsModal';
import { getPreferences, savePreferences, getNotifications, getUnreadCount, markNotificationAsRead, addFollowing, removeFollowing, isFollowing } from '../utils/preferencesManager';

type Tab = 'likes' | 'saved' | 'products' | 'notifications' | 'settings';

interface ProfileScreenProps {
  setActiveScreen: (screen: string) => void;
  onViewFeed: (productsToShow: Product[], title: string, initialProductId: string) => void;
  onViewUserFeed: (user: User, productId: string) => void;
  setViewingProfile: (user: User) => void;
  onShowAdminPanel: () => void;
}

const KeypadModal: React.FC<{ onCorrectCode: () => void, onClose: () => void }> = ({ onCorrectCode, onClose }) => {
    const [code, setCode] = useState('');
    const correctCode = '0101';

    const handleKeyPress = (key: string) => {
        if (code.length < 4) {
            setCode(prev => prev + key);
        }
    };

    const handleDelete = () => setCode(prev => prev.slice(0, -1));

    const handleSubmit = () => {
        if (code === correctCode) {
            onCorrectCode();
        } else {
            alert('קוד שגוי');
            setCode('');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="הזן קוד מנהל">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`w-8 h-10 rounded-md border-2 ${i < code.length ? 'bg-accent border-accent' : 'border-gray-600'}`}></div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                    {[...'123456789'].map(key => <button key={key} onClick={() => handleKeyPress(key)} className="p-4 bg-gray-700 rounded-lg text-xl font-bold hover:bg-gray-600">{key}</button>)}
                    <button onClick={handleDelete} className="p-4 bg-gray-700 rounded-lg text-xl font-bold hover:bg-gray-600">מחק</button>
                    <button onClick={() => handleKeyPress('0')} className="p-4 bg-gray-700 rounded-lg text-xl font-bold hover:bg-gray-600">0</button>
                    <button onClick={handleSubmit} className="p-4 bg-accent text-primary rounded-lg text-xl font-bold hover:bg-sky-400">כנס</button>
                </div>
            </div>
        </Modal>
    );
};

const ChangePasswordModal: React.FC<{ user: User, onClose: () => void, onSave: (newPass: string) => void }> = ({ user, onClose, onSave }) => {
    const [step, setStep] = useState(user.securityQuestion ? 1 : 2); // 1: answer question, 2: change password
    const [secAnswer, setSecAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleQuestionSubmit = () => {
        if (secAnswer.toLowerCase() === user.securityAnswer?.toLowerCase()) {
            setStep(2);
            setError('');
        } else {
            setError('התשובה שגויה.');
        }
    };
    
    const handlePasswordSubmit = () => {
        if (newPassword.length < 6) {
             setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
             return;
        }
        onSave(newPassword);
        alert('הסיסמה שונתה בהצלחה.');
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="שינוי סיסמה">
            <div className="flex flex-col gap-4">
                {step === 1 && (
                    <>
                        <p className="text-gray-300 text-center">{user.securityQuestion}</p>
                        <input type="text" placeholder="התשובה שלך" value={secAnswer} onChange={e => setSecAnswer(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
                        <button onClick={handleQuestionSubmit} className="bg-accent text-primary font-bold py-2 rounded-lg">המשך</button>
                    </>
                )}
                {step === 2 && (
                    <>
                         <input type="password" placeholder="סיסמה חדשה" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent" />
                         <button onClick={handlePasswordSubmit} className="bg-accent text-primary font-bold py-2 rounded-lg">שנה סיסמה</button>
                    </>
                )}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
};

const SecurityQuestionModal: React.FC<{ user: User, onClose: () => void, onSave: (q: string, a: string) => void }> = ({ user, onClose, onSave }) => {
    const [password, setPassword] = useState('');
    const [question, setQuestion] = useState(user.securityQuestion || '');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const handleVerify = () => {
        if(password === user.password) {
            setIsVerified(true);
            setError('');
        } else {
            setError('סיסמה שגויה.');
        }
    }

    const handleSubmit = () => {
        if (!question || !answer) {
            setError('יש למלא גם שאלה וגם תשובה.');
            return;
        }
        onSave(question, answer);
        alert('שאלת האבטחה עודכנה.');
        onClose();
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={user.securityQuestion ? "שינוי שאלת אבטחה" : "הוספת שאלת אבטחה"}>
            <div className="flex flex-col gap-4">
                {!isVerified ? (
                    <>
                        <p className="text-sm text-gray-400">כדי להמשיך, אנא הזן את סיסמתך הנוכחית.</p>
                        <input type="password" placeholder="סיסמה נוכחית" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary" />
                        <button onClick={handleVerify} className="bg-accent text-primary font-bold py-2 rounded-lg">אמת</button>
                    </>
                ) : (
                     <>
                        <input type="text" placeholder="שאלת אבטחה" value={question} onChange={e => setQuestion(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary" />
                        <input type="text" placeholder="תשובה" value={answer} onChange={e => setAnswer(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary" />
                        <button onClick={handleSubmit} className="bg-accent text-primary font-bold py-2 rounded-lg">שמור</button>
                     </>
                )}
                 {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </Modal>
    );
}

const EditProfilePictureModal: React.FC<{ user: User, onClose: () => void, onSave: (newUrl: string) => void }> = ({ user, onClose, onSave }) => {
    const [url, setUrl] = useState(user.profilePicture || '');

    const handleSave = () => {
        onSave(url);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="שנה תמונת פרופיל">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">הדבק קישור (URL) לתמונה חדשה.</p>
                <input 
                    type="url" 
                    placeholder="https://example.com/image.png" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button onClick={handleSave} className="bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 transition-colors">שמור</button>
            </div>
        </Modal>
    );
};


const ProductGrid: React.FC<{products: Product[], onProductClick: (product: Product) => void, currentUserId: string}> = ({ products, onProductClick, currentUserId }) => (
    <div className="grid grid-cols-3 gap-1 p-1">
        {products.map(p => (
            <div key={p.id} onClick={() => onProductClick(p)} className={`relative aspect-square ${p.isPublished || p.userId !== currentUserId ? 'bg-gray-800' : 'bg-gray-900 opacity-60'} rounded-sm overflow-hidden cursor-pointer`}>
                <img src={p.media.urls[0]} alt={p.description} className="w-full h-full object-cover" />
                {p.userId === currentUserId && !p.isPublished && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs text-center p-1">לא מפורסם</div>}
            </div>
        ))}
    </div>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ setActiveScreen, onViewFeed, onViewUserFeed, setViewingProfile, onShowAdminPanel }) => {
  const { user, updateUser, logout } = useAuthContext();
  const { products, users, setUsers } = useContext(AppStateContext);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAdminKeypad, setShowAdminKeypad] = useState(false);
  const [modal, setModal] = useState<'password' | 'security' | null>(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [termsModal, setTermsModal] = useState<'privacy' | 'tos' | null>(null);

  
  const clicks = useRef<number[]>([]);

  if (user === 'guest' || !user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-primary text-secondary">
        <UserCircleIcon className="w-24 h-24 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">פרופיל אורח</h2>
        <p className="text-gray-400 mb-6">כדי לראות את הפרופיל שלך, עליך להתחבר או להירשם.</p>
        <button
          onClick={logout}
          className="bg-accent text-primary font-bold py-3 px-6 rounded-lg hover:bg-sky-400 transition-colors"
        >
          צור חשבון או התחבר
        </button>
      </div>
    );
  }
  
  const currentUser = user as User;
  const [name, setName] = useState(currentUser.name);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleNameBlur = () => {
      const updatedUser = {...currentUser, name: name};
      updateUser(updatedUser);
      setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? updatedUser : u));
      setIsEditingName(false);
  }

  const handlePictureSave = (newUrl: string) => {
    const updatedUser = { ...currentUser, profilePicture: newUrl };
    updateUser(updatedUser);
    setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? updatedUser : u));
  };
  
  const handlePasswordSave = (newPass: string) => {
    const updatedUser = { ...currentUser, password: newPass };
    updateUser(updatedUser);
    setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? updatedUser : u));
  };
  
  const handleSecuritySave = (question: string, answer: string) => {
    const updatedUser = { ...currentUser, securityQuestion: question, securityAnswer: answer };
    updateUser(updatedUser);
    setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const handleDanielClick = () => {
    const now = Date.now();
    clicks.current.push(now);
    clicks.current = clicks.current.filter(timestamp => now - timestamp < 2000); // 10 clicks in 2 seconds
    if (clicks.current.length >= 10) {
      setShowAdminKeypad(true);
      clicks.current = [];
    }
  };

  const userProducts = products
    .filter(p => p.userId === currentUser.id)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
  const likedProducts = products.filter(p => p.likes.includes(currentUser.id));
  const savedProducts = products.filter(p => currentUser.savedProducts.includes(p.id));
  const partnerBorder = currentUser.isPartner ? 'p-1 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full' : '';
  
  const fallbackAvatarStyle = {
    background: generateGradientForId(currentUser.id),
  };

  const TABS: { id: Tab, icon: React.FC<any>, label: string }[] = [
      { id: 'likes', icon: HeartIcon, label: 'לייקים' },
      { id: 'saved', icon: BookmarkIcon, label: 'שמורים' },
      { id: 'products', icon: GridIcon, label: 'מוצרים' },
      { id: 'notifications', icon: BellIcon, label: 'התראות' },
      { id: 'settings', icon: CogIcon, label: 'הגדרות' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        if (userProducts.length === 0) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-gray-400 mb-4">עדיין לא העלית מוצרים.</p>
              <button onClick={() => setActiveScreen('create')} className="bg-accent text-primary font-bold py-2 px-5 rounded-lg">
                צור את המוצר הראשון שלך
              </button>
            </div>
          );
        }
        return <ProductGrid products={userProducts} currentUserId={currentUser.id} onProductClick={(p) => onViewFeed(userProducts, "המוצרים שלי", p.id)} />;
      case 'likes':
        return likedProducts.length > 0 ? <ProductGrid products={likedProducts} currentUserId={currentUser.id} onProductClick={(p) => onViewFeed(likedProducts, "לייקים", p.id)} /> : <p className="text-gray-400 text-center mt-10">מוצרים שאהבת יופיעו כאן.</p>;
      case 'saved':
        return savedProducts.length > 0 ? <ProductGrid products={savedProducts} currentUserId={currentUser.id} onProductClick={(p) => onViewFeed(savedProducts, "שמורים", p.id)} /> : <p className="text-gray-400 text-center mt-10">מוצרים ששמרת יופיעו כאן.</p>;
      case 'notifications':
        return (
            <NotificationsScreen 
                user={currentUser}
                users={users}
                products={products}
                updateUser={updateUser}
                setViewingProfile={setViewingProfile}
                onViewUserFeed={onViewUserFeed}
            />
        );
      case 'settings':
        return (
          <div className="p-4 space-y-6 text-secondary text-sm">
             <div className="space-y-2">
                 <h4 className="font-bold text-base text-gray-400">ניהול חשבון</h4>
                 <div className="bg-gray-800 p-3 rounded-lg space-y-3 divide-y divide-gray-700">
                    <button onClick={() => setModal('password')} className="w-full flex justify-between items-center text-left pt-1"><span>שינוי סיסמה</span><KeyIcon className="w-5 h-5 text-gray-400"/></button>
                    <button onClick={() => setModal('security')} className="w-full flex justify-between items-center text-left pt-3"><span>{currentUser.securityQuestion ? "שינוי" : "הוספת"} שאלת אבטחה</span><LockClosedIcon className="w-5 h-5 text-gray-400"/></button>
                 </div>
             </div>
              <div className="space-y-2">
                 <h4 className="font-bold text-base text-gray-400">הגדרות</h4>
                 <div className="bg-gray-800 px-1 rounded-lg">
                     <CheckboxSetting 
                        label="פרופיל פרטי" 
                        description="כאשר מופעל, רק עוקבים מאושרים יוכלו לראות את המוצרים שלך."
                        isChecked={!!currentUser.isPrivate} 
                        onToggle={() => updateUser({...currentUser, isPrivate: !currentUser.isPrivate})} 
                        id="private-profile" 
                    />
                 </div>
             </div>
             <div className="space-y-2">
                 <h4 className="font-bold text-base text-gray-400">אודות</h4>
                 <div className="bg-gray-800 p-3 rounded-lg space-y-3 divide-y divide-gray-700">
                     <button onClick={() => setTermsModal('privacy')} className="w-full text-left">מדיניות פרטיות</button>
                     <button onClick={() => setTermsModal('tos')} className="w-full text-left pt-3">תנאי שימוש</button>
                 </div>
             </div>
             <button
                onClick={() => setActiveScreen('help')}
                className="w-full bg-gray-700 text-secondary font-semibold p-3 rounded-lg text-right flex justify-between items-center hover:bg-gray-600 transition-colors"
              >
                <span>מרכז עזרה</span>
                <QuestionMarkCircleIcon className="w-6 h-6" />
              </button>
             <button onClick={logout} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">התנתק</button>
             <div className="pt-4 text-center">
                <button onClick={handleDanielClick} className="w-full text-center text-xs text-white">נוצר על ידי דניאל</button>
                <p className="text-xs text-gray-500 mt-1">Vaxtop - גרסה נסיונית</p>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-primary text-secondary">
      {showAdminKeypad && <KeypadModal onClose={() => setShowAdminKeypad(false)} onCorrectCode={() => { setShowAdminKeypad(false); onShowAdminPanel(); }} />}
      {modal === 'password' && <ChangePasswordModal user={currentUser} onClose={() => setModal(null)} onSave={handlePasswordSave} />}
      {modal === 'security' && <SecurityQuestionModal user={currentUser} onClose={() => setModal(null)} onSave={handleSecuritySave} />}
      {showPictureModal && <EditProfilePictureModal user={currentUser} onClose={() => setShowPictureModal(false)} onSave={handlePictureSave} />}
      {termsModal && <TermsModal isOpen={true} onClose={() => setTermsModal(null)} title={termsModal === 'tos' ? 'תנאי שימוש' : 'מדיניות פרטיות'} />}

      <div className="p-4 flex flex-col items-center">
        <button onClick={() => setShowPictureModal(true)} className={`relative w-24 h-24 mb-4 ${partnerBorder} group`}>
          {currentUser.profilePicture ? (
            <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full rounded-full border-2 border-primary" />
          ) : (
            <div 
                className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold"
                style={fallbackAvatarStyle}
            >
              {currentUser.name.charAt(0)}
            </div>
          )}
           <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <CameraIcon className="w-8 h-8 text-white" />
          </div>
        </button>
        {!isEditingName ? (
            <h2 onClick={() => setIsEditingName(true)} className="text-2xl font-bold p-1">{currentUser.name}</h2>
        ) : (
            <input 
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyPress={e => e.key === 'Enter' && handleNameBlur()}
                className="bg-gray-800 border-b-2 border-accent text-2xl font-bold text-center outline-none w-48"
                autoFocus
            />
        )}
        <p className="text-gray-400 text-sm">{currentUser.email}</p>
      </div>
      <div className="border-b border-t border-gray-700 flex justify-around">
        {TABS.map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}>
                <tab.icon className="w-6 h-6"/>
             </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileScreen;
