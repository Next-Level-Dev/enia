const MOBILE_UA_RE = /android|iphone|ipod|ipad|iemobile|opera mini|mobile/i;

/**
 * True for phones and tablets. Android (and some other mobile browsers) refuse
 * to render a PDF inside an <iframe>/<object>, so the viewer offers a direct
 * "open" link instead of an inline preview on those devices.
 */
export function isMobileUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return MOBILE_UA_RE.test(userAgent);
}
