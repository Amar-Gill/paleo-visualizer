# Next.js Turso Starter

This repository is a starter template for building a Next.js application with Turso and Drizzle ORM.

<img width="1200" alt="Next.js Starter" src="https://github.com/user-attachments/assets/b78fd54e-574b-43b9-8f8f-943d14722e64" />

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=Simple%20Next.js%20starter%20for%20using%20SQLite%20over%20HTTP%20with%20Turso.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F2bMt29jx0XHekOO2lYlj6R%2Fc902d38ad15abf0c6d52f05bf60d54c5%2Fzi0I1GXrZoKub1NCL6i3VKe8a2UE5HMITQn1WCyquvoSZxwk&demo-title=Next.js%20Turso%20Starter&demo-url=https%3A%2F%2Fnextjs-turso-starter.vercel.app&from=templates&products=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522protocol%2522%253A%2522storage%2522%252C%2522productSlug%2522%253A%2522database%2522%252C%2522integrationSlug%2522%253A%2522tursocloud%2522%257D%255D&project-name=Next.js%20Turso%20Starter&repository-name=turso-starter&repository-url=https%3A%2F%2Fgithub.com%2Ftursodatabase%2Fnextjs-turso-starter&skippable-integrations=1)

## Stack

- Next.js 15
- App Router
- Server Actions
- Drizzle ORM
- Turso Database
- Todo CRUD
- TypeScript
- Tailwind CSS

## Local Development

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables:

   ```bash
   cp .env.example .env
   ```

   The example `.env` file uses a local SQLite database.

   Fill in your Clerk credentials:

   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   ```

4. Set up your database:

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Management

This project uses Drizzle ORM for database operations. Here are the available commands:

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to the database (use with caution)
- `npm run db:migrate` - Run migrations against the database
- `npm run db:seed` - Seed the database with initial data
- `npm run db:studio` - Open the Drizzle Studio for database management

## Need Help?

1. Open an issue on GitHub
2. Submit a Pull Request to improve this starter
3. [Join us on Discord](https://tur.so/discord)
