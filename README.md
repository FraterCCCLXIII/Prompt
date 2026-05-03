# Prompt

Prompt is a minimalist anonymous posting app. Anyone can write a text post, save it to local SQLite, and share it with a unique URL.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Prisma
- SQLite

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Create the SQLite database and apply migrations:

   ```bash
   npm run prisma:migrate
   ```

4. Seed example posts:

   ```bash
   npm run prisma:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` creates a post and links into public reading navigation.
- `/p/[slug]` displays one shareable post.
- `/read` redirects to the most recent public post.
- `/about` explains the project.
- `/admin/setup` creates the first admin account after install.
- `/admin/login` signs in an existing admin.
- `/admin` shows the moderation dashboard.
- `/admin/settings` changes admin credentials and manages IP bans.

## Admin Dashboard

The admin dashboard is intentionally local and simple. On a fresh install, visit `/admin/setup` to create the first admin account with an email and password. After setup, `/admin/login` is used for sign-in.

Admin sessions are stored in an HTTP-only cookie and backed by the `AdminSession` table. Passwords are hashed with Node's built-in `scrypt` before storage.

The dashboard shows:

- Post ID and share URL
- Created date
- Captured IP address
- Visibility: public, unlisted, or hidden
- Report status and report count
- Post preview
- Actions to hide, delete, clear reports, and ban an IP

The settings page supports:

- Changing the admin email
- Changing the admin password
- Adding banned IPs with an optional reason
- Removing IP bans

### Resetting an Admin Password

There is no email-based password reset because Prompt does not require an SMTP server. Reset admin access from the local terminal instead:

```bash
npm run admin:reset-password -- admin@example.com
```

The command prompts for a new password, hashes it with the same `scrypt` password storage used by the app, updates the matching admin account, and clears existing admin sessions.

## Moderation Behavior

Public posts can appear in reading navigation. Link-only posts are readable by direct URL but are excluded from public previous/random/next navigation. Hidden posts are removed from public access.

The public report button records a report flag on the post. Reported posts appear in the admin dashboard with their report count.

When a post is created, the app stores the request IP address when available. If that IP is banned, post creation is rejected.

## Notes

Post content is rendered as text only. The app never uses raw HTML rendering for user content and validates empty posts. The character limit is currently disabled in code so long-form posts can be tested.

Generated post slugs are five-word phrases backed by a database counter, not random strings. The current word set supports more than 34 billion unique slugs before it would need to be expanded.
