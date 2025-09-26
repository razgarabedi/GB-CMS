'use client';

import { useSearchParams } from 'next/navigation';
import KioskPlayer from '../components/KioskPlayer';

export default function KioskPage() {
  const searchParams = useSearchParams();
  const screenId = searchParams.get('screen');

  return (
    <KioskPlayer 
      screenId={screenId || undefined} 
      kioskMode={true}
      showScreenSelector={false}
    />
  );
}
