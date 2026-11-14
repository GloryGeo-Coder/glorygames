# Brick Playground 3D — living city roadmap

The goal is an original, mobile-friendly brick city that players build and then experience at street level. Buildings, streets and public spaces should give NPCs useful places to go. Free building stays available without mandatory management tasks.

## Working foundation

- Build/Play switching, reusable buildings, multiple neighbourhoods and a 64-block settlement.
- Named streets, walking directions, lights and a settlement clock.
- Up to eight household routines: walking from homes to shops, halls and park benches, then home again.
- Player-built delivery buggies, delivery rounds, supplied spaza shops and optional named shopkeepers.
- Device saves for buildings, households, stock, cargo and active activities.

## Previous increment: Daily Spaza Trading

Let a supplied shop reopen on the settlement clock, keeping its worker and stock. Invite resting customers, record completed trading rounds, pause reopening and resume saved progress. Customers must really arrive; unmet demand does not turn into sales. This connects existing NPCs to a repeatable city activity.

## Previous increment: Varied citizens and visible journeys

Different adult appearances and walking, waiting and greeting poses make the existing residents easier to recognise. A new park household can include one named child travelling with its adult, without adding a second simulation or shop purchase. The Citizen journey panel explains the selected resident’s destination, return home, pause or blocked route. Existing adult daily visits remain the commuting foundation; workplace assignment belongs to Homes, jobs and services below. Population remains capped at eight households (six optional companions), with near-neighbourhood rendering retained.

## Previous increment: Pavements, crossings and queues

Residents now follow pavement lanes beside connected streets and marked junction crossings, with a short look-before-crossing pause. Shops and halls have separate waiting positions outside the doorway; only one resident enters at a time, and the next visitor waits until the previous visitor physically clears the entrance. Queue phases survive reload, pauses do not grant purchases, and blocked approaches remain repairable. Player walking directions and delivery routes retain their existing road graph. These crossings do not yet provide autonomous traffic signals or vehicle collision avoidance; traffic is a later increment.

## Current increment: Workplace assignments and work shifts

The first Homes, jobs and services increment assigns an adult household a home entrance, workplace entrance and same-day shift. Residents physically commute on the existing pavement graph, need a clear entrance and usable interior, work until their scheduled end, then walk home before a shift is counted complete. Shift state and completed-shift counts survive pause/reload. This is an optional worker routine, not a new purchase, payroll or production system. Schools, clinics and specialist service roles remain later increments within Homes, jobs and services.

## Next NPC increments

1. **Varied citizens and visible journeys (complete).** Add original citizen appearances, names and age groups, starting with adult commuters and family park visitors. Improve walking, waiting and greeting animations. Players can inspect where a citizen is going and why a journey stopped. Children travel with an accompanying adult. Start with a small visible population and profile on phones before increasing it.
2. **Pavements, crossings and queues (complete).** Give pedestrians pavement routes, safe road crossings and distinct waiting positions at shops and public buildings. Keep doorways clear. Broken connections should create visible, repairable problems rather than teleporting people.
3. **Homes, jobs and services.** Assign home and workplace entrances, add work shifts and trips to schools, clinics and community facilities. Introduce NPC roles incrementally: shop assistants, teachers, health workers and maintenance workers. A functioning building needs accessible entrances and usable interior space.
4. **Local traffic and deliveries.** Introduce a small number of autonomous delivery drivers on actual connected streets. Add junction behaviour, stopping bays, congestion and recovery before expanding traffic density. Then add taxis or buses with stops and passengers.
5. **Public-space life.** Add family outings, playground visits, conversations, small markets and community events. Citizens use the parks, benches and facilities the player builds, with daylight and opening hours affecting activity.
6. **City services.** Add waste collection, maintenance and emergency-response scenarios, one service at a time. NPCs travel to the affected location and visibly complete the work. Keep these optional, understandable and recoverable.
7. **A larger city population.** Expand household capacity after measuring frame time, draw calls, route-finding cost and save size. Simulate distant routines cheaply and show detailed citizens near the player. Make neighbourhood activity visible through a compact city overview.

## Acceptance rules for every increment

- Test the complete player activity using phone-sized touch and desktop controls.
- NPCs use player-built streets and entrances; blocked routes have understandable feedback.
- Edits, undo, Build/Play switches and reloads preserve the relevant city state.
- Queues, purchases, passengers and cargo cannot duplicate through pause or reload.
- Review captured game views and keep controls compact enough to see the city.
- Merge verified source to `GloryGeo-Coder/glorygames`; Cloudflare deployment remains with Glory.

These are planned increments, not a claim that traffic, schools, clinics or emergency services already exist. Workplace assignments and same-day shifts begin Homes, jobs and services; school, clinic and community-service trips remain next within that phase.
