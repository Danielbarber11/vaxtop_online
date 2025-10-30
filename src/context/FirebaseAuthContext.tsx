// Firebase & Google OAuth - Cloud Sync
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
    createdAt: new Date()
  }, { merge: true });
  return user;
};

export const logoutUser = () => signOut(auth);
export const onAuthChange = (cb: Function) => onAuthStateChanged(auth, cb);
