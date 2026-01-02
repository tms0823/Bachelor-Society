# Bachelor Society

A lightweight Node + Express + EJS project for sharing housing and roommates.

Tech stack
- Node.js + Express
- MySQL (`mysql2`)
- EJS templates
- Tailwind CSS (via CDN for quick prototyping)
- JWT auth (`jsonwebtoken`)
- bcrypt (`bcryptjs`) for password hashing

Quick setup
1. Copy `.env.example` (if present) or create `.env` with DB credentials and JWT secret:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bachelor_society
JWT_SECRET=change_this_secret
PORT=3002

# Optional: Admin account creation (used by create-admin.js script)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_USERNAME=admin
```

2. Install dependencies

```bash
npm install
```

3. Set up the database

**For brand new installations:**
```bash
npm run db:fresh-install
```
This creates the database schema and inserts sample data.

**For existing databases with user data:**
```bash
# First, create a backup (highly recommended)
npm run db:backup

# Then reset safely (requires backup + confirmation)
npm run db:reset-safe

# Or restore from backup if needed
npm run db:restore
```

⚠️ **SAFETY NOTICE**: The old `npm run db:init` command has been removed because it could accidentally delete all user data. Use the safe commands above instead.

4. Create an admin account (optional, for content management)

```bash
node scripts/create-admin.js
```

This creates an admin account with the credentials specified in your `.env` file (or defaults). The script is safe to run multiple times.

5. Run the app in development

```bash
npm run dev
```

API / Frontend
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Users: `GET /api/users/me` (auth), `PUT /api/users/me` (auth)
- Housing: `GET /api/housing`, `POST /api/housing` (auth), `GET /api/housing/:id`, `PUT /api/housing/:id` (auth / owner), `DELETE /api/housing/:id` (auth / owner)
- Buddies: `GET /api/buddies`, `POST /api/buddies` (auth), `GET /api/buddies/:id`, `PUT /api/buddies/:id` (auth / owner), `DELETE /api/buddies/:id` (auth / owner)
- Roommates: `GET /api/roommates`, `POST /api/roommates` (auth), `GET /api/roommates/:id`, `PUT /api/roommates/:id` (auth / owner), `DELETE /api/roommates/:id` (auth / owner), contact at `POST /api/roommates/:id/contact` (auth)

Admin API (admin role required)
- Dashboard: `GET /api/admin/stats`
- User Management: `GET /api/admin/users`, `DELETE /api/admin/users/:id`
- Content Moderation: `GET /api/admin/housing`, `DELETE /api/admin/housing/:id`, `GET /api/admin/roommates`, `DELETE /api/admin/roommates/:id`, `GET /api/admin/buddies`, `DELETE /api/admin/buddies/:id`

UI
- EJS views are in `views/` and use simple Tailwind styling. Public JS files are in `public/js/`.
- Profile management at `/profile`
- All modules have list, create, detail, edit/delete views with client-side JS for interactions.
- **Admin Panel**: Dedicated admin interface at `/admin/dashboard` with user management, content moderation, and statistics (admin role required)

DB
- Schema SQL: `sql/schema.sql`
- Seed data: `sql/seed.sql`
- Database scripts: `scripts/` folder
  - `npm run db:fresh-install` - New database setup
  - `npm run db:backup` - Backup user data
  - `npm run db:reset-safe` - Safe reset with backup
  - `npm run db:restore` - Restore from backup

Testing
- A minimal test scaffold has been added using Jest + Supertest; run `npm test` after installing dev dependencies.

Notes
- This is a prototype; for production use you should harden security (rate limit, CSRF, input validation), use environment secrets, and add robust testing / CI.

Next steps completed or in-progress
- Auth, housing, buddies modules implemented with views and basic client JS.
- Remaining: polish UI, add more tests, add production deployment docs.

CI
- A basic GitHub Actions workflow is included at `.github/workflows/nodejs.yml` to run `npm test` on push/PR to `main`.
