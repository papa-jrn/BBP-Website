/**
 * Contact handling for /api/contact.
 *
 * This replaces FormSubmit, a free relay the site posted to until November
 * 2026. FormSubmit accepted submissions, showed the visitor a success page on
 * its own domain, and then stopped delivering for three weeks without saying
 * so. It keeps no log, so the lost enquiries are unrecoverable and there is no
 * way to know how many there were.
 *
 * Two things follow from that, and they shape everything below. Delivery has
 * to come from a domain we control and can authenticate, and a submission must
 * never be able to disappear quietly: if it cannot be delivered it is written
 * to the function log in full, where it can still be read back.
 */

export const CONTACT_EMAIL = 'info@beebalmproductions.com';
export const SITE_NAME = 'Bee Balm Productions';
export const SITE_URL = 'https://beebalmproductions.com';

export type ContactSubmission = {
  name: string;
  email: string;
  organization: string;
  offer: string;
  projectGoals: string;
  budget: string;
  timeline: string;
  procurement: string;
  source: string;
};

export type ValidationResult =
  | { ok: true; data: ContactSubmission }
  | { ok: false; errors: Record<string, string> };

const MAX = {
  name: 120,
  email: 160,
  organization: 160,
  projectGoals: 8000,
  /** The select menus and short free-text fields. */
  short: 200,
} as const;

// Deliberately permissive: the job is to catch typos, not to police addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value: FormDataEntryValue | null): string =>
  typeof value === 'string' ? value.trim().replace(/\r\n/g, '\n') : '';

/**
 * The select menus are not checked against an allow-list on purpose. Their
 * options are editorial — prices and project types change — and a mismatch
 * between the page and a list in here would reject a real enquiry for a reason
 * nobody would think to look for. They are length-capped and escaped instead.
 */
export function validateSubmission(form: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const name = clean(form.get('name'));
  const email = clean(form.get('email'));
  const organization = clean(form.get('organization'));
  const projectGoals = clean(form.get('project_goals'));

  const short = (key: string) => clean(form.get(key)).slice(0, MAX.short);
  const offer = short('offer') || short('project_type');
  const budget = short('budget');
  const timeline = short('timeline');
  const procurement = short('procurement');
  const source = short('source') || 'Contact form';

  if (!name) errors.name = 'Please tell us your name.';
  else if (name.length > MAX.name) errors.name = 'That name is longer than we can store.';

  if (!email) errors.email = 'We need an email address to reply to.';
  else if (email.length > MAX.email || !EMAIL.test(email))
    errors.email = 'That does not look like an email address.';

  if (organization.length > MAX.organization)
    errors.organization = 'That organization name is too long.';

  if (!projectGoals) errors.projectGoals = 'Please tell us a little about the project.';
  else if (projectGoals.length > MAX.projectGoals)
    errors.projectGoals = 'That is very long — could you email it to us instead?';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      email,
      organization,
      offer,
      projectGoals,
      budget,
      timeline,
      procurement,
      source,
    },
  };
}

/**
 * Submissions caught here are silently discarded — the sender still sees a
 * thank-you — so both checks are deliberately conservative. Dropping a real
 * enquiry without telling anyone is the failure mode this whole module exists
 * to prevent.
 *
 * The honeypot is the reliable signal. The timing floor only catches submits
 * fast enough to be impossible for a person filling in several fields; it is
 * not a "seems quick for a human" heuristic, which would misfire on autofill,
 * password managers and fast typists.
 */
const MIN_FILL_MS = 1200;

export function looksLikeSpam(form: FormData): boolean {
  if (clean(form.get('company-website'))) return true;

  const startedAt = Number(clean(form.get('started-at')));
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return true;
  }

  return false;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function renderEmail(data: ContactSubmission) {
  const rows: [string, string][] = [
    ['Name', data.name],
    ['Email', data.email],
    ['Organization', data.organization || '—'],
    ['Looking for', data.offer || '—'],
    ['Budget', data.budget || '—'],
    ['Timeline', data.timeline || '—'],
    ['Procurement', data.procurement || '—'],
    ['Came from', data.source],
  ];

  const subject = data.organization
    ? `Project inquiry — ${data.organization}`
    : `Project inquiry — ${data.name}`;

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    data.projectGoals,
    '',
    `— sent from the ${SITE_URL} contact form`,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1d1d1f;line-height:1.6">
      <h2 style="color:#8c1d33;margin:0 0 1rem">New project inquiry</h2>
      <table style="border-collapse:collapse;margin-bottom:1.25rem">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#6b6b70">${k}</td>` +
              `<td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
          )
          .join('')}
      </table>
      <div style="border-left:3px solid #8c1d33;padding-left:1rem;white-space:pre-wrap">${escapeHtml(
        data.projectGoals
      )}</div>
      <p style="margin-top:1.5rem;font-size:12px;color:#9a9aa0">
        Sent from the contact form at ${SITE_URL}
      </p>
    </div>`;

  return { subject, text, html };
}

