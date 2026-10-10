# PAU Hostel Management System

## MongoDB Atlas setup

1. Create an Atlas cluster and a database user with read/write access to the `pau_hms` database.
2. In Atlas Network Access, allow your development machine's IP. For Vercel, use an Atlas-compatible static egress IP/private networking configuration; avoid opening Atlas to `0.0.0.0/0` in production.
3. Copy `.env.example` to `.env.local` and replace the bracketed URI values with the Atlas connection string. Keep `.env.local` and the URI secret; they must not be committed.
4. Add `MONGODB_URI` and `MONGODB_DB` to the Vercel project's Environment Variables, then redeploy.

The app uses the official MongoDB Node.js driver. Its serverless-friendly client is reused across warm invocations and uses a small `maxPoolSize` of 5 with no pre-warmed connections and a 30-second idle limit, appropriate for the currently expected low traffic on Vercel. Monitor Atlas **Metrics → Connections** and adjust only if observed concurrency or wait-queue pressure warrants it.

## Seed the current prototype data

With the Atlas URI set in the project-root `.env` file, run this once from the project folder:

```powershell
npm run db:seed
```

This upserts the current hostel descriptions and room capacities, initial room availability, sample announcements, roommates, contacts, cafe/service menus, and demo complaints, service orders, and tasks. It is safe to rerun: demo rows are identified by `seedKey`, and room inventory is initialized only when missing, so existing bookings are not reset. Do not run this against production if you do not want demo content there.

The seed command uses the `.env` file in the project root (not `.env.local`). If your Atlas URI is only in `.env.local`, copy it to `.env` locally or run with the variables set in your PowerShell environment. Keep either file out of source control.

## Accounts and roles

- **Student**: signs up through the app. Passwords are bcrypt-hashed; sessions are opaque, database-backed tokens in HTTP-only cookies. The account is always created with the `student` role.
- **Warden**: manages service-order status and can collaborate on tasks. Data access is scoped to the warden's assigned hostel.
- **Manager**: manages complaint status and can collaborate on tasks. Data access is scoped to the manager's assigned hostel.

Staff cannot select a role through the public signup form. Create staff accounts from a trusted machine with the configured MongoDB environment and temporary environment variables. In PowerShell:

```powershell
$env:STAFF_NAME = "Example Warden"
$env:STAFF_PASSWORD = [Net.NetworkCredential]::new("", (Read-Host "Staff password" -AsSecureString)).Password
$env:STAFF_ROLE = "warden" # or "manager"
$env:STAFF_HOSTEL = "amethyst" # amethyst, jasper, faith, or pearl
npm run staff:create
Remove-Item Env:STAFF_NAME, Env:STAFF_PASSWORD, Env:STAFF_ROLE, Env:STAFF_HOSTEL
```

The utility stores only a password hash. It rejects duplicate account names. Never add staff credentials to source control or expose them as `NEXT_PUBLIC_` environment variables.

## Data persisted in MongoDB

- User accounts, assigned role/hostel/room, and expiring login sessions.
- Room reservations, with server-side availability checks and atomic booking updates.
- Student complaints, laundry/cleaning orders, cafe orders, and warden/manager tasks.
- API access is checked on the server for every request; students see their own records, and staff see/manage only their hostel's applicable records.

Announcements, roommate examples, contacts, hostel descriptions/capacities, and the cafe menu remain static prototype content. Payment processing is not integrated: account signup reserves a room but does not charge the displayed fee. Connect and verify a payment provider before treating reservations as paid.

## Development

```powershell
npm install
npm run dev
```

Without valid Atlas settings in `.env.local`, database-backed signup/login and data APIs return an explicit configuration error.