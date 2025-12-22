"use client";

import { Drawer } from 'vaul';
import { useState, useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  children: React.ReactNode;
  initialSnap?: string | number;
}

export default function MobilePlaceSidebar({ isOpen, children, initialSnap = 0.5 }: Props) {
  const [snap, setSnap] = useState<string | number | null>(initialSnap);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.documentElement.style.setProperty('--current-sidebar-height', '0px');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobile) return;

    let rafId: number;
    const update = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const height = window.innerHeight - rect.top;
        document.documentElement.style.setProperty('--current-sidebar-height', `${height}px`);
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.style.setProperty('--current-sidebar-height', '0px');
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSnap(initialSnap);
    }
  }, [isOpen, initialSnap]);

  useEffect(() => {
    if (isOpen && isMobile) {
      const unlock = () => {
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
      };
      
      unlock();
      const timer = setTimeout(unlock, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  if (!isMobile) return <>{children}</>;

  return (
    <Drawer.Root 
      open={isOpen} 
      dismissible={false} 
      modal={false}
      snapPoints={['60px','220px', 0.5, 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
      noBodyStyles={true}
      onDrag={(event, percentage) => {
        const heightInPixels = window.innerHeight * percentage;
        document.documentElement.style.setProperty('--current-sidebar-height', `${heightInPixels}px`);
      }}
    >
      <Drawer.Portal>
        <Drawer.Content 
          ref={contentRef}
          //className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-white text-black rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[calc(var(--safe-area-bottom,0px)+64px)]"
          className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-white text-black rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[calc(var(--safe-area-bottom,0px))]"
          style={{ margin: 0 }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Drawer.Title className="sr-only">Places Sidebar</Drawer.Title>

          <div className="w-full flex justify-center pt-3 pb-3 flex-shrink-0">
            <div className="w-12 h-1.5 bg-gray-400/60 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto">
            {children}
            <div className="h-[16px] w-full flex-shrink-0" />
          </div>
          
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

{/*
"use client";

import { Drawer } from 'vaul';
import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  children: React.ReactNode;
}

export default function MobilePlaceSidebar({ isOpen, children }: Props) {
  const [snap, setSnap] = useState<string | number | null>(0.5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      const unlock = () => {
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
      };
      unlock();
      const timer = setTimeout(unlock, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  if (!isMobile) return <>{children}</>;

  return (
    <Drawer.Root 
      open={isOpen} 
      dismissible={false} 
      modal={false}
      snapPoints={['148px', 0.5, 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
      noBodyStyles={true}
      // Physics: Allows for a more natural "flick" feel
      fadeFromIndex={1}
    >
      <Drawer.Portal>
        <Drawer.Content 
          // Added pb-[env(safe-area-inset-bottom)] for native iPhone feel
          className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-white text-black rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[env(safe-area-inset-bottom)] transition-transform duration-500 ease-in-out"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Drawer.Title className="sr-only">Places Sidebar</Drawer.Title>

          <div className="w-full flex justify-center pt-3 pb-3 flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-[110] rounded-t-[24px]">
            <div className="w-12 h-1.5 bg-gray-400/40 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-behavior-y-contain pointer-events-auto touch-pan-y custom-scrollbar scroll-smooth">
            {children}
          </div>
          
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
*/}