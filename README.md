# Bee Balm Productions

The marketing site for Bee Balm Productions — [beebalmproductions.com](https://beebalmproductions.com).

Astro 7 with Tailwind 4, deployed on Vercel. The site is static apart from one
serverless route, `/api/contact`.

## Commands

| Command           | Does                                      |
| ----------------- | ----------------------------------------- |
| `npm install`     | Install dependencies                      |
| `npm run dev`     | Dev server at `localhost:4321`            |
| `npm run build`   | Production build into `.vercel/output`    |
| `npm run preview` | Preview the build locally                 |
| `npx astro check` | Type-check (slow on first run)            |

## The contact form

Two forms post to the same route: the inquiry form on `/contact` and the chat
intake widget in the corner of every page.

### Why it is built this way

Until November 2026 both forms posted to **FormSubmit**, a free relay. Around
13 October it stopped delivering. It carried on accepting submissions and
showing visitors a success page on its own domain, and simply did not send the
mail. FormSubmit publishes no log, so the enquiries from those three weeks are
gone and there is no way to know how many there were.

The likely cause is that FormSubmit sent from its own servers, so nothing in
those messages could be authenticated as `beebalmproductions.com` — SPF, DKIM
and DMARC all fail alignment, and the mailbox is on Google Workspace, which
treats that pattern harshly.

So the replacement is built around one rule: **a submission must never be able
to disappear quietly.** If Resend cannot deliver, the entire submission is
written to the function log and can be read back from the Vercel dashboard.

### How it behaves

| Situation                      | With JavaScript                      | Without JavaScript        |
| ------------------------------ | ------------------------------------ | ------------------------- |
| Success                        | Message swapped in place             | Redirect to `/thank-you`  |
| Missing or malformed fields    | Field errors listed above the button | Plain page listing them   |
| Spam (honeypot or too fast)    | Silently accepted, delivered nowhere | Same, then `/thank-you`   |
| Cannot deliver                 | Error pointing at the direct email   | Same, and logged in full  |

### Environment variables

Set in Vercel under **Settings → Environment Variables**, then redeploy.

| Variable                    | Required | Notes                                              |
| --------------------------- | -------- | -------------------------------------------------- |
| `RESEND_API_KEY`            | yes      | Without it the form cannot deliver                 |
| `CONTACT_FROM_EMAIL`        | no       | Must be on the domain verified in Resend           |
| `CONTACT_TO_EMAIL`          | no       | Defaults to `info@beebalmproductions.com`          |
| `PUBLIC_TURNSTILE_SITE_KEY` | no       | Spam protection. Needed at **build** time          |
| `TURNSTILE_SECRET_KEY`      | no       | Spam protection                                    |

### Setting up Resend

1. Add `beebalmproductions.com` at [resend.com/domains](https://resend.com/domains)
   and create the DNS records it gives you. These are **sending** records and do
   not touch the Google Workspace MX records, so inbound mail is unaffected.
2. Create an API key and add it to Vercel as `RESEND_API_KEY`.
3. Redeploy.

`website@beebalmproductions.com` does not need to be a real mailbox — it is a
sending identity only. Replies go to the enquirer, because the route sets
`reply_to` to their address.

### Spam protection

Three layers, cheapest first: a honeypot field, a timing floor, and Cloudflare
Turnstile. Turnstile rather than a picture-puzzle captcha, because this site
publishes an [accessibility statement](src/pages/accessibility.astro) and
"identify every traffic light" is a barrier for the people that statement is
addressed to.

Create a widget at [Cloudflare → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
(free). **List both `beebalmproductions.com` and `www.beebalmproductions.com`
as hostnames**, whichever one is currently primary in Vercel — the widget
refuses to render on a hostname that is not listed, and a visitor who cannot
get a token cannot submit.

It fails open. Verification is skipped, and the submission allowed, whenever
the cause is ours rather than the visitor's:

| Situation                        | Result                                      |
| -------------------------------- | ------------------------------------------- |
| Neither key set                  | Not checked. The widget is not rendered     |
| Only one key set                 | Not checked, and logged loudly              |
| Cloudflare unreachable or 5xx    | Not checked, and logged loudly              |
| Cloudflare reports a key problem | Not checked, and logged loudly              |
| Cloudflare rejects the token     | **Rejected** — the one case that fails shut |

The half-configured case matters most: the site key is inlined at build time,
so without it the widget never renders, nobody can produce a token, and
treating that as failure would reject *everyone*.

### If enquiries stop arriving

In the Vercel dashboard, open the project → **Logs**, and search for:

- `[contact] delivery` — the submission reached us and Resend refused it. The
  full submission is in the log entry, so nothing is lost. Usually an expired
  API key or an unverified sending domain.
- `TURNSTILE NOT ENFORCED` — the form is open and unchecked. Not urgent for
  delivery, but the spam gate is down.
- `[contact] turnstile rejected` — real visitors being turned away. If there
  are many, check the widget's hostname list first.

No log entries at all means nothing is reaching the route; check that the
deployment actually built the function and that the form's `action` is
`/api/contact`.

## Domains

`astro.config.mjs` sets `site: 'https://beebalmproductions.com'`, which drives
the canonical tags and the generated sitemap. The bare domain is primary in
Vercel and `www` redirects to it. If that is ever reversed, change it here too
and add the new hostname to the Turnstile widget — otherwise the site claims
one canonical host while serving another, and the captcha stops rendering.
