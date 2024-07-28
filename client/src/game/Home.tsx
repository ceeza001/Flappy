import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { ConnectWallet } from '../components/ConnectWallet';
import FlappyBirdGame from './FlappyBirdGame';
import Loader from '../components/Loader';

const ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const Home: React.FC = () => {
  const [gameMode, setGameMode] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const playerid = urlParams.get('user');

  const frames = [1, 2, 3];

  const gameToggle = () => {
    setLoading(true);
    setGameOver(false);
    setGameMode((prevMode) => !prevMode);

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  const fetchUserById = async (id: string) => {
    try {
      const response = await axios.get(`${ENDPOINT}/api/v1/users/${id}`);
      setUser(response.data);
      console.log(response.data);
      setHighScore(response.data.Highscore);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('User not found');
      } else {
        console.log(error.message);
      }
    }
  };

  useEffect(() => {
    if (playerid) {
      fetchUserById(playerid);
    }
  }, [playerid]);

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, 200); // Change frame every 200ms

    return () => clearInterval(frameInterval);
  }, [frames.length]);

  const updateGameOver = useCallback(
    async (score: number) => {
      setGameOver(true);
      setLastScore(score);

      if (score > highScore) {
        try {
          const response = await axios.post(`${ENDPOINT}/api/v1/users/${playerid}`, { newHighScore: score });
          console.log('User updated successfully:', response.data);
          setHighScore(score);

          // Submit high score to Telegram
          await axios.get(`${ENDPOINT}/highscore/${score}?id=${playerid}`);
        } catch (error) {
          console.error('Error updating user:', error.response ? error.response.data : error.message);
        }
      }
    },
    [highScore, playerid]
  );

  window.onload = async function() {
    try {
      if (window.solana) {
        const solana = window.solana;
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const res = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            res.publicKey.toString()
          );
          setWalletAddress(res.publicKey.toString());
        }
      } else {
        console.log('wallet not found');
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      {gameMode ? (
        <>
          {!gameOver ? (
            <>
              {loading && <Loader />}
              <FlappyBirdGame onGameOver={updateGameOver} />
            </>
          ) : (
            <div className="h-[100dvh] w-full text-white bg-black bg-grid-white/[0.2] relative flex items-start">
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
              <div className="flex flex-col w-full mt-10 gap-[5rem] justify-between">
                <div className="p-[1rem] flex justify-between items-center w-full">
                  <div className="z-[100] bg-[#121417] border-2 border-[#1F1F22] text-center p-4 w-[10rem] min-h-[8rem] rounded-lg">
                    <h1 className="font-extrabold text-[1.5rem]">High Score</h1>
                    <p>{highScore || 0}</p>
                  </div>
                  <div className="z-[100] bg-[#121417] border-2 border-[#1F1F22] text-center p-4 w-[10rem] min-h-[8rem] rounded-lg">
                    <h1 className="font-extrabold text-[1.5rem]">Score</h1>
                    <p>{lastScore || 0}</p>
                  </div>
                </div>
                <motion.div
                  animate={{
                    y: [0, -40, -20, 0],
                    x: [0, 30, 100, 60, 0],
                  }}
                  transition={{ ease: 'easeInOut', duration: 4, repeat: Infinity }}
                  className="w-[15rem] h-[15rem]"
                >
                  {currentFrame === 0 && <img src="/assets/frame1.png" alt="Bird Frame" className="w-full h-full" />}
                  {currentFrame === 1 && <img src="/assets/frame2.png" alt="Bird Frame" className="w-full h-full" />}
                  {currentFrame === 2 && <img src="/assets/frame3.png" alt="Bird Frame" className="w-full h-full" />}
                </motion.div>
              </div>
              <div className="absolute bottom-0 w-full p-2 flex gap-4 justify-between items-center">
                <button
                  onClick={gameToggle}
                  className="flex items-center justify-center gap-2 w-full bg-[#121417] border-2 border-[#1F1F22] text-white rounded-lg py-4 px-2 cursor-pointer"
                >
                  <>
                    <img src="/assets/UI/home.svg" alt="home" className="w-4 h-4 invert-white" />
                    <p>Home</p>
                  </>
                </button>
                <button
                  onClick={() => setGameOver(false)}
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white rounded-lg px-2 py-4 cursor-pointer hover:bg-blue-700"
                >
                  <>
                    <img src="/assets/UI/play.svg" alt="play" className="w-4 h-4" />
                    <p>Play Again</p>
                  </>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <main className="h-[100dvh] w-full text-white bg-black bg-dot-white/[0.2] relative">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <header className="fixed top-0 left-0 w-full flex justify-between items-center p-5">
            <div className="text-2xl font-bold">Flappy bird</div>
            <ConnectWallet />
          </header>
          <div className="absolute top-[5rem] left-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="rounded-lg border-2 w-[3.5rem] h-[3.5rem] overflow-hidden flex justify-center items-center">
                <img src="/assets/pfp.png" className="w-full h-full bg-white" />
              </div>
              <div className="leading-[130%] flex flex-col justify-center">
                <h2 className="font-black text-[19px]">{user?.first_name}</h2>
                <h1 className="font-bold text-dim text-[16px]">#{user?.telegram_id}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg border-2 w-[3.2rem] h-[3.2rem] overflow-hidden flex justify-center items-center">
                <img src="/assets/UI/crown.webp" className="w-full h-full bg-black" />
              </div>
              <div className="leading-[130%] flex flex-col justify-center">
                <h2 className="font-black text-[18px]">Highscore</h2>
                <h1 className="font-bold text-[14px]">{highScore}</h1>
              </div>
            </div>
          </div>
          <div className="pointer-events-none relative h-full">
            <motion.div
              className="absolute bottom-[8rem]"
              animate={{ y: [0, -10, 0] }}
              transition={{ ease: 'easeInOut', duration: 2, repeat: Infinity }}
            >
              <img src="/assets/UI/hero.png" alt="Hero" />
            </motion.div>
          </div>
          <footer className="absolute bottom-0 left-0 right flex justify-between items-center gap-2 p-[1rem] w-full">
            <motion.div
              className="box"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 2,
                delay: 0.3,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <button
                to="/leaderboard"
                className="flex items-center gap-2 w-full bg-[#121417] border-2 border-[#1F1F22] text-white rounded-lg py-4 px-2 cursor-pointer"
              >
                <img src="/assets/UI/rank.svg" alt="rank" className="w-4 h-4 invert-white" />
                Leaderboard
              </button>
            </motion.div>
            <motion.div
              className="box"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 2,
                delay: 0.4,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <button
                to="/shop"
                className="flex items-center gap-2 w-full bg-blue-500 text-white rounded-lg px-2 py-4 cursor-pointer hover:bg-blue-700"
              >
                <img src="/assets/UI/shop.svg" alt="shop" className="w-4 h-4 invert-white" />
                <>SHOP</>
              </button>
            </motion.div>
            <motion.div
              className="box"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 2,
                delay: 0.6,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <button
                onClick={gameToggle}
                className="flex items-center gap-2 w-full bg-green-500 text-white rounded-lg px-2 py-4 cursor-pointer hover:bg-blue-700"
              >
                <img src="/assets/UI/play.svg" alt="play" className="w-4 h-4" />
                PLAY
              </button>
            </motion.div>
          </footer>
        </main>
      )}
    </>
  );
};