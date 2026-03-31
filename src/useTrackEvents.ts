import { useCallback } from 'react';
import { useTealium } from './TealiumProvider';
import { TealiumData, UtagMethod } from './types';

export function useTrackEvent(
  method: UtagMethod,
  baseData: TealiumData = {},
): (extraData?: TealiumData) => void {
  const utag = useTealium();

  return useCallback(
    (extraData: TealiumData = {}) => {
      const merged: TealiumData = { ...baseData, ...extraData };
      utag[method](merged);
    },
    [method, JSON.stringify(baseData)],
  );
}