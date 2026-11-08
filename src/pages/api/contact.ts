import type { APIRoute } from 'astro';
import {
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  RESEND_API_KEY,
  TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import {
  CONTACT_EMAIL,
  looksLikeSpam,
  sendSubmission,
  validateSubmission,
  verifyTurnstile,
  type ContactSubmission,
} from '../../lib/contact';

// The only route in the site that runs on a server. Everything else is static.
export const prerender = false;

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

/**
 * A warm serverless container keeps this map between invocations, which is
 * enough to stop a burst from one address. It is not a durable rate limiter
 * and is not meant to be — the honeypot does the real work.
 */
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);

  if (recent.size > 500) {
    for (const [key, times] of recent) {
      if (times.every((t) => now - t >= WINDOW_MS)) recent.delete(key);
    }
  }

  return hits.length > MAX_PER_WINDOW;
}

/* -------------------------------------------------------------------------- */
/* Responses                                                                   */
/* -------------------------------------------------------------------------- */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A self-contained page for the no-JavaScript path. Only reached when
 * something went wrong — the success case redirects to /thank-you, which is a
 * real page in the site's own design.
 */
function plainPage(heading: string, body: string, status: number) {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(heading)} | Bee Balm Productions</title>
<style>
  body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color:#1d1d1f;
         line-height:1.65; margin:0; padding:3rem 1.5rem; background:#faf7f5; }
  .box { max-width:34rem; margin:0 auto; background:#fff; border:1px solid #e6dfda;
         border-radius:18px; padding:2rem; }
  h1 { color:#8c1d33; font-size:1.5rem; margin:0 0 1rem; }
  a { color:#8c1d33; }
  ul { padding-left:1.2rem; }
  .back { display:inline-block; margin-top:1.5rem; background:#8c1d33; color:#fff;
          padding:.7rem 1.4rem; border-radius:999px; text-decoration:none; font-weight:600; }
</style>
</head>
<body>
  <div class="box">
    <h1>${escapeHtml(heading)}</h1>
    ${body}
    <a class="back" href="/contact">Back to the contact page</a>
  </div>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/* -------------------------------------------------------------------------- */
/* Route                                                                       */
/* -------------------------------------------------------------------------- */

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // The enhanced path asks for JSON; a plain browser post does not.
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return wantsJson
      ? json({ ok: false, message: 'We could not read that submission.' }, 400)
      : plainPage('That submission could not be read', '<p>Please try again.</p>', 400);
  }

  let ip = 'unknown';
  try {
    ip = clientAddress;
  } catch {
    /* clientAddress is unavailable on some adapters — fall through */
  }

  // Spam and abuse: accepted politely, delivered nowhere.
  if (looksLikeSpam(form) || rateLimited(ip)) {
    return wantsJson
      ? json({ ok: true })
      : Response.redirect(new URL('/thank-you', request.url), 303);
  }

  const result = validateSubmission(form);

  if (!result.ok) {
    const messages = Object.values(result.errors);
    return wantsJson
      ? json({ ok: false, errors: result.errors }, 200)
      : plainPage(
          'A few details are missing',
          `<ul>${messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`,
          400
        );
  }

  // Turnstile sits after validation so an incomplete form never costs a round
  // trip to Cloudflare. The site key is read here rather than taken from the
  // submission: it is inlined at build time, so the server can tell a
  // half-configured deployment from a visitor who sent no token.
  const challenge = await verifyTurnstile(
    String(form.get('cf-turnstile-response') ?? ''),
    {
      secret: TURNSTILE_SECRET_KEY,
      siteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
    },
    ip
  );

  if (challenge.ok && challenge.state === 'degraded') {
    console.error(
      `[contact] TURNSTILE NOT ENFORCED — ${challenge.detail}. ` +
        'The form is accepting submissions unchecked. See README.md.'
    );
  }

  if (!challenge.ok) {
    console.warn(
      `[contact] turnstile rejected${challenge.detail ? `: ${challenge.detail}` : ''}` +
        ` — from ${result.data.email}`
    );
    return wantsJson
      ? json(
          {
            ok: false,
            message:
              'We could not verify that you are human. Please complete the check again and resend.',
          },
          200
        )
      : plainPage(
          'We could not verify that you are human',
          `<p>Please go back and complete the check again, or email us directly at
            <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
          400
        );
  }

  const sent = await sendSubmission(result.data, {
    apiKey: RESEND_API_KEY,
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
  });

  if (!sent.ok) {
    logFailure(result.data, sent);

    return wantsJson
      ? json(
          {
            ok: false,
            message: `Something went wrong on our end — not on yours. Please email ${CONTACT_EMAIL} and we will pick it up from there.`,
          },
          200
        )
      : plainPage(
          'We could not send that message',
          `<p>Something went wrong on our end — not on yours. Please email us directly at
            <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
          500
        );
  }

  return wantsJson
    ? json({ ok: true })
    : Response.redirect(new URL('/thank-you', request.url), 303);
};

/**
 * If delivery fails the submission must not vanish. Writing it to the function
 * log means it is still recoverable from the Vercel dashboard — which is
 * exactly what FormSubmit could not do.
 */
function logFailure(data: ContactSubmission, sent: { reason: string; detail?: string }) {
  console.error(
    `[contact] delivery ${sent.reason}${sent.detail ? `: ${sent.detail}` : ''}\n` +
      `  from: ${data.name} <${data.email}>\n` +
      `  org: ${data.organization || '—'} | looking for: ${data.offer || '—'}\n` +
      `  budget: ${data.budget || '—'} | timeline: ${data.timeline || '—'}\n` +
      `  procurement: ${data.procurement || '—'} | deadline: ${data.deadline || '—'}\n` +
      `  came from: ${data.source}\n` +
      `  goals: ${data.projectGoals}`
  );
}

/** Anything other than POST gets sent back to the form. */
export const GET: APIRoute = ({ redirect }) => redirect('/contact', 303);
