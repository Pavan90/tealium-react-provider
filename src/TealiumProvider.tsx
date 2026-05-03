// TealiumProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
  FC,
} from 'react';

import {
  TealiumEvent,
  TealiumTrack,
  UtagData,
  UtagMethod,
} from './tealium';

const initUtagStub = () => {
  if ((window as any).utag) return;

  (function (w: any) {
    if (w.utag) return;

    const u: any = (w.utag = { e: [] });

    u.view = function (a: any, b?: any, c?: any) {
      u.e.push({ a, b, c, d: 'view' });
    };

    u.link = function (a: any, b?: any, c?: any) {
      u.e.push({ a, b, c, d: 'link' });
    };

    u.track = function (d: any, a?: any, b?: any, c?: any) {
      typeof d === 'object'
        ? u.e.push({
            a: d.data,
            b: d.cfg ? d.cfg.cb : null,
            c: d.cfg ? d.cfg.uids : undefined,
            d: d.event,
          })
        : u.e.push({ a, b, c, d });
    };
  })(window);
};

const TealiumContext = createContext<TealiumTrack | null>(null);

interface TealiumProviderProps {
  children: ReactNode;
  config: {
    account: string;
    profile: string;
    environment: string;
  };
  onEvent?: (event: TealiumEvent) => void;
}

export const TealiumProvider: FC<TealiumProviderProps> = ({
  children,
  onEvent,
  config,
}) => {
  const fireUtag = useCallback(
    (method: UtagMethod, data: UtagData) => {
      const event: TealiumEvent = {
        ...data,
        _method: method,
        _ts: new Date().toISOString(),
      };

      onEvent?.(event);

      if (window.utag && typeof window.utag[method] === 'function') {
        window.utag[method](data);
      }
    },
    [onEvent],
  );

  const track: TealiumTrack = {
    view: (data) => fireUtag('view', data),
    link: (data) => fireUtag('link', data),
    track: (data) => fireUtag('track', data),
  };

  useEffect(() => {
    if (!config.account || document.getElementById('utag-script')) return;

    initUtagStub();

    window.utag_cfg_ovrd = {
      noview: true,
    };

    window.utag_data = {
      country: 'US',
      country_code: 'US',
      implied_consent: 'yes',
    };

    const script = document.createElement('script');
    script.id = 'utag-script';
    script.src = `https://tags.tiqcdn.com/utag/${config.account}/${config.profile}/${config.environment}/utag.js`;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      const el = document.getElementById('utag-script');
      el?.parentNode?.removeChild(el);
    };
  }, [config.account, config.profile, config.environment]);

  return (
    <TealiumContext.Provider value={track}>
      {children}
    </TealiumContext.Provider>
  );
};

export function useTealium(): TealiumTrack {
  const ctx = useContext(TealiumContext);

  if (!ctx) {
    throw new Error('useTealium() must be called inside a <TealiumProvider>.');
  }

  return ctx;
}