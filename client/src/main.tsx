import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { WalletProvider } from './providers/wallet-provider.tsx';

import './main.css';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </QueryClientProvider>
  </StrictMode>
);
