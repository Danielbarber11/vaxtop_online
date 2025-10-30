import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Product, User, Comment } from '../types';
import { AppStateContext } from '../App';
import { useAuthContext } from '../context/AuthContext';
import { XIcon, PaperAirplaneIcon } from './Icons';
import { generateGradientForId } from '../utils/color';

interface CommentsModalProps {
    product: Product;
    onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ product, onClose }) => {
    const { users, setProducts } = useContext(AppStateContext);
    const { user } = useAuthContext();
    const [isRendered, setIsRendered] = useState(false);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setIsRendered(true);
    }, []);

    const handleAnimationEnd = () => {
        if (!isRendered) {
            onClose();
        }
    };
    
    const uploaderForComment = (userId: string) => users.find(u => u.id === userId);

    const handlePostComment = () => {
        if (!newComment.trim() || !user || user === 'guest') return;

        const comment: Comment = {
            id: `c${Date.now()}`,
            userId: user.id,
            text: newComment,
            timestamp: new Date().toISOString()
        };

        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === product.id
                    ? { ...p, comments: [...p.comments, comment] }
                    : p
            )
        );
        setNewComment('');
    };
    
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return "just now";
    };

    return (
        <div
            className={`fixed inset-0 z-40 transition-colors duration-300 ${isRendered ? 'bg-black/60' : 'bg-transparent'}`}
            onClick={() => setIsRendered(false)}
        >
            <div
                className={`absolute bottom-0 left-0 right-0 bg-primary border-t border-gray-700 rounded-t-2xl shadow-lg transition-transform duration-300 ease-out flex flex-col ${isRendered ? 'translate-y-0' : 'translate-y-full'} h-[75dvh]`}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                <header className="flex-shrink-0 p-4 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-secondary text-center flex-1">{product.comments.length} תגובות</h3>
                        <button onClick={() => setIsRendered(false)} className="text-gray-400 hover:text-white">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {product.comments.length === 0 ? (
                         <p className="text-gray-500 text-center pt-10">אין תגובות עדיין. היה הראשון להגיב!</p>
                    ) : (
                        product.comments.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(comment => {
                        const commenter = uploaderForComment(comment.userId);
                        const fallbackAvatarStyle = {
                          background: generateGradientForId(commenter?.id || ''),
                        };
                        return (
                             <div key={comment.id} className="flex items-start gap-3">
                                {commenter?.profilePicture ? (
                                    <img src={commenter.profilePicture} alt={commenter.name} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={fallbackAvatarStyle}>
                                        {commenter?.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">{commenter?.name}</span>
                                        <span className="text-xs text-gray-500">{timeSince(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-secondary text-base">{comment.text}</p>
                                </div>
                            </div>
                        )
                    }))}
                </main>

                <footer className="flex-shrink-0 p-3 border-t border-gray-700 bg-primary">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="הוסף תגובה..."
                            className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-2 px-4 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button onClick={handlePostComment} className="bg-accent text-primary p-3 rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!newComment.trim()}>
                            <PaperAirplaneIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CommentsModal;