import { useEffect } from 'react';
import { useTealium } from './TealiumProvider';
import { TealiumData } from './types';

export function usePageView(data: TealiumData): void {
  const utag = useTealium();

  useEffect(() => {
    utag.view({
      tealium_event: 'page_view',
      ...data,
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}