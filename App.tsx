import React from 'react';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import AuthScreen from './screens/AuthScreen';

const App = () => {
  return (
    <GoogleAuthProvider>
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <AuthScreen />
      </div>
    </GoogleAuthProvider>
  );
};

export default App;
