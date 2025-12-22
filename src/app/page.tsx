'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      html.style.setProperty('--vh', `${vh}px`);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const safeGap = isMobile ? 'max(env(safe-area-inset-bottom), 52px)' : '0px';
      html.style.setProperty('--safe-area-bottom', safeGap);
    };

    setAppHeight();
    window.addEventListener('resize', setAppHeight);

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.height = '100%';

    return () => {
      html.style.overflow = '';
      html.style.overscrollBehavior = '';
      body.style.overflow = '';
      body.style.overscrollBehavior = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
    };
  }, []);

  return (
    <main
      className="w-full overflow-hidden touch-none"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
        <Map />
    </main>
  );
}


{/*
'use client';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  return (
    <main className="h-[100dvh] md:h-screen w-full">
        <Map />
    </main>
  );
}


'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <main className="h-[100dvh] md:h-screen w-full overflow-hidden">
        <Map />
    </main>
  );
}
*/}