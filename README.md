# @analytics/tealium-react-provider

A robust, enterprise-ready React provider and hooks library for seamless Tealium integration. This package enables declarative, type-safe analytics event tracking in React applications, supporting modern best practices and scalable analytics architectures.

## Features

- **TealiumProvider**: Context provider to initialize Tealium and manage event dispatching.
- **Hooks**: `usePageView` and `useTrackEvent` for easy, declarative analytics tracking.
- **TealiumLink**: Component to fire Tealium events on user interactions without manual handler code.
- **TypeScript support**: Fully typed APIs for safety and IDE autocompletion.
- **Enterprise ready**: Designed for scalability, testability, and maintainability.

## Installation

```sh
npm install @analytics/tealium-react-provider
```

## Usage

### 1. Wrap your app with `TealiumProvider`

```tsx
import { TealiumProvider } from '@analytics/tealium-react-provider';

<TealiumProvider
  config={{
    account: 'your-tealium-account',
    profile: 'your-profile',
    environment: 'prod', // or 'dev', 'qa'
  }}
  onEvent={event => {
    // Optional: inspect or log events
    console.log('Tealium event', event);
  }}
>
  <App />
</TealiumProvider>
```

### 2. Track page views

```tsx
import { usePageView } from '@analytics/tealium-react-provider';

function MyPage() {
  usePageView({ page_name: 'Home' });
  return <div>Home</div>;
}
```

### 3. Track custom events

```tsx
import { useTrackEvent } from '@analytics/tealium-react-provider';

const trackCTA = useTrackEvent('link', { tealium_event: 'cta_click' });

<button onClick={() => trackCTA({ link_text: 'Apply Now' })}>
  Apply Now
</button>
```

### 4. Use `TealiumLink` for declarative event tracking

```tsx
import { TealiumLink } from '@analytics/tealium-react-provider';

<TealiumLink data={{ tealium_event: 'cta_click', link_text: 'Get Started' }}>
  <button>Get Started</button>
</TealiumLink>
```

## API Reference

### `<TealiumProvider />`
- `config`: `{ account: string; profile: string; environment: string; }`
- `onEvent`: `(event: TealiumEvent) => void` — callback for all fired events

### `usePageView(data: TealiumData)`
Fires a `utag.view` event on mount.

### `useTrackEvent(method: UtagMethod, baseData?: TealiumData)`
Returns a callback to fire a Tealium event of the given method (`'view' | 'link' | 'track'`).

### `<TealiumLink data={...} method="link|track|view">`
Wraps a single child element and fires a Tealium event on click.

## TypeScript Types

- `TealiumData`: `{ [key: string]: any }`
- `UtagMethod`: `'view' | 'link' | 'track'`
- `TealiumEvent`: `{ ...TealiumData, _method?: UtagMethod, _ts?: string }`
- `TealiumTrack`: `{ view, link, track }`

## Best Practices
- Always provide meaningful event names and data.
- Use the `onEvent` prop for debugging and compliance/auditing.
- Keep Tealium configuration in environment variables for security.

## Publishing
This package is ready for enterprise npm publishing:
- Follows [npm package best practices](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages).
- Includes TypeScript types and only ships the `dist` folder.
- Peer dependencies for React 18+.

## License
MIT

---

For more details, see the source code and inline documentation.
