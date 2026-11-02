---
title: "An assignment desk for a newsroom that doesn't have one"
client: "Claremont Community Media Center"
sector: "Municipal / public access media"
summary: "A story lead board that pulls live community calendars from ten towns, suggests what to cover, and lets staff claim an assignment — plus the station's website, streaming and contributor pipeline."
year: "2020–2026"
url: "https://events.claremontv.org"
role:
  - "Story Lead Board application design and build"
  - "Calendar aggregation and lead scoring"
  - "Website design and build"
  - "Live streaming integration for two channels"
  - "Git and Cloudflare deployment workflow for contributors"
metrics:
  - value: "10"
    label: "towns covered across NH and VT"
  - value: "3x"
    label: "monthly programming output"
  - value: "1,300%"
    label: "growth in digital reach in one year"
editorNote: >-
  Joshua is Executive Director here as well as the developer — disclosed in the body.
  Attribution: the Story Lead Board at events.claremontv.org is his build, LLM-assisted.
  The School Board Meeting Navigator is Kevin Tyson's build, also LLM-assisted; Bee Balm
  contributed polish and the Git/Cloudflare publishing workflow. Do not conflate the two.
  Worth adding: how long the Lead Board took to build, and whether coverage volume changed
  measurably after it shipped.
order: 2
---

## The problem nobody budgets for

A community media centre with two municipal channels has to decide, every week, what to
send a crew to. In a newsroom that is an assignment desk — an editor, a whiteboard, and
somebody whose job is knowing what is happening in town.

A 501(c)(3) with a $140K budget has none of that. What it has is a handful of staff and
board members, several town calendars nobody has time to read, and a recurring Monday
question: what are we covering this week, and is anyone already on it?

## The Story Lead Board

[events.claremontv.org](https://events.claremontv.org) is the answer — an internal
assignment desk built for how this organisation actually works.

**It gathers the leads.** The board pulls from live community calendars across roughly a
25-mile radius — Claremont, Charlestown, Newport, Springfield, Sunapee, Lebanon, Hanover,
White River Junction, Woodstock and Etna — and refreshes twice a week. Nobody has to check
ten websites.

**It suggests what to shoot.** Leads are sorted into a dated rundown and filterable by town,
by type (arts, business, community, health and seniors, kids and family, markets, sports
and recreation), by whether they are free, and by whether anyone has picked them up yet. A
suggested shoots section surfaces the desk's recommendations.

**It carries a story angle.** Each lead has an angle attached, so the person reading the
board sees a possible story rather than a calendar entry.

**It handles who is covering what.** Picking a lead claims it and shows the rest of the team
your name against it. That one feature removes the most common failure in a volunteer-heavy
operation: two people covering the same thing, or everyone assuming someone else has it.

**It is honest about its sources.** Leads pulled from listing sites are flagged to verify
with the organiser before a crew is dispatched, and every lead names where it came from. A
tool that aggregates third-party data and pretends it is all reliable will eventually send
a crew to an event that was cancelled a month ago.

Built solo, with LLM assistance — which is the only reason an organisation this size has
bespoke editorial tooling at all.

## The honest disclosure

Bee Balm's principal is also this organisation's Executive Director. That is stated plainly
rather than buried: this was not an arm's-length commission. What it means is unusually
complete knowledge of the operation — the broadcast workflow, the municipal relationships,
the funding constraints, and what the Monday meeting actually feels like — informing every
decision in the build.

## The rest of the picture

**The station's website.** Live streams for both channels lead the page, because that is
what most visitors came for, with the video library browsable beneath.

**A publishing pipeline for contributors.** The site is set up so a developer who is not
staff can make changes, review them and publish safely — version control through Git,
deployment through Cloudflare. No editing live, no single bottleneck.

That pipeline is how the **School Board Meeting Navigator** reaches the site — the tool that
lets residents find a specific item inside the school board meeting library rather than
scrubbing a three-hour recording. It was **built by Kevin Tyson**, also using LLM-assisted
development; Bee Balm's part was polish and the route to publish. It is named here because
it makes the point of the infrastructure: a capable contributor with a safe way to ship
produced genuinely useful civic software for an organisation that could never have
commissioned it.

## Results

Monthly programming output tripled from roughly 20 to over 60 community, educational and
municipal programmes, and digital reach across platforms grew by more than 1,300% in a
single year. The web work sits alongside a full modernisation: 4K production standards, two
internal studios, a mobile production unit, and the streaming system the site depends on.

## Why this generalises

The Story Lead Board is not really about television. Any organisation that has to decide
where to send limited people — a volunteer coordinator, a regional nonprofit, an outreach
team, a local newsroom — has the same problem: scattered sources, no shared view of what is
claimed, and no time to build the thing that would fix it.

That is now a two-week build rather than a six-month one, which is precisely what puts it
within reach of organisations that have never been able to afford custom software.
