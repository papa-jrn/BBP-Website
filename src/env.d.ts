/// <reference types="astro/client" />

/**
 * Cloudflare Turnstile attaches itself to the window when its script loads,
 * which is conditional on a site key being configured. Only the parts we call
 * are declared; everything else is left alone deliberately.
 */
interface TurnstileApi {
  reset(widget?: string | HTMLElement): void;
  render(
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'error-callback'?: (code: string) => void;
      [key: string]: unknown;
    }
  ): string | undefined;
}

interface Window {
  turnstile?: TurnstileApi;
}
