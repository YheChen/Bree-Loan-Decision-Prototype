# Bree Loan Application Prototype

## Overview

This project is a front-end prototype for an AI-powered loan application processor take-home. It focuses on the product experience on top of a scoring engine, not the engine itself.

Live demo: https://bree-loan-decision-prototype.vercel.app/

The prototype includes:

- applicant submission flow
- approved outcome
- denied outcome
- flagged-for-review outcome
- admin review dashboard
- missing-documents edge case with document re-upload

All application data is static mock data. There is no backend, database, auth, or API persistence.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- static mock data only

## Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Demo Routes

- `/`
  Applicant landing page with seeded demo cases and custom input mode
- `/decision/approved/app-001`
  Approved state for Jane Doe
- `/decision/denied/app-002`
  Denied state for Bob Smith
- `/decision/review/app-003`
  Manual review state for Bob Smith
- `/decision/review/app-005`
  Missing-documents status state for Carol Tester
- `/reupload/app-005`
  Document re-upload flow for the missing-documents edge case
- `/admin/reviews`
  Admin review dashboard for flagged applications

## Design Decisions

- The denial experience is intentionally high level and compliance-safe. It does not expose factor-level reasons or numerical scores to the applicant.
- The review state emphasizes reassurance and clarity instead of fake precision. It uses a lightweight status tracker and a conservative timeline, not a countdown timer.
- The missing-documents edge case was chosen because it is common, recoverable, and a strong example of reducing user frustration without making applicants restart. In the current flow, applicants first land on a status page and then move into re-upload only when action is needed.
- The admin dashboard is designed for quick triage. Reviewers can scan the queue, inspect score breakdowns, read submitted documents, leave notes, and take a next-step action in one place.
- For demo clarity, the flagged queue includes both review-ready files and applicant-action holds. In production, I would likely separate missing-document cases into a dedicated `waiting on applicant` bucket instead of mixing them into the main reviewer queue.
- The home page supports both seeded demo paths and custom inputs so the prototype can show the required scenarios while still feeling interactive.

## Tradeoffs

- Chosen features:
  - `A` lightweight status tracker
  - `B` document re-upload flow
  - `C` reviewer notes system
- Cut features:
  - `D` applicant appeal flow
  - `E` batch approve/deny
- I treated feature `A` as a lightweight status tracker rather than a literal real-time countdown, because a countdown would create false precision and reduce trust in a variable review process.
- The admin queue uses a lightweight priority sort: missing documents first, near-threshold review cases next, and lower-dollar ambiguous files after that. I would validate and tune that heuristic with ops data before using it in production.
- Reviewer actions and notes are local UI state only. They are meant to demonstrate workflow, not persistence.

## What I’d Improve With More Time

- split applicant-action holds into a dedicated queue instead of showing them beside review-ready files
- add pre-submission document validation to reduce manual review volume
- design a proper reconsideration or updated-documents path for denied applicants
- improve mobile polish on the admin dashboard
- add analytics instrumentation for funnel completion, flag rate, time to decision, and reviewer throughput
- connect the prototype to a lightweight mock API layer for more realistic state transitions
