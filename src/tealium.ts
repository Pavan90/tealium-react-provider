// ─────────────────────────────────────────────────────────────────────────────
// tealium.ts
// Central config, shared types, and Window augmentation for utag
// ─────────────────────────────────────────────────────────────────────────────

export type TealiumEnv = 'dev' | 'qa' | 'prod';

// ── Window augmentation ───────────────────────────────────────────────────────
// Tells TypeScript about the globals utag.js drops onto window.
declare global {
  interface Window {
    utag?: {
      e?: unknown[];
      view:  (data: UtagData) => void;
      link:  (data: UtagData) => void;
      track: (data: UtagData) => void;
    };
    /** Set before utag.js loads to suppress the automatic initial page-view.
     *  We fire page views manually via utag.view() on each step mount. */
    utag_cfg_ovrd?: { noview: boolean };
    /** Optional: pre-populate the data layer before utag.js loads */
    utag_data?: UtagData;
  }
}

// ── Core types ────────────────────────────────────────────────────────────────

/** All key/value pairs sent to Tealium.
 *  Tealium's utag.js expects string values; numbers/booleans should be
 *  converted to strings before passing (e.g. String(true) → "true"). */
export type UtagData = Record<string, string>;

export type UtagMethod = 'view' | 'link' | 'track';

/** Internal event payload used by the DataLayer Inspector panel */
export interface TealiumEvent extends UtagData {
  _method: UtagMethod;
  _ts:     string;   // ISO timestamp added by TealiumProvider
}

/** The object returned by useTealium() */
export interface TealiumTrack {
  view:  (data: UtagData) => void;
  link:  (data: UtagData) => void;
  track: (data: UtagData) => void;
}

// ── Form state shared across all steps ───────────────────────────────────────
export interface FormData {
  email?:            string;
  title?:            string;
  firstName?:        string;
  lastName?:         string;
  investmentAmount?: number;   // slider index (0–20)
  investmentDollar?: number;   // resolved dollar value
  zip?:              string;
  phone?:            string;
}

// ── Shared step prop shape ────────────────────────────────────────────────────
export interface StepProps {
  formData:    FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext:      () => void;
  onBack:      () => void;
}
