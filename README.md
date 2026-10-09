# Learnly

Learnly is an interactive learning platform for autistic children (ages 5–10) and their parents. It is a **frontend-only MVP**: there is no backend, database, external API or AI service. Sign-in, learning history, reports, observations and specialist requests are all simulated in the browser and stored in `localStorage`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build
```

Requires Node 18+.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Parent | `parent.demo@learnly.test` | `Learnly-Demo-2026` |
| Specialist | `teacher.demo@learnly.test` | `Learnly-Demo-2026` |

- The login page has **“Valideyn demosu”** and **“Mütəxəssis demosu”** buttons that sign in with one click.
- **Child-mode PIN:** `1234`. You need it to leave child mode and return to the parent app.
- Authentication and route guards are frontend demo behaviour only. They are not a security boundary.

## What's inside

**Parent app** (`/parent/*`)
- **Dashboard.** Shows Aylin's 14 days of synthetic learning data: first-attempt accuracy, completion rate, difficult-step rate, average response time, completed activities and the weekly trend. It also has skill cards for hygiene, safety and emotions, Recharts charts with a table view, recent activity, quick actions and demo history controls.
- **Child profile.** A six-step wizard where only name, date of birth and diagnosis status are required. Other steps can be skipped with "Sonra doldururam". The profile shows completion %, reminders for missing sections and medical history entries. Parents can add more children and switch between them.
- **Lessons & games.** Lists each activity with its statistics and the full step-level history.
- **Reports.** "AI-dan rəy al" builds a deterministic, template-based report from local data, with no AI call. Each report has a summary, up to 3 strengths, up to 3 areas for attention, exactly 3 home activities, next lessons and a consultation note. Report history and a restore option are included.
- **Daily observations.** A ~30-second entry for mood, sleep, crisis and a note. Entries can be edited and deleted, and there is a weekly summary.
- **Specialist marketplace.** 8 fictional specialists with search and filters (specialty, city, format, language, experience, price, verified). Each has a details dialog. A request needs explicit consent, and parents can cancel a request or revoke access.
- **Settings.** Language, sound, reduced motion and a full demo reset.

**Child mode** (`/child/*`)
- A separate illustrated world with its own shell (no sidebar). It includes a greeting, stars, today's learning path, a continue card, lessons, games and non-competitive badges.
- **3 lessons:** handwashing (interactive sink scene), road safety (street scene and interactive pedestrian light) and emotions (expressive faces). Lessons mix info cards, multiple choice, tap-the-scene and sequence steps. Each question allows up to 3 attempts, after which the answer is revealed gently. Hints are available, and progress can be resumed.
- **2 games:** "Günümü düzürəm" (sequencing, with tap-to-place plus optional drag-and-drop) and "Fərqli olanı tap" (odd one out, 5 rounds).
- Sound is off by default and stays locked off for children with high sound sensitivity. Reduced motion is respected (system setting, or a manual toggle in child mode or settings). There are no timers and no punitive feedback.

**Specialist app** (`/teacher/*`)
- Summary, pending and active requests, and a timeline.
- Request detail shows a limited preview while pending. After the request is accepted, the child's profile and learning summary appear read-only. Rejected, canceled, revoked or closed requests show an "access closed" state instead.
- All status changes are shared with the parent app through the same local state.

**Languages:** Azerbaijani (default), English and Russian, including all lesson content. The selected language is saved.

## Demo data rules

All metrics come from `src/lib/learning-metrics.ts`, so every screen uses the same numbers:

- **First-attempt accuracy** = steps correct on the first try without a hint ÷ all steps
- **Completion rate** = steps solved within 3 attempts ÷ all steps
- **Difficult step** = more than 20 s, or 3 or more attempts
- **Weekly trend** = the last 7 days compared with the previous 7. A change of 10 percentage points or more counts as meaningful.
- **Consultation indicator** = a skill drops by more than 20 pp, or 3 or more crises are recorded in a week

These are product demonstration rules, not clinical thresholds.

The synthetic history is deterministic (seeded). Its dates are relative to today and are shifted forward automatically when the app is opened on a later day. **Settings → Demo məlumatlarını sıfırla** restores everything.

## Deployment

Learnly uses real URLs (`BrowserRouter`), so the host must serve `index.html` for every client-side route. Otherwise a refresh or a direct link such as `/parent/reports` returns the server's 404.

- **Netlify (configured):** build command `npm run build`, publish directory `dist`. The SPA rewrite is in `public/_redirects`, which Vite copies into `dist/`, so it also applies when `dist/` is uploaded manually. Real files (JS, CSS, fonts) are served before the rewrite. Unknown paths still reach the app, which shows its own Not Found page.
- **Other static hosts:** add that host's equivalent "rewrite all routes to /index.html" rule. Opening `dist/index.html` from disk, or a plain file server without a fallback, will 404 on deep links.
- **Sub-path hosting** (e.g. `https://example.com/learnly/`): build with `npx vite build --base /learnly/`. The router reads Vite's base URL, so links and deep links keep working.

## Reliability notes

- Everything restored from `localStorage` is validated (`src/lib/storage-schema.ts`). Valid records are kept, broken ones are dropped or repaired, and fresh demo data is seeded only when nothing usable remains. In development, a console warning explains what was repaired.
- Error boundaries wrap the app, every route and each layout's page area. A failing screen shows recovery actions instead of a blank page. Navigating to another page clears the error, and development builds show the stack trace.
- Opening or refreshing a `/child/...` URL starts child mode. Reaching it with the browser's Back/Forward after leaving via the PIN does not; the parent stays in the parent app.
- After signing in, the user returns to the page they originally opened if it belongs to their role.

## Project structure

```
src/
  components/   ui, charts, navigation, feedback, illustrations (original SVG/CSS art)
  features/     auth, dashboard, profile, lessons, games, reports, observations, marketplace, teacher, settings, child
  layouts/      ParentLayout, ChildLayout (+ PIN keypad), TeacherLayout
  mocks/        users, children, lessons, games, learning-history, observations, specialists, requests
  lib/          mock-auth, mock-storage, learning-metrics, report-generator, demo-reset, sound, dates
  store/        AppStore (single persisted state shared by all roles)
  i18n/         az / en / ru resources
```

Stack: React 19, Vite, TypeScript, Tailwind CSS 4, React Router 7, Motion, Recharts, i18next and Lucide. Fonts (Nunito, Manrope) are bundled locally, so the app does not load any remote images or assets.
