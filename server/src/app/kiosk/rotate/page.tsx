'use client';

import { useSearchParams } from 'next/navigation';
import KioskPlayer from '../../components/KioskPlayer';

export default function KioskRotatePage() {
  const searchParams = useSearchParams();
  const interval = searchParams.get('interval');
  const rotationInterval = interval ? parseInt(interval) : 30000; // Default 30 seconds

  return (
    <KioskPlayer 
      kioskMode={true}
      showScreenSelector={false}
      autoRotate={true}
      rotationInterval={rotationInterval}
    />
  );
}
