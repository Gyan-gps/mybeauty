# MyBeauty

A mobile-first salon website built with Next.js App Router, TypeScript and MongoDB. Dark charcoal, warm gold, subtle motion, public pages rendered on the server, and client-rendered profile/admin dashboards with skeleton loading states.

## Run locally

Requires Node.js 22.13+ (Node 24 recommended), npm, and MongoDB (Atlas or local).

```powershell
npm install
# Keep your existing .env if you already have one.
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env with your real database and SMTP configuration.
npm run seed
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin.

If using the delivered project from another folder, run `./Install-To-Desktop.ps1` to copy its source into `C:\Users\Rahul\Desktop\SAAS Project\mybeauty`. The script preserves existing `.env` and `.env.example` files. Review your existing values against the included example and add the missing SMTP/admin settings yourself.

Your existing environment variable `NEXT_MONGODB_URL` is supported. It must contain a real `mongodb://` or `mongodb+srv://` connection string. Set `MONGODB_DB` explicitly if you want a database other than `mybeauty`. No credentials are included in this project. Cloudinary settings are not used in this version.

Set `ADMIN_PASSWORD` to a strong password with at least 12 characters. Set `AUTH_SECRET` to at least 32 random characters. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to deliver email OTP codes. Port 465 uses TLS; port 587 uses STARTTLS. Codes are never returned to the client or logged. There is no development login bypass.

Seeding inserts example services and one stylist only when their IDs do not exist; it does not overwrite your changes. Review the example prices, opening hours and service durations in admin before launch. If the database is unavailable, public pages show a clearly indicated preview menu, but bookings and account actions fail closed. No fake booking success is shown.

## Make it your salon

- **Rename once:** change `SALON_NAME` in `src/lib/config.ts`. UI, emails, page titles, manifest and social previews share it.
- Set salon address, phone, email, timezone, offset, currency and booking window in the same file. Current time rules use India/IST. If changing timezone, change the offset consistently; daylight-saving zones require timezone-aware conversion before use.
- Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS URL for canonical URLs, social images and sitemap.
- Public photos are illustrative Unsplash images loaded from their CDN. Replace them with your salon photos before launch. Fonts use Google Fonts with local fallback fonts.
- Replace the placeholder contact details and review the privacy page with your actual providers and retention policy.

## Booking and identity

Choose multiple individual services across Hair, Beard, Facial and Grooming. Prices and durations are computed again on the server; appointments reserve a continuous time interval. Slots are offered every 15 minutes, with 30 minutes' notice and a 30-day booking window. Prices are stored on the appointment so later menu changes do not alter earlier bookings.

Only active stylists are offered. One stylist is assigned automatically without a picker; two or more show a picker. Stylists must offer every selected service. Each has their own hours, working weekdays, breaks, days off and blocked times.

For a first booking, name, mobile with country code, and email are collected. The customer is saved in `users`, the appointment is immediately confirmed, and a secure HTTP-only session signs them in. **The first mobile/email are unverified by design.** This flow can allow another person to register a number first; the salon must handle ownership/recovery disputes. Existing customers must authenticate with an OTP delivered only to the email already saved on their account. Logged-in customers reuse their saved details. A profile can update its name; changing mobile/email requires assisted recovery through the salon.

Mobile is normalized and indexed uniquely. MongoDB `_id` is retained; an immutable `id` links appointments to customers, allowing a future mobile change without breaking history. OTPs are HMAC hashed, expire after ten minutes, allow at most five attempts and are single-use. Requests are limited by mobile; admin login uses a global attempt limit. For a public launch, add edge/IP abuse controls, monitoring and a documented recovery workflow.

## Scheduling consistency

Each stylist/day has a unique schedule document. One conditional MongoDB update checks for overlapping reservations and inserts the interval atomically. This prevents concurrent requests from reserving overlapping times even when they select different start times. User creation uses a unique mobile index and does not log in an existing customer without verification. Failed booking writes release their reservation when the process can handle the failure.

Reservations and appointment records are separate writes: a process crash between them can leave an orphan reservation. Before operating at scale, add a reconciliation job or move booking writes into MongoDB replica-set transactions. Existing appointments remain reserved when staff hours or services change; schedule edits do not automatically cancel appointments. No-show/completed appointments retain the original reservation for their historical time; cancellations release it.

## Profile and admin

- `/profile`: email OTP login, saved details, upcoming/past appointments, name editing, cancellation of future appointments and book again.
- `/admin`: password login, daily appointments, completion and payment marking, cancellation, no-show status, customer directory, service editing, staff schedules, breaks, days off and time blocking.
- Admin lists currently load the most recent 1,000 appointments and customers; pagination is a future extension. Appointment rescheduling currently means cancel and book a new visit.
- All protected reads and writes are authorized in server APIs. Private routes carry noindex metadata. State-changing requests reject foreign origins.

## Installable mobile experience

The PWA provides a manifest, PNG icons (including maskable), standalone mode, safe-area spacing and an offline fallback. Android/Chrome can display an install button when eligible; iPhone users can use Safari → Share → Add to Home Screen. HTTPS is required outside localhost. App-store distribution is separate and is not included.

The service worker caches only a generic offline page. It never caches profiles, APIs, appointment responses or admin content. Bookings and sign-in require connectivity.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

Scheduling tests cover combined services, opening hours, breaks, overlaps, adjacency, blocks, stylist isolation, leave, same-day notice, invalid dates and India timezone boundaries. For end-to-end testing, configure MongoDB and SMTP, seed, then verify first booking → profile → logout → email OTP login → repeat booking, and use two browser sessions to attempt the same appointment interval. Real email delivery, MongoDB concurrency and PWA installation require environment verification.
