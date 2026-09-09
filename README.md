This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Time zones and automatic progress sync

Apply the migration in `supabase/migrations` before deploying. Add
`SUPABASE_SERVICE_ROLE_KEY` and a random `CRON_SECRET` of at least 16
characters to the server environment; never expose either value through a
`NEXT_PUBLIC_` variable.

Configure the production scheduler to send a GET request to
`/api/cron/auto-sync` every 15 minutes with the header
`Authorization: Bearer <CRON_SECRET>`. The endpoint checks each user's IANA
time zone and only syncs users whose local time is 12:00–12:19 PM or
11:45–11:59 PM. Database claims make scheduler retries idempotent.

Vercel can supply the authorization header automatically when the environment
variable is named `CRON_SECRET`. Its Hobby plan only supports daily cron
jobs, so the 15-minute schedule requires a plan or scheduler that supports that
frequency.
