import { Link, useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report an Incident" },
  { to: "/map", label: "Public Map" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="border-b border-border bg-background/95 sticky top-0 z-40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-primary">
            HAID Watch
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
            Civic Transparency
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          HAID Watch is non-partisan and does not endorse any political party,
          candidate, or ideology.
        </p>
      </div>
    </footer>
  );
}
