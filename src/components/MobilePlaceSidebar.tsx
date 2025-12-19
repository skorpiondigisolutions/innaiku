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
    >
      <Drawer.Portal>
        <Drawer.Content 
          className="fixed bottom-0 left-0 right-0 z-[50] flex flex-col bg-white text-black rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] h-full outline-none pointer-events-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Drawer.Title className="sr-only">Places Sidebar</Drawer.Title>

          <div className="w-full flex justify-center pt-3 pb-3 flex-shrink-0">
            <div className="w-12 h-1.5 bg-gray-400/60 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pointer-events-auto">
            {children}
          </div>
          
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}