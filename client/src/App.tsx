import { Routes, Route } from "react-router-dom";
import { type FC, useState, useEffect, useMemo } from 'react';

import SplashScreen from './components/SplashScreen';
import { Home } from './game/Home'

import './globals.css';

export const App: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  
  const handleLoaded = () => {
    setLoading(false);
  };

  
  return (
    <>
      {loading && (
        <section className="fixed top w-screen h-screen bg-black z-[900]">
          <SplashScreen onLoaded={handleLoaded} />
        </section>
      )}
      <Routes>
        <Route path='*' element={<Home />}/>
      </Routes>
    </>
  );
};