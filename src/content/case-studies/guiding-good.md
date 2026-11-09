---
title: "A nonprofit consultancy's full rebuild, start to launch"
client: "Guiding Good LLC"
sector: "Nonprofit consulting"
summary: "Brand, photography, and a 30-page website with a working enquiry pipeline — delivered in days rather than months, and shipping 102 KB to the browser."
year: "2026"
url: "https://guidinggood.org"
role:
  - "Logo and brand application"
  - "Photography"
  - "Information architecture"
  - "Design system"
  - "Front-end build"
  - "Content migration"
  - "Deployment and handover"
metrics:
  - value: "30"
    label: "pages, statically rendered"
  - value: "102 KB"
    label: "total page weight"
  - value: "8"
    label: "requests to first render"
  - value: "19 ms"
    label: "time to first byte"
order: 3
---

## The situation

Guiding Good is a consultancy in Claremont, New Hampshire, founded by two partners with
sixty years of combined nonprofit experience between them. They advise nonprofits on
marketing, grants, events, leadership training and fundraising.

Their existing site was a WordPress build that had drifted. The writing that mattered —
partner biographies, a detailed services document, a decade of published articles — was
scattered across Word files, an ageing blog, and a previous site that was partly offline.
Prospective clients are nonprofit executive directors and board chairs deciding whether to
trust an outside advisor. The site had to carry that weight, and it was not.

## What was needed

- A single, credible home for the practice, built around what they actually sell
- Their published writing recovered, edited and republished as a working article library
- An enquiry route that reaches them reliably and is traceable when it fails
- Something the partners can add to themselves, without a developer and without a CMS to maintain

## Approach

**Brand first, then everything from it.** The palette was sampled directly from the
compass mark in their logo — deep navy, teal, aqua and a signal red — then expressed as
design tokens so the whole site stays consistent. The red was deepened for body and button
use so text meets contrast requirements against white.

**Content before layout.** The services document, both partner biographies and the advisor
profile were read end to end and rewritten for the web. Eleven published articles were
recovered from Word files and an archived copy of the old site, re-edited, and given proper
publication dates, authorship and topics.

**A stack chosen for who maintains it.** Astro renders every page to static HTML at build
time. htmx handles the article topic filtering, and Alpine handles small interface state —
the mobile menu, a reading-progress bar, form status. There is no CMS to patch, no plugin
surface, and no database. Adding an article means adding a Markdown file.

**Progressive enhancement throughout.** Every article filter is a real link to a real page,
so the site works with JavaScript disabled and every filtered view has a shareable URL.
htmx intercepts the click and swaps only the results. The contact form posts normally
without JavaScript and follows a redirect; with JavaScript it swaps the response in place.

## What was delivered

A thirty-page site: home, about, team biographies, a services index with a page for each of
the five practice areas, an article library with per-topic filtering and pages, contact, and
a thank-you page.

Alongside it: logo application and brand tokens, photography of the partners, structured
data for search engines, per-page social metadata, a generated sitemap, and written handover
documentation covering how to add an article and how the email pipeline is configured.

The enquiry form posts to a serverless function that validates the submission and sends it
on through a verified sending domain. If delivery ever fails, the sender is told plainly and
the full submission is written to the server log — nothing is silently lost.

## Results

Measured on the live site:

| | Guiding Good | Typical WordPress marketing site |
| --- | --- | --- |
| Requests to first render | **8** | 60–150 |
| Total page weight | **102 KB** | 2–4 MB |
| JavaScript shipped | **40 KB** | 500 KB–1.5 MB |
| Time to first byte | **19 ms** | 200–800 ms |

The practical consequences matter more than the numbers. There is no hosting bill of
consequence, because static files cost almost nothing to serve. There is no plugin
maintenance, no security patching cycle, and no version upgrade that breaks a page builder.
The partners can publish an article without calling anyone.

## Accessibility and standards

Built with semantic landmarks and heading order, a skip link, visible keyboard focus states
throughout, `prefers-reduced-motion` support, live-region announcements on the contact form,
and a colour palette checked for contrast. Every interactive control is reachable and
operable by keyboard.

## Technical notes

Astro 7, htmx 2, Alpine.js 3, a hand-written CSS design system with no framework dependency,
deployed on Vercel. Articles are a Markdown content collection with a typed schema. The one
server-rendered route is the contact endpoint; everything else is prerendered.
