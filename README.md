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

3. Create the SQLite database and Prisma migration:

   ```bash
   npm run prisma:migrate -- --name init
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

- `/` creates a post and opens the full-screen one-post viewer.
- `/p/[slug]` displays one shareable post.

## Notes

Post content is rendered as text only. The app never uses raw HTML rendering for user content, validates empty posts, and enforces a 2,000 character limit.

Generated post slugs are five-word phrases backed by a database counter, not random strings. The current word set supports more than 34 billion unique slugs before it would need to be expanded.
