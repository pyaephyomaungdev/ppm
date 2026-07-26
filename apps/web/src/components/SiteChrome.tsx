import { Link } from "react-router-dom";

export function SiteHeader({ name }: { name?: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--rule)] bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-5 w-5 rounded-md bg-[var(--ink)]" aria-hidden />
          {name || "Portfolio"}
        </Link>
        <nav className="hidden gap-4 text-sm text-[var(--muted)] sm:flex">
          <Link to="/#projects" className="hover:text-[var(--ink)]">
            Projects
          </Link>
          <Link to="/#experience" className="hover:text-[var(--ink)]">
            Experience
          </Link>
          <Link to="/#education" className="hover:text-[var(--ink)]">
            Education
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ name }: { name?: string | null }) {
  return (
    <footer className="border-t border-[var(--rule)] py-8 text-center text-sm text-[var(--muted)]">
      © {new Date().getFullYear()} {name || "PPM"}
    </footer>
  );
}
