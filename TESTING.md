# LBS Fireside — Test Plan

## Automated Tests (run against live server)

```bash
# 1. Start the server
npm start

# 2. In a second terminal, run the simulation
node scripts/simulate-votes.mjs

# With more clients (default is 6)
node scripts/simulate-votes.mjs --clients=12
```

### What the simulation covers

| # | Test | What it checks |
|---|------|----------------|
| 1 | Registration | Presenter + N audience clients connect and register correctly |
| 2 | Audience count | Presenter receives correct headcount after all clients join |
| 3 | Waiting state | Each audience client gets a "waiting" message on connect |
| 4 | Poll voting (all 5 polls) | Every client votes, gets confirmed, presenter tally matches |
| 5 | Vote change | Re-voting updates the count without double-counting |
| 6 | Vote reset | Presenter reset clears all tallies to 0 |
| 7 | Disconnect + reconnect | Count decrements on drop, increments on rejoin, client gets current state |
| 8 | Non-poll screen | Audience receives "waiting" when presenter moves off a poll slide |

---

## Manual Tests (visual + UI)

Run `npm start`, open `http://localhost:3000` and go through each item.

### Presenter View — Navigation

- [ ] Arrow keys (← →) and spacebar advance/go back through slides
- [ ] Back arrow is disabled on slide 1, next arrow is disabled on last slide
- [ ] Slide counter (e.g. "3 / 22") updates correctly
- [ ] Section label updates per slide

### Presenter View — Poll Slides

- [ ] Question text is legible at full screen
- [ ] `+` buttons increment the count for the correct option
- [ ] Bar fills animate smoothly when votes are added
- [ ] "Show Results" reveals percentage labels
- [ ] "Hide Results" collapses the bar chart
- [ ] "Reset" clears all counts and bars back to 0
- [ ] Total vote count ("N votes") updates correctly

### Presenter View — Divider Slides

- [ ] Background turns dark purple
- [ ] Section number (e.g. "01") appears above title
- [ ] Title text is white and readable
- [ ] Duration pill is visible

### Presenter View — Discussion Slides

- [ ] Question text is large and centred
- [ ] Subtitle text appears below if present

### Presenter View — Intro & Close

- [ ] Intro shows QR code on the right side
- [ ] QR code is dark on white — scannable
- [ ] URL below QR code is readable
- [ ] Close slide text is centred

### Visual / Brand

- [ ] Top gradient bar (purple → blue) visible on every light slide
- [ ] Top gradient bar changes shade on dark divider slides
- [ ] Danaher purple (#4000a5) used for accents and tally buttons
- [ ] Bar chart gradient matches brand (purple → blue)
- [ ] No dark backgrounds on non-divider slides
- [ ] Font renders as TWK Lausanne Pan (or clean system fallback)

### Audience View — `http://localhost:3000/audience`

- [ ] Shows "Connecting..." on load, then "Connected" badge
- [ ] Shows waiting screen when presenter is not on a poll slide
- [ ] Poll appears automatically when presenter navigates to a poll slide
- [ ] Tapping an option highlights it and shows a confirmation banner
- [ ] Tapping a different option changes the selection (vote updates)
- [ ] Returning to a poll already voted on shows previous selection
- [ ] Moving off a poll returns audience to waiting screen

### Stress Test (manual)

Open 3–4 browser tabs all pointing to `/audience`, then navigate the presenter
through poll slides rapidly:

- [ ] All tabs receive poll and waiting messages in sync
- [ ] No tab shows stale data after a slide change
- [ ] Presenter tally stays accurate across rapid clicks

---

## Known Constraints

- All devices must be on the same WiFi network for phone voting
- The server must remain running on the presenter's laptop throughout
- Votes are held in memory — restarting the server resets all vote data
