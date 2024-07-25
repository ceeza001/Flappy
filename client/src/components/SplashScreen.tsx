import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion"

const SplashScreen = ({ onLoaded }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onLoaded, 1000); // Match this duration with the CSS animation duration
    }, 6000); // Show splash screen for 3 seconds before starting the fade-out

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className={`fixed top-0 left-0 w-full h-[100vh] flex items-center justify-center bg-black transition ${fadeOut ? 'opacity-0' : ''}`}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <img src="/assets/UI/splash.png" alt="Splash Screen" className="splash-image" />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
