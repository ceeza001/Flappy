import { type FC, useMemo } from 'react';
import { useInitData, useLaunchParams, type User } from '@telegram-apps/sdk-react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';

import { Link } from '../components/Link';

export const Shop: FC = () => {
  const initDataRaw = useLaunchParams().initDataRaw;
  const initData = useInitData();

  return (
    <section className="fixed top-0 left-0 text-white bg-black w-full h-[100dvh]">
      <div className="h-[100dvh] w-full bg-dot-white/[0.2] relative flex justify-center items-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <h1 className="font-bold text-[2rem] leading-[101%]">No items in shop</h1>
      </div>
    </section>
  );
};