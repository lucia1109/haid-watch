import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { IncidentSearch } from "@/components/IncidentSearch";

// Leaflet needs `window`, so it is loaded client-side only.
const IncidentMap = lazy(() => import("@/components/IncidentMap"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Public Map — HAID Watch" },
      {
        name: "description",
        content:
          "Browse published incident reports on the public transparency map, or search the full archive by keyword, category, or location.",
      },
      { property: "og:title", content: "Public Transparency Map — HAID Watch" },
      {
        property: "og:description",
        content:
          "Browse published incident reports on the public transparency map, or search the full archive by keyword, category, or location.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16 animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Public Transparency Dashboard
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Published Incident Reports
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The map shows reports submitted with a location pin — the search below
        covers every published report.
      </p>

      <div className="mt-8">
        <ClientOnly
          fallback={
            <div className="flex h-[65vh] items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
              Loading map…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-[65vh] items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <IncidentMap />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Search Reports
        </h2>
        <div className="mt-6">
          <IncidentSearch />
        </div>
      </div>
    </div>
  );
}
