import type { ComponentType, JSX } from 'react';

import { Home } from '../game/Home';
import { Leaderboard } from '../game/Leaderboard';
import { Shop } from '../game/Shop';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: Home },
  { path: '/leaderboard', Component: Leaderboard, title: 'Leaderboard' },
  { path: '/shop', Component: Shop, title: 'Shop' },
];
