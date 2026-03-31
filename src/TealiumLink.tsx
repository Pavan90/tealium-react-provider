// =============================================================================
// tealium/TealiumLink.tsx
//
// Declarative wrapper component — fires utag.link() when its child is clicked,
// without writing any handler code.
//
// Wraps a single child element and intercepts its onClick.
// The child keeps its own onClick handler too (both fire).
//
// Usage:
//   <TealiumLink data={{ tealium_event: 'cta_click', link_text: 'Apply Now' }}>
//     <button>Apply Now</button>
//   </TealiumLink>
// =============================================================================

import React, { cloneElement, FC, isValidElement, ReactElement } from 'react';
import { useTealium } from './TealiumProvider';
import { TealiumData, UtagMethod } from './types';

interface TealiumLinkProps {
  /** The Tealium payload to fire when the child is clicked */
  data:     TealiumData;
  /** Which utag method to use — defaults to 'link' */
  method?:  UtagMethod;
  /** A single React element to wrap */
  children: ReactElement;
}

/**
 * Fires a Tealium event when the wrapped element is clicked.
 * No onClick handler required in your own code.
 *
 * @example — button
 * <TealiumLink data={{ tealium_event: 'cta_click', link_text: 'Get Started', cta_location: 'hero' }}>
 *   <button>Get Started</button>
 * </TealiumLink>
 *
 * @example — anchor tag
 * <TealiumLink data={{ tealium_event: 'nav_click', link_text: 'About Us', link_url: '/about' }}>
 *   <a href="/about">About Us</a>
 * </TealiumLink>
 *
 * @example — fire utag.track instead of utag.link
 * <TealiumLink method="track" data={{ tealium_event: 'lead_submitted', conversion: 'true' }}>
 *   <button type="submit">Submit</button>
 * </TealiumLink>
 */
export const TealiumLink: FC<TealiumLinkProps> = ({
  data,
  method   = 'link',
  children,
}) => {
  const utag = useTealium();

  if (!isValidElement(children)) {
    console.warn('[TealiumLink] children must be a single valid React element.');
    return <>{children}</>;
  }

  const child = children as ReactElement<{ onClick?: React.MouseEventHandler }>;

  const handleClick: React.MouseEventHandler = (e) => {
    utag[method](data);
    child.props.onClick?.(e);
  };

  return cloneElement(child, { onClick: handleClick });
};
