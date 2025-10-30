import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ArrowLeftIcon } from '../components/Icons';

interface HelpScreenProps {
  setActiveScreen: (screen: string) => void;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ setActiveScreen }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'שלום! אני בוט העזרה של vaxtop. איך אני יכול לעזור לך היום? (לדוגמה: "איך מתנתקים?")' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: input,
                config: {
                    systemInstruction: `אתה בוט עזרה לאתר קניות בשם vaxtop. ענה על שאלות משתמשים לגבי השימוש באתר. שמור על תשובות קצרות וברורות בעברית.
                    מידע על האתר:
                    - דף הבית הוא פיד גלילה אנכי של מוצרים, כמו בטיקטוק.
                    - משתמשים יכולים לעשות לייק, להגיב (בקרוב) ולשתף מוצרים.
                    - יש דף חיפוש למציאת מוצרים.
                    - משתמשים רשומים יכולים להעלות מוצרים דרך לחצן הפלוס בניווט.
                    - דף הפרופיל מציג את המוצרים שהמשתמש העלה, מוצרים שהוא אהב, והגדרות.
                    - כדי להתנתק: יש ללחוץ על אייקון הפרופיל, לעבור ללשונית "הגדרות", ושם נמצא כפתור "התנתק".`,
                },
            });
            
            const botMessage: Message = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("AI Help bot error:", error);
            const errorMessage: Message = { sender: 'bot', text: 'אני מצטער, 발생תה שגיאה. אנא נסה שוב מאוחר יותר.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-primary text-secondary">
            <header className="flex items-center p-4 border-b border-gray-700 bg-gray-900">
                <button onClick={() => setActiveScreen('profile')} className="p-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold mx-auto">מרכז עזרה</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                            msg.sender === 'user' ? 'bg-accent text-primary rounded-br-none' : 'bg-gray-700 text-secondary rounded-bl-none'
                        }`}>
                            <p style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700 text-secondary rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            
            <footer className="p-4 border-t border-gray-700 bg-primary">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="שאל שאלה..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-2 px-4 text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-accent text-primary p-3 rounded-full disabled:bg-gray-500" disabled={isLoading || !input.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default HelpScreen;