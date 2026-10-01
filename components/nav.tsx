import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { NavLink } from "./nav-link";

export async function Nav() {
  const { isAuthenticated } = await auth();

  const links = [
    { href: "/", label: "Home" },
    ...(isAuthenticated ? [
      { href: "/viewer", label: "Viewer" },
      { href: "/todos", label: "Todos" }
    ] : []),
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-foreground/10 px-6">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="hidden text-sm font-black tracking-tight sm:block"
        >
          Next.js Turso Starter
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Show when="signed-out">
          <SignInButton>
            <button
              type="button"
              className="cursor-pointer rounded px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              type="button"
              className="cursor-pointer rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              Sign up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
