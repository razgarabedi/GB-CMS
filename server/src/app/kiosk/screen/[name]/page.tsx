'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import KioskPlayer from '../../../components/KioskPlayer';

export default function KioskScreenByNamePage() {
  const params = useParams();
  const screenName = params.name as string;
  const [screenId, setScreenId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load screens and find the one with matching name
    const loadScreenByName = () => {
      try {
        const savedScreens = localStorage.getItem('gb-cms-screens');
        if (savedScreens) {
          const screens = JSON.parse(savedScreens);
          const screen = screens.find((s: any) => 
            s.name.toLowerCase().replace(/\s+/g, '-') === screenName.toLowerCase()
          );
          if (screen) {
            setScreenId(screen.id);
          }
        }
      } catch (error) {
        console.error('Error loading screen by name:', error);
      }
    };

    loadScreenByName();
  }, [screenName]);

  return (
    <KioskPlayer 
      screenId={screenId} 
      kioskMode={true}
      showScreenSelector={false} 
    />
  );
}
