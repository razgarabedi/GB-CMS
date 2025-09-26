'use client';

import { useSearchParams } from 'next/navigation';
import KioskPlayer from '../../components/KioskPlayer';

export default function KioskPreviewPage() {
  const searchParams = useSearchParams();
  const screenId = searchParams.get('screen');
  const autoRotate = searchParams.get('rotate') === 'true';
  const interval = searchParams.get('interval');
  const rotationInterval = interval ? parseInt(interval) : 30000;

  return (
    <KioskPlayer 
      screenId={screenId || undefined} 
      kioskMode={false}
      showScreenSelector={true}
      autoRotate={autoRotate}
      rotationInterval={rotationInterval}
    />
  );
}
