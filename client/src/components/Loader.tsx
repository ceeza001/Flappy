import React, { useState, useEffect } from 'react';

const Loader = ({ onLoaded }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onLoaded, 1000); // Match this duration with the CSS animation duration
    }, 3000); // Show splash screen for 3 seconds before starting the fade-out

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className="z-[100] fixed top-0 left-0 flex justify-center items-center w-full h-screen">
      <img
        src="/assets//loader.svg"
        alt="loader"
        width={34}
        height={34}
        className="animate-spin"
      />
    </div>
  );
}
export default Loader;