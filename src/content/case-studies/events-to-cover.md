---
client: Claremont Community Media Center
title: Events to Cover
sector: Media / internal application
year: '2025'
order: 1
summary: An internal event coordination board that helps producers find local stories, claim event coverage, and coordinate calendars.
url: https://events.claremontv.org/
metrics:
  - value: "10"
    label: "towns covered across NH and VT"
  - value: "2x"
    label: "weekly automatic refresh"
  - value: "7"
    label: "event categories filtered"
editorNote: >-
  Companion to the Claremont Community Media Center study, which covers the public website,
  streaming and contributor pipeline. Keep this one on the application so the two do not
  overlap. Worth adding if known: how long the build took, and whether coverage volume
  changed measurably after it shipped.
draft: false
---

## The challenge

Producers needed a shared, current view of community events worth covering, along with a simple way to coordinate who would attend. Event information was spread across local listings and venue calendars, making it harder to spot opportunities and avoid duplicated effort.

## The solution

Bee Balm built Events to Cover, an internal board that gathers local events, highlights suggested shoots, and lets producers claim coverage so teammates can see the assignment. Staff can add events the roundup misses, view live venue calendar items, and add a selected event to Google Calendar or download an `.ics` file for another calendar app.

Leads are gathered from roughly a 25-mile radius — Claremont, Charlestown, Newport,
Springfield, Sunapee, Lebanon, Hanover, White River Junction, Woodstock and Etna — then
sorted into a dated rundown that filters by town, by category across seven types, by whether
an event is free, and by whether anyone has claimed it yet. Each lead carries a suggested
story angle, so what a producer reads is a possible story rather than a calendar entry.

The event list refreshes twice a week, while supported venue calendars are read live. Shared picks and added events are stored in Cloudflare D1, with changes visible to the team. The system was refined as the team used it, including a move away from storage that hit usage limits and showed updates inconsistently.

## Being honest about the data

Leads pulled from third-party listing sites are flagged to verify with the organiser before a
crew is sent, and every lead names where it came from. An aggregator that treats scraped
listings as reliable eventually dispatches a crew to an event that was cancelled a month
earlier, so the tool says plainly which items it can stand behind.

## What changed

The team now has one place to find nearby coverage opportunities, coordinate assignments, and carry selected events into their calendars. The tool replaces a passive list with a shared workflow that supports discovery, assignment, and follow-through.

## Scope

- Workflow discovery and application design
- Event aggregation and filtering
- Shared event assignment and team visibility
- Calendar links and `.ics` downloads
- Live venue calendar feeds
- Cloudflare Pages deployment and D1 storage
- Iterative improvements based on operational use

---

The station's public website, streaming and contributor workflow are covered separately.
[Read the Claremont Community Media Center case study](/portfolio/claremont-community-media).
