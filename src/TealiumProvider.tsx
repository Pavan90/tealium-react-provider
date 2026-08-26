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

const OPTI_USER_CONTEXT_COOKIE = 'opti_user_context';

const OPTI_USER_CONTEXT_MAX_AGE =
  60 * 60 * 24 * 30; // 30 days

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

    u.track = function (
      d: any,
      a?: any,
      b?: any,
      c?: any,
    ) {
      typeof d === 'object'
        ? u.e.push({
            a: d.data,
            b: d.cfg ? d.cfg.cb : null,
            c: d.cfg ? d.cfg.uids : undefined,
            d: d.event,
          })
        : u.e.push({
            a,
            b,
            c,
            d,
          });
    };
  })(window);
};

/**
 * Read the existing Optimizely context cookie.
 *
 * We merge with the existing value so attributes from
 * previous Tealium events are not lost when a later event
 * contains only a subset of the page settings.
 */
const getExistingOptimizelyContext = (): Record<
  string,
  unknown
> => {
  const cookie = document.cookie
    .split('; ')
    .find((item) =>
      item.startsWith(`${OPTI_USER_CONTEXT_COOKIE}=`),
    );

  if (!cookie) {
    return {};
  }

  try {
    const value = cookie.substring(
      cookie.indexOf('=') + 1,
    );

    return JSON.parse(
      decodeURIComponent(value),
    ) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/**
 * Persist Tealium / pageSettings attributes that are also
 * needed by Optimizely.
 *
 * These values can then be read by Next.js middleware
 * on subsequent requests.
 */
const persistOptimizelyContext = (
  data: UtagData,
) => {
  const attributes = {
    repeat_visitor: data.repeat_visitor,

    creative_code: data.creative_code,

    offer_code: data.offer_code,

    placement_code: data.placement_code,

    parent_code: data.parent_code,

    delivery_code: data.delivery_code,

    utm_campaign: data.utm_campaign,

    utm_medium: data.utm_medium,

    utm_source: data.utm_source,

    personalized_b: data.personalized_b,

    personalized_ver: data.personalized_ver,

    page_type: data.page_type,

    alley_code: data.alley_code,
  };

  /**
   * Only persist attributes that actually have values.
   */
  const newAttributes = Object.fromEntries(
    Object.entries(attributes).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  );

  if (Object.keys(newAttributes).length === 0) {
    return;
  }

  /**
   * Preserve attributes written during previous events.
   */
  const existingAttributes =
    getExistingOptimizelyContext();

  const mergedAttributes = {
    ...existingAttributes,
    ...newAttributes,
  };

  const value = encodeURIComponent(
    JSON.stringify(mergedAttributes),
  );

  document.cookie = [
    `${OPTI_USER_CONTEXT_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${OPTI_USER_CONTEXT_MAX_AGE}`,
    'SameSite=Lax',
    'Secure',
  ].join('; ');
};

const TealiumContext =
  createContext<TealiumTrack | null>(null);

interface TealiumProviderProps {
  children: ReactNode;

  config: {
    account: string;
    profile: string;
    environment: string;
  };

  onEvent?: (event: TealiumEvent) => void;
}

export const TealiumProvider: FC<
  TealiumProviderProps
> = ({
  children,
  onEvent,
  config,
}) => {
  const fireUtag = useCallback(
    (
      method: UtagMethod,
      data: UtagData,
    ) => {
      const event: TealiumEvent = {
        ...data,
        _method: method,
        _ts: new Date().toISOString(),
      };

      /**
       * Persist the same pageSettings / Tealium data
       * that is being sent to utag.
       *
       * Next.js middleware can then read these values
       * from the cookie and provide them to Optimizely.
       */
      persistOptimizelyContext(data);

      onEvent?.(event);

      if (
        window.utag &&
        typeof window.utag[method] === 'function'
      ) {
        window.utag[method](data);
      }
    },
    [onEvent],
  );

  const track: TealiumTrack = {
    view: (data) =>
      fireUtag('view', data),

    link: (data) =>
      fireUtag('link', data),

    track: (data) =>
      fireUtag('track', data),
  };

  useEffect(() => {
    if (
      !config.account ||
      document.getElementById('utag-script')
    ) {
      return;
    }

    initUtagStub();

    window.utag_cfg_ovrd = {
      noview: true,
    };

    window.utag_data = {};

    const script =
      document.createElement('script');

    script.id = 'utag-script';

    script.src =
      `https://tags.tiqcdn.com/utag/` +
      `${config.account}/` +
      `${config.profile}/` +
      `${config.environment}/utag.js`;

    script.async = true;

    document.body.appendChild(script);

    return () => {
      const el =
        document.getElementById('utag-script');

      el?.parentNode?.removeChild(el);
    };
  }, [
    config.account,
    config.profile,
    config.environment,
  ]);

  return (
    <TealiumContext.Provider value={track}>
      {children}
    </TealiumContext.Provider>
  );
};

export function useTealium(): TealiumTrack {
  const ctx =
    useContext(TealiumContext);

  if (!ctx) {
    throw new Error(
      'useTealium() must be called inside a <TealiumProvider>.',
    );
  }

  return ctx;
}