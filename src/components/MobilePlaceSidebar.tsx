"use client";

import { Drawer } from 'vaul';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from "next-themes";

interface Props {
  isOpen: boolean;
  children: React.ReactNode;
  initialSnap?: string | number;
}

export default function MobilePlaceSidebar({ isOpen, children, initialSnap = 0.5 }: Props) {
  const [snap, setSnap] = useState<string | number | null>(initialSnap);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

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
      snapPoints={['60px', '220px', 0.5, 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
      noBodyStyles={true}
    >
      <Drawer.Portal>
        <Drawer.Content
          ref={contentRef}
          //className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-white text-black rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[calc(var(--safe-area-bottom,0px)+64px)]"
          className={`fixed bottom-0 left-0 right-0 z-[50] flex flex-col ${theme === 'dark' ? 'bg-[#131313] text-white' : 'bg-white text-black'} rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[calc(var(--safe-area-bottom,0px))]`}
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
import { useState, useEffect, useRef } from 'react';
import { useTheme } from "next-themes";

interface Props {
  isOpen: boolean;
  children: React.ReactNode;
  initialSnap?: string | number;
}

export default function MobilePlaceSidebar({ isOpen, children, initialSnap = 0.5 }: Props) {
  const [snap, setSnap] = useState<string | number | null>(initialSnap);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

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
      snapPoints={['60px', '220px', 0.5, 1]}
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
          className={`fixed bottom-0 left-0 right-0 z-[50] flex flex-col ${theme === 'dark' ? 'bg-[#131313] text-white' : 'bg-white text-black'} rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto pb-[calc(var(--safe-area-bottom,0px))]`}
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
*/}