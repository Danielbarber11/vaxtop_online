import React from 'react';
import Modal from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const TermsContent = () => (
    <div className="overflow-y-auto p-2 bg-gray-900/50 rounded-lg text-sm text-gray-300 space-y-2">
        <h3 className="font-bold text-base text-white">1. כללי</h3>
        <p>ברוכים הבאים לאתר vaxtop. השימוש באתר, לרבות בתכנים הכלולים בו ובשירותים השונים הפועלים בו, מעיד על הסכמתך לתנאים אלה, ולכן הנך מתבקש לקרוא אותם בקפידה.</p>
        <h3 className="font-bold text-base text-white">2. קניין רוחני</h3>
        <p>כל זכויות הקניין הרוחני באתר, לרבות עיצובו, קוד המקור, התכנים והסימנים המסחריים, הינם רכושו הבלעדי של vaxtop או של צדדים שלישיים שהעניקו לאתר הרשאה להשתמש בהם.</p>
        <h3 className="font-bold text-base text-white">3. אחריות המשתמש</h3>
        <p>הנך מתחייב שלא להעלות, לשלוף, לשדר, להפיץ או לפרסם מידע או חומר אחר אשר הינו בלתי חוקי, מאיים, גס, פוגעני, או מהווה לשון הרע. <strong className="text-yellow-300">האחריות המלאה על כל תוכן שאתה מעלה לאתר חלה עליך בלבד.</strong></p>
        <h3 className="font-bold text-base text-white">4. הגבלת אחריות</h3>
        <p>השירות באתר ניתן לשימוש כמות שהוא (AS IS). לא תהיה לך כל טענה, תביעה או דרישה כלפי vaxtop בגין תכונות השירות, יכולותיו, מגבלותיו או התאמתו לצרכיך ולדרישותיך.</p>
        <h3 className="font-bold text-base text-white">5. מדיניות פרטיות</h3>
        <p>vaxtop מכבדת את פרטיות המשתמשים. המידע שתמסור יישמר במאגר המידע של החברה וישמש אותה בהתאם למדיניות הפרטיות ועל פי הוראות כל דין.</p>
    </div>
);

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, title }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-4 max-h-[60vh]">
                <TermsContent />
                 <button 
                    onClick={onClose} 
                    className="w-full bg-gray-700 text-secondary font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    סגור
                </button>
            </div>
        </Modal>
    );
};

export default TermsModal;
