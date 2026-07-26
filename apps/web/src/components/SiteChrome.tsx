import { useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToId } from "../lib/scrollToId";

const NAV = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
] as const;

export function SiteHeader({ name }: { name?: string | null }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function goSection(id: string) {
    setOpen(false);
    const hash = `#${id}`;
    if (location.pathname === "/") {
      if (location.hash !== hash) {
        navigate({ pathname: "/", hash: id });
      }
      scrollToId(id);
      return;
    }
    navigate({ pathname: "/", hash: id });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--rule)] bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
        <Link
          to="/"
          className="font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          {name || "Portfolio"}
        </Link>

        <nav className="hidden gap-4 text-sm text-[var(--muted)] sm:flex">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="hover:text-[var(--ink)]"
              onClick={() => goSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ink)] sm:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span
              className={`absolute left-0 top-0 block h-0.5 w-full rounded-full bg-current transition ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] block h-0.5 w-full rounded-full bg-current transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] block h-0.5 w-full rounded-full bg-current transition ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div id={menuId} className="border-t border-[var(--rule)] bg-[var(--paper)] sm:hidden">
          <nav className="mx-auto flex max-w-3xl flex-col px-5 py-3">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-lg px-2 py-3 text-left text-base text-[var(--ink)] hover:bg-[var(--soft)]"
                onClick={() => goSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      ) : null}
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
