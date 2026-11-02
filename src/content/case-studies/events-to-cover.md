---
client: Claremont Community Media Center
title: Events to Cover
sector: Media / internal application
year: '2025'
order: 1
summary: An internal event coordination board that helps producers find local stories, claim event coverage, and coordinate calendars.
url: https://events.claremontv.org/
metrics: []
draft: false
---

## The challenge

Producers needed a shared, current view of community events worth covering, along with a simple way to coordinate who would attend. Event information was spread across local listings and venue calendars, making it harder to spot opportunities and avoid duplicated effort.

## The solution

Bee Balm built Events to Cover, an internal board that gathers local events, highlights suggested shoots, and lets producers claim coverage so teammates can see the assignment. Staff can add events the roundup misses, view live venue calendar items, and add a selected event to Google Calendar or download an `.ics` file for another calendar app.

The event list refreshes twice a week, while supported venue calendars are read live. Shared picks and added events are stored in Cloudflare D1, with changes visible to the team. The system was refined as the team used it, including a move away from storage that hit usage limits and showed updates inconsistently.

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
