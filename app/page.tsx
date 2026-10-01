import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const ctaClassName =
  "mt-8 cursor-pointer rounded bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-foreground/90";

export default async function HomePage() {
  const { isAuthenticated } = await auth();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Welcome
      </h1>
      <p className="mt-4 text-lg text-foreground/70">
        A starter app built with Next.js, Turso, Drizzle ORM, and Clerk. Visit
        the todos page to see your database in action.
      </p>
      {isAuthenticated ? (
        <Link href="/todos" className={ctaClassName}>
          Go to todos <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <SignInButton forceRedirectUrl="/todos">
          <button type="button" className={ctaClassName}>
            Sign in to view todos
          </button>
        </SignInButton>
      )}
    </div>
  );
}
