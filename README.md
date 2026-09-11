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
`/api/cron/auto-sync` every minute with the header
`Authorization: Bearer <CRON_SECRET>`. The endpoint checks each user's IANA
time zone and assigns each user a stable minute inside 12:00–12:19 PM and
11:45–11:59 PM. It runs three user syncs concurrently, while database claims
make scheduler retries idempotent.

Vercel can supply the authorization header automatically when the environment
variable is named `CRON_SECRET`. Its Hobby plan only supports daily cron
jobs, so the one-minute schedule requires a plan or scheduler that supports
that frequency.

## Authentication links

Set `NEXT_PUBLIC_SITE_URL` to the deployed app origin. In Supabase Auth URL
Configuration, allow `http://localhost:3000/auth/callback` for development
and `https://your-domain.com/auth/callback` for production. Password recovery,
signup confirmation, and changed-email links return through this callback so
the server can establish the cookie session and show a useful recovery screen
when a link is expired or already used.

## Creem subscriptions

Streak X Pro has one feature set with two billing intervals:

- Monthly: `$9.99` every month
- Yearly: `$99.99` every year, saving almost two monthly payments

Create both as recurring SaaS products in Creem and configure a seven-day free
trial on each product. Creem test products, API keys, and webhook secrets are
separate from production, so complete the first setup in test mode.

1. Apply `supabase/migrations/202609110001_creem_subscriptions.sql` in the
   Supabase SQL editor.
2. Create the monthly and yearly products in the Creem test dashboard. Copy
   their product IDs.
3. Create a Creem webhook for
   `https://streakx.online/api/creem/webhook`, subscribe to all subscription
   events, and copy its signing secret.
4. Configure the following server environment variables in Vercel:

   ```env
   SUPABASE_SECRET_KEY=sb_secret_...
   CREEM_API_KEY=creem_test_...
   CREEM_WEBHOOK_SECRET=...
   CREEM_MONTHLY_PRODUCT_ID=prod_...
   CREEM_YEARLY_PRODUCT_ID=prod_...
   CREEM_TEST_MODE=true
   ```

5. Redeploy, sign in, choose a plan at `/subscribe`, finish a test checkout,
   and confirm that the user receives a row in `public.subscriptions`.
6. Before launch, create or copy the products and webhook in Creem production,
   replace all Creem values with production values, set
   `CREEM_TEST_MODE=false`, and redeploy.

The app derives the checkout email and user reference from the authenticated
Supabase session. The webhook verifies Creem's signature and applies events in
timestamp order. Dashboard access, manual refreshes, goal changes, X account
connections, and automatic sync all require an active or trialing subscription.
Active customers can manage cancellation and payment details through Creem's
customer portal from Settings.

Creem documentation: [create a product](https://docs.creem.io/guides/create-your-first-product),
[Next.js adapter](https://docs.creem.io/code/sdks/nextjs),
[webhooks](https://docs.creem.io/code/webhooks), and
[customer portal](https://docs.creem.io/features/customer-portal).
