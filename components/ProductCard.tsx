import React, { useState, useMemo, useContext, useEffect, useRef, useCallback } from 'react';
import { Product, User } from '../types';
import { AppStateContext } from '../App';
import { useAuthContext } from '../context/AuthContext';
import { HeartIcon, ChatBubbleIcon, ShareIcon, DocumentTextIcon, PlayIcon, FlagIcon, ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon, BookmarkIcon } from './Icons';
import DescriptionModal from './DescriptionModal';
import Modal from './Modal';
import { GoogleGenAI, Type } from '@google/genai';
import { generateGradientForId } from '../utils/color';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

type ReportReason = 'סחיטה' | 'נוכלות' | 'מוצר מזוייף' | 'אחר' | '';

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, product }) => {
  const { setProducts, setUsers } = useContext(AppStateContext);
  const [reason, setReason] = useState<ReportReason>('');
  const [otherDetails, setOtherDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const resetState = () => {
    setReason('');
    setOtherDetails('');
    setIsLoading(false);
    setAiResponse('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason || (reason === 'אחר' && !otherDetails.trim())) {
      alert('יש לבחור סיבה או למלא פרטים נוספים.');
      return;
    }
    setIsLoading(true);
    setAiResponse('');

    const reportDetails = reason === 'אחר' ? otherDetails : reason;
    const prompt = `אתה בוט מנהל תוכן עבור אתר קניות בשם vaxtop. משתמש מדווח על מוצר.
    תיאור מוצר: "${product.description}"
    סיבת הדיווח: "${reportDetails}"
    מזהה המשתמש שהעלה: "${product.userId}"

    בהתבסס על מידע זה, החלט על פעולה. התגובה שלך חייבת להיות אובייקט JSON תקין עם שני מפתחות: "action" ו-"userMessage".
    - המפתח "action" יכול לקבל אחד משלושה ערכים: "BLOCK_USER", "DELETE_PRODUCT", או "NO_ACTION". היה מחמיר מאוד עם הונאות, מוצרים מזויפים או סחיטה. במקרים אלו, השתמש ב-"BLOCK_USER". לתוכן פחות חמור אך עדיין בעייתי, השתמש ב-"DELETE_PRODUCT". אחרת, השתמש ב-"NO_ACTION".
    - המפתח "userMessage" צריך להכיל הודעת אישור קצרה ומרגיעה בעברית למשתמש שדיווח. אל תזכיר שאתה AI.

    דוגמה לתגובה:
    {
      "action": "BLOCK_USER",
      "userMessage": "תודה על הדיווח. הנושא נבדק וננקטו הפעולות הנדרשות. אנו שומרים על vaxtop כמקום בטוח."
    }`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    userMessage: { type: Type.STRING },
                },
                required: ["action", "userMessage"]
            }
        }
      });
      
      const result = JSON.parse(response.text);
      setAiResponse(result.userMessage);

      if (result.action === 'BLOCK_USER') {
        console.log(`AI החליט לחסום את משתמש ${product.userId} ולמחוק את המוצרים שלו.`);
        setUsers(prevUsers => prevUsers.map(u => u.id === product.userId ? { ...u, isBlocked: true } : u));
        setProducts(prevProducts => prevProducts.filter(p => p.userId !== product.userId));
      } else if (result.action === 'DELETE_PRODUCT') {
        console.log(`AI החליט למחוק את מוצר ${product.id}.`);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id));
      }

    } catch (error) {
      console.error("AI report error:", error);
      setAiResponse('התרחשה שגיאה בעת שליחת הדיווח. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const reportOptions: ReportReason[] = ['סחיטה', 'נוכלות', 'מוצר מזוייף', 'אחר'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="דווח על תוכן">
        {!aiResponse ? (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">אנא בחר את סיבת הדיווח:</p>
                <div className="space-y-2">
                    {reportOptions.map(opt => (
                        <button 
                            key={opt}
                            onClick={() => setReason(opt)}
                            className={`w-full text-right p-3 rounded-lg border-2 transition-colors ${reason === opt ? 'bg-accent/20 border-accent' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {reason === 'אחר' && (
                    <textarea
                        placeholder="פרט את הסיבה..."
                        value={otherDetails}
                        onChange={e => setOtherDetails(e.target.value)}
                        className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                )}
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !reason || (reason === 'אחר' && !otherDetails.trim())}
                    className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'שולח...' : 'שלח דיווח'}
                </button>
            </div>
        ) : (
             <div className="flex flex-col gap-4 items-center text-center">
                <p className="text-secondary">{aiResponse}</p>
                <button 
                    onClick={handleClose} 
                    className="w-1/2 bg-gray-700 text-secondary font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    סגור
                </button>
            </div>
        )}
    </Modal>
  );
};


interface ProductCardProps {
  product: Product;
  setViewingProfile: (user: User) => void;
  isVisible: boolean;
  onVideoEnd?: () => void;
  promptForAuth: () => void;
  onCommentClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, setViewingProfile, isVisible, onVideoEnd, promptForAuth, onCommentClick }) => {
  const { users, setProducts } = useContext(AppStateContext);
  const { user, updateUser } = useAuthContext();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const uploader = useMemo(() => users.find(u => u.id === product.userId), [users, product.userId]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [indicatorIcon, setIndicatorIcon] = useState<'mute'|'unmute'|null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const handleProfileClick = () => {
    if (uploader) {
      setViewingProfile(uploader);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setCurrentMediaIndex(0);
    }
  }, [isVisible]);


  useEffect(() => {
    if(videoRef.current){
        videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (product.media.type === 'video' && videoRef.current) {
      if (isVisible) {
        const playPromise = videoRef.current.play();
        if(playPromise !== undefined) {
            playPromise.catch(error => {
                if(error.name === "NotAllowedError") {
                    console.log("Autoplay with sound was prevented. User must tap to play.");
                    setIsPaused(true);
                }
            })
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPaused(false);
      }
    }
  }, [isVisible, product.media.type]);


  useEffect(() => {
    if (product.media.type === 'video' && videoRef.current) {
        const video = videoRef.current;
        video.onloadedmetadata = () => {
            if (video.videoWidth > video.videoHeight) {
                console.log(`Simulating Gemini API call to resize video ${product.id} to portrait mode.`);
                video.style.objectFit = 'cover';
            }
        };
    }
  }, [product.id, product.media.type]);

  const isLiked = user && user !== 'guest' ? product.likes.includes(user.id) : false;
  const isSaved = user && user !== 'guest' ? user.savedProducts.includes(product.id) : false;

  const handleLike = () => {
    if (!user || user === 'guest') {
      promptForAuth();
      return;
    }
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === product.id) {
          const newLikes = isLiked
            ? p.likes.filter(id => id !== (user as User).id)
            : [...p.likes, (user as User).id];
          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };
  
  const handleSave = () => {
    if (!user || user === 'guest') {
        promptForAuth();
        return;
    }
    const currentUser = user as User;
    const newSaved = isSaved
        ? currentUser.savedProducts.filter(id => id !== product.id)
        : [...currentUser.savedProducts, product.id];
    updateUser({ ...currentUser, savedProducts: newSaved });
  };

  const handleComment = () => {
      if(!user || user === 'guest') {
          promptForAuth();
          return;
      }
      onCommentClick(product);
  }

  const handleShare = async () => {
      const shareData = {
          title: `בדוק את המוצר הזה מ-vaxtop!`,
          text: product.description,
          url: `${window.location.origin}${window.location.pathname}?product=${product.id}`,
      };
      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              // Fallback for browsers that don't support Web Share API
              navigator.clipboard.writeText(shareData.url);
              alert('הקישור הועתק! הדבק אותו כדי לשתף.');
          }
      } catch (err) {
          console.error("Error sharing:", err);
      }
  }

  const handleVideoClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      // Double tap: Mute/unmute
      if (videoRef.current) {
        setIsMuted(prev => {
            const nextIsMuted = !prev;
            setIndicatorIcon(nextIsMuted ? 'mute' : 'unmute');
            setTimeout(() => {
                setIndicatorIcon(null);
            }, 800);
            return nextIsMuted;
        });
      }
    } else {
      clickTimeout.current = setTimeout(() => {
        // Single tap: Play/pause
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false);
          } else {
            videoRef.current.pause();
            setIsPaused(true);
          }
        }
        clickTimeout.current = null;
      }, 250);
    }
  };

  const handleInteractionStart = () => {
    longPressTimeout.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.playbackRate = 2.0;
      }
    }, 500);
  };

  const handleInteractionEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  };

  const handleTimeUpdate = () => {
     if (!isSeeking && videoRef.current?.duration) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };
  
  const handleSeek = useCallback((e: MouseEvent | TouchEvent) => {
    if (videoRef.current && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const percent = Math.max(0, Math.min(1, (rect.right - clientX) / rect.width));
        const seekTime = percent * videoRef.current.duration;
        
        videoRef.current.currentTime = seekTime;
        setProgress(percent * 100);
    }
  }, []);

  const handleSeekMove = useCallback((e: MouseEvent | TouchEvent) => {
    // We prevent default to avoid scrolling on mobile while seeking.
    e.preventDefault();
    if (isSeeking) {
      handleSeek(e);
    }
  }, [isSeeking, handleSeek]);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  useEffect(() => {
    if (isSeeking) {
      window.addEventListener('mousemove', handleSeekMove);
      window.addEventListener('mouseup', handleSeekEnd);
      window.addEventListener('touchmove', handleSeekMove, { passive: false });
      window.addEventListener('touchend', handleSeekEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleSeekMove);
      window.removeEventListener('mouseup', handleSeekEnd);
      window.removeEventListener('touchmove', handleSeekMove);
      window.removeEventListener('touchend', handleSeekEnd);
    };
  }, [isSeeking, handleSeekMove, handleSeekEnd]);

  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleSeek(e.nativeEvent);
  };
  
  const handleImageTouchStart = (e: React.TouchEvent) => {
    if (product.media.urls.length > 1) {
      setTouchStartX(e.touches[0].clientX);
    }
  };
  
  const nextImage = () => {
    setCurrentMediaIndex(i => (i + 1) % product.media.urls.length);
  };

  const prevImage = () => {
    setCurrentMediaIndex(i => (i - 1 + product.media.urls.length) % product.media.urls.length);
  };

  const handleImageTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const swipeThreshold = 50; // Minimum distance for a swipe

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swiped left
        nextImage();
      } else {
        // Swiped right
        prevImage();
      }
    }
    
    setTouchStartX(null);
  };

  const renderMedia = () => {
    if (product.media.type === 'image') {
      return (
        <div 
          className="relative w-full h-full"
          onTouchStart={handleImageTouchStart}
          onTouchEnd={handleImageTouchEnd}
        >
          <img src={product.media.urls[currentMediaIndex]} alt={product.description} className="w-full h-full object-cover" />
        </div>
      );
    }
    if (product.media.type === 'video') {
      return (
        <div className="relative w-full h-full">
            <video 
                ref={videoRef} 
                src={product.media.urls[0]} 
                className="w-full h-full object-cover" 
                loop={!onVideoEnd}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={onVideoEnd}
            />
             <div 
                className="absolute inset-0 z-10"
                onClick={handleVideoClick}
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
            ></div>
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <PlayIcon className="w-20 h-20 text-white/70" />
                </div>
            )}
            {indicatorIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/20">
                    {indicatorIcon === 'mute' ? 
                        <SpeakerXMarkIcon className="w-20 h-20 text-white/70" /> :
                        <SpeakerWaveIcon className="w-20 h-20 text-white/70" />
                    }
                </div>
            )}
             <div 
                ref={progressBarRef}
                className="absolute bottom-0 left-0 right-0 h-4 z-20 cursor-pointer group"
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
             >
                <div className="absolute inset-x-2 bottom-1.5 h-full flex items-center">
                  <div className="w-full h-1 bg-white/30 relative rounded-full overflow-hidden">
                      <div 
                          className="absolute top-0 right-0 h-full bg-accent rounded-full"
                          style={{ width: `${progress}%` }}
                      ></div>
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ right: `${progress}%` }}
                      ></div>
                  </div>
                </div>
             </div>
        </div>
      );
    }
    return null;
  };
  
  const partnerBorder = uploader?.isPartner ? 'p-1 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full' : '';
  const fallbackAvatarStyle = {
    background: generateGradientForId(uploader?.id || ''),
  };

  return (
    <div className="relative w-full h-full bg-black">
      {renderMedia()}

      {product.media.type === 'image' && product.media.urls.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center z-20 gap-4">
             <button onClick={prevImage} className="p-2 bg-black/50 rounded-full text-white hover:bg-black transition-colors" aria-label="התמונה הקודמת">
                <ChevronRightIcon className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
                {product.media.urls.map((_, index) => (
                    <div 
                        key={index} 
                        className={`w-2.5 h-2.5 rounded-full icon-shadow transition-colors duration-300 ${
                            index === currentMediaIndex ? 'bg-accent' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
             <button onClick={nextImage} className="p-2 bg-black/50 rounded-full text-white hover:bg-black transition-colors" aria-label="התמונה הבאה">
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/70 to-transparent z-10">
        <div className="flex items-center gap-4">
            <button onClick={handleProfileClick} className="flex items-center gap-3 text-left">
               <div className={partnerBorder}>
                  {uploader?.profilePicture ? (
                      <img src={uploader.profilePicture} alt={uploader.name} className="w-12 h-12 rounded-full border-2 border-primary" />
                  ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={fallbackAvatarStyle}>
                          {uploader?.name.charAt(0)}
                      </div>
                  )}
              </div>
              <span className="font-bold text-lg">{uploader?.name || 'משתמש לא ידוע'}</span>
            </button>
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="bg-accent text-primary font-bold py-1 px-3 rounded-full text-xs self-center shrink-0">
              קישור למוצר
            </a>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute bottom-24 left-2 flex flex-col items-center gap-y-3 z-20">
          <button onClick={handleLike} className="flex flex-col items-center" aria-label={isLiked ? "בטל לייק" : "עשה לייק"}>
            <HeartIcon className={`icon-shadow ${isLiked ? 'text-red-500' : 'text-white'} w-7 h-7`} filled={isLiked}/>
            <span className="text-xs text-white icon-shadow">{product.likes.length}</span>
          </button>
          <button onClick={handleComment} className="flex flex-col items-center" aria-label="הצג תגובות">
            <ChatBubbleIcon className="text-white icon-shadow w-7 h-7"/>
            <span className="text-xs text-white icon-shadow">{product.comments.length}</span>
          </button>
          <button onClick={handleShare} className="flex flex-col items-center" aria-label="שתף מוצר">
            <ShareIcon className="text-white icon-shadow w-7 h-7"/>
            <span className="text-xs text-white icon-shadow">שתף</span>
          </button>
          <button onClick={() => setShowFullDescription(true)} className="flex flex-col items-center" aria-label="הצג תיאור מלא">
            <DocumentTextIcon className="text-white icon-shadow w-7 h-7"/>
            <span className="text-xs text-white icon-shadow">תיאור</span>
          </button>
          <button onClick={handleSave} className="flex flex-col items-center" aria-label={isSaved ? "הסר שמירה" : "שמור מוצר"}>
            <BookmarkIcon className="text-white icon-shadow w-7 h-7" filled={isSaved}/>
            <span className="text-xs text-white icon-shadow">שמור</span>
          </button>
          <button onClick={() => setShowReportModal(true)} className="flex flex-col items-center" aria-label="דווח על מוצר">
            <FlagIcon className="text-white icon-shadow w-7 h-7"/>
            <span className="text-xs text-white icon-shadow">דווח</span>
          </button>
      </div>


       <DescriptionModal isOpen={showFullDescription} onClose={() => setShowFullDescription(false)} title="תיאור מלא">
        <p className="text-secondary whitespace-pre-wrap">{product.description}</p>
      </DescriptionModal>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductCard;