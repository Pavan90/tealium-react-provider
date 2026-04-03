// TealiumProvider.tsx
// Provides the useTealium() hook and ensures utag.js fires immediately in dev
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  FC,
} from 'react';
import {
  TealiumEvent,
  TealiumTrack,
  UtagData,
  UtagMethod,
} from './tealium';

// ── Context ───────────────────────────────────────────────────────────────
const TealiumContext = createContext<TealiumTrack | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────
interface TealiumProviderProps {
  children: ReactNode;
  config: {
    account: string;
    profile: string;
    environment: string;
  };
  onEvent?: (event: TealiumEvent) => void;
}

export const TealiumProvider: FC<TealiumProviderProps> = ({ children, onEvent, config }) => {
  const queueRef = useRef<Array<() => void>>([]);
  const readyRef = useRef<boolean>(false);

  // Core dispatcher — queues if utag isn't ready yet
  const fireUtag = useCallback(
    (method: UtagMethod, data: UtagData) => {
      // Notify inspector
      const event: TealiumEvent = {
        ...data,
        _method: method,
        _ts: new Date().toISOString(),
      };
      onEvent?.(event);

      const fire = () => {
        if (window.utag && typeof window.utag[method] === 'function') {
          window.utag[method](data);
        }
      };

      if (readyRef.current) fire();
      else queueRef.current.push(fire);
    },
    [onEvent],
  );

  const track: TealiumTrack = {
    view: (data) => fireUtag('view', data),
    link: (data) => fireUtag('link', data),
    track: (data) => fireUtag('track', data),
  };

  // ── Poll until utag is ready and flush queue
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.utag && typeof window.utag.view === 'function') {
        readyRef.current = true;
        queueRef.current.forEach((fn) => fn());
        queueRef.current = [];
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // ── Inject utag.js and force consent for dev
useEffect(() => {
  if (!config.account || document.getElementById('utag-script')) return;

    (window as any).utag_data = {
      country: 'US',
      country_code: 'US',
      implied_consent: 'yes'
    };

  // ─── 2. Inject utag.js ───
  const src = `https://tags.tiqcdn.com/utag/${config.account}/${config.profile}/${config.environment}/utag.js`;
  const script = document.createElement('script');
  script.id = 'utag-script';
  script.src = src;
  script.async = true;
  document.body.appendChild(script);

  return () => {
    const el = document.getElementById('utag-script');
    el?.parentNode?.removeChild(el);
  };
}, []);
  return <TealiumContext.Provider value={track}>{children}</TealiumContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────
export function useTealium(): TealiumTrack {
  const ctx = useContext(TealiumContext);
  if (!ctx) throw new Error('useTealium() must be called inside a <TealiumProvider>.');
  return ctx;
}