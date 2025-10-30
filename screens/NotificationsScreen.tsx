import React from 'react';
import { User, Product } from '../types';
import { generateGradientForId } from '../utils/color';

interface NotificationsScreenProps {
    user: User;
    users: User[];
    products: Product[];
    updateUser: (user: User) => void;
    onViewUserFeed: (user: User, productId: string) => void;
    setViewingProfile: (user: User) => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ user, users, products, updateUser, onViewUserFeed, setViewingProfile }) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const newProductNotifications = products.filter(p =>
        user.subscriptions.includes(p.userId) &&
        !user.viewedNotifications.includes(p.id) &&
        new Date(p.publishedAt) > oneWeekAgo
    ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // FIX: Correctly typed the initial value for the reduce function to ensure 'userProducts' is recognized as an array.
    const groupedNotifications = newProductNotifications.reduce((acc: Record<string, Product[]>, product) => {
        if (!acc[product.userId]) {
            acc[product.userId] = [];
        }
        acc[product.userId].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const handleViewProduct = (publisher: User, product: Product) => {
        if (!user.viewedNotifications.includes(product.id)) {
            const newViewed = [...user.viewedNotifications, product.id];
            updateUser({ ...user, viewedNotifications: newViewed });
        }
        onViewUserFeed(publisher, product.id);
    };
    
    const subscribedUsers = users.filter(u => user.subscriptions.includes(u.id));

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-4">עדכונים חדשים</h2>
                {Object.keys(groupedNotifications).length === 0 ? (
                    <p className="text-gray-400 text-center">אין עדכונים חדשים כרגע.</p>
                ) : (
                    <div className="space-y-6">
                        {/* FIX: Replaced Object.entries with Object.keys to ensure correct type inference for userProducts and resolve the "Property 'map' does not exist on type 'unknown'" error. */}
                        {Object.keys(groupedNotifications).map((userId) => {
                            const userProducts = groupedNotifications[userId];
                            const publisher = users.find(u => u.id === userId);
                            if (!publisher) return null;
                             const fallbackAvatarStyle = { background: generateGradientForId(publisher.id) };

                            return (
                                <div key={userId}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {publisher.profilePicture ? (
                                            <img src={publisher.profilePicture} alt={publisher.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={fallbackAvatarStyle}>
                                                {publisher.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-semibold">{publisher.name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                        {userProducts.map(product => (
                                            <div key={product.id} className="relative aspect-square bg-gray-800 rounded-sm overflow-hidden cursor-pointer" onClick={() => handleViewProduct(publisher, product)}>
                                                <img src={product.media.urls[0]} alt={product.description} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-6">
                 <h2 className="text-xl font-bold mb-4">במעקב</h2>
                 {subscribedUsers.length === 0 ? (
                    <p className="text-gray-400 text-center">אתה לא רשום לעדכונים מאף אחד.</p>
                 ) : (
                    <div className="space-y-3">
                        {subscribedUsers.map(subscribedUser => {
                            const fallbackAvatarStyle = { background: generateGradientForId(subscribedUser.id) };
                            return (
                                <div key={subscribedUser.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {subscribedUser.profilePicture ? (
                                            <img src={subscribedUser.profilePicture} alt={subscribedUser.name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={fallbackAvatarStyle}>
                                                {subscribedUser.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-semibold">{subscribedUser.name}</span>
                                    </div>
                                    <button onClick={() => setViewingProfile(subscribedUser)} className="text-sm bg-accent text-primary font-bold py-1 px-3 rounded-full">
                                        צפה בפרופיל
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default NotificationsScreen;