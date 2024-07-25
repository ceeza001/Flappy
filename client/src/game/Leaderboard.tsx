import { type FC, useState, useEffect } from 'react';
import { useInitData, type User } from '@telegram-apps/sdk-react';
import axios from 'axios';

import { Link } from '../components/Link';

const ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const Leaderboard: FC = () => {
  const initData = useInitData();

  const [leaderboard, setLeaderboard] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${ENDPOINT}/api/v1/users`);
      setLeaderboard(response.data.documents);
    } catch (error) {
      console.log(error.message);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="fixed top-0 left-0 w-full h-[100dvh] text-white bg-black">
      <div className="h-[100dvh] w-full bg-dot-white/[0.2] relative">
        <div className=" absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="flex flex-col w-full gap-2 p-[1rem]">
          {leaderboard.map((item, i) => (
            <div key={item.$id} className="z-[900] font-extrabold text-[18px] flex items-center justify-between w-full border rounded-lg px-2 py-[2px]">
            <div className="flex gap-2 items-center">
              <p className="px-[3px]">{i + 1}</p>
              <div className="flex gap-[4px] items-center">
                <div className="bg-red-500 overflow-hidden border rounded-lg h-[2.5rem] w-[2.5rem]">
                  <img src="/assets/pfp.png" />
                </div>
                <div className="flex flex-col leading-[108%] justify-around">
                  <h2>{item.first_name}</h2>
                  <p className="font-semibold text-[14px]">oxnbtd...</p>
                </div>
              </div>
            </div>
            <h2>{item.Highscore}</h2>
          </div> 
          ))}
        </div>
          
      </div>
    </section>
  );
};