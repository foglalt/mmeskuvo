# M & M Wedding Site

Public wedding website and admin dashboard built with Next.js App Router, Prisma, and NeonDB.

## Features
- Public sections: hero, info, RSVP, support, about
- Admin area for editing content, theme, RSVP list, and translations
- Translations stored in NeonDB (seeded from JSON defaults) and editable in admin
- Dismissable language prompt for non-Hungarian device languages
- Images are pre-uploaded to `/public/images` and selectable in admin

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD`
3. `npx prisma db push`
4. `npm run dev`
5. Open `http://localhost:3000`

## Admin
- Login at `/admin/login` with `ADMIN_PASSWORD`
- Edit translations at `/admin/translations` (saved to DB)

## Content and Assets
- Place images in `public/images`; admin pages list them via `/api/images`
- Default translations live in `content/translations` and are used to seed the DB

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`

## Git Hooks
- `npm run hooks:install` to enable the pre-commit hook (runs lint + build)