/**
 * Sends via Resend. Returns an error string rather than throwing so the route
 * can decide what the visitor sees — and so the submission can be logged.
 */
export async function sendSubmission(
  data: ContactSubmission,
  env: { apiKey?: string; from?: string; to?: string }
): Promise<{ ok: true } | { ok: false; reason: 'unconfigured' | 'failed'; detail?: string }> {
  const apiKey = env.apiKey;
  if (!apiKey) return { ok: false, reason: 'unconfigured' };

  const { subject, text, html } = renderEmail(data);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.from || `${SITE_NAME} Website <website@beebalmproductions.com>`,
        to: [env.to || CONTACT_EMAIL],
        reply_to: data.email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { ok: false, reason: 'failed', detail: `${response.status} ${detail}`.slice(0, 500) };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: 'failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Turnstile                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The outcome of the Turnstile check.
 *
 *   passed    Cloudflare confirmed the token.
 *   disabled  Turnstile is not configured; nothing was checked.
 *   degraded  Turnstile is configured but could not give an answer. The
 *             submission is allowed through and the reason is logged.
 */
export type TurnstileResult =
  | { ok: true; state: 'passed' | 'disabled' | 'degraded'; detail?: string }
  | { ok: false; detail?: string };

/**
 * Cloudflare error codes that mean the *token* was bad. Every other code
 * describes our own configuration or Cloudflare's health, and an unrecognised
 * code is not evidence against the person filling in the form.
 */
const TOKEN_REJECT_CODES = new Set([
  'missing-input-response',
  'invalid-input-response',
  'timeout-or-duplicate',
]);

/**
 * Verifies a Cloudflare Turnstile token. Dormant until both keys are set.
 *
 * Fails OPEN on anything that is not a clear signal about the visitor — no
 * keys, one key, Cloudflare unreachable, a configuration error code. It fails
 * CLOSED only when Cloudflare says the token was missing, invalid or spent.
 *
 * The half-configured case matters most: the site key is inlined at build
 * time, so without it the widget never renders and nobody can produce a token.
 * Treating that as failure would reject every real visitor.
 */
export async function verifyTurnstile(
  token: string,
  keys: { secret?: string; siteKey?: string },
  ip?: string
): Promise<TurnstileResult> {
  const secret = keys.secret?.trim();
  const siteKey = keys.siteKey?.trim();

  if (!secret && !siteKey) return { ok: true, state: 'disabled' };

  if (!secret || !siteKey) {
    return {
      ok: true,
      state: 'degraded',
      detail: secret
        ? 'PUBLIC_TURNSTILE_SITE_KEY is not set at build time, so the widget never rendered'
        : 'TURNSTILE_SECRET_KEY is not set, so the token cannot be checked',
    };
  }

  if (!token) return { ok: false, detail: 'no token submitted' };

  let data: { success?: boolean; 'error-codes'?: string[] };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      return { ok: true, state: 'degraded', detail: `siteverify returned ${response.status}` };
    }

    data = (await response.json()) as typeof data;
  } catch (error) {
    return {
      ok: true,
      state: 'degraded',
      detail: `siteverify unreachable: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (data.success) return { ok: true, state: 'passed' };

  const codes = data['error-codes'] ?? [];
  if (codes.some((code) => TOKEN_REJECT_CODES.has(code))) {
    return { ok: false, detail: codes.join(', ') };
  }

  return {
    ok: true,
    state: 'degraded',
    detail: `siteverify rejected our configuration: ${codes.join(', ') || 'no error code given'}`,
  };
}
