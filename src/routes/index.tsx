import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HAID Watch — See it. Report it. Keep your community informed." },
      {
        name: "description",
        content:
          "Document and share incidents in your community, particularly during election periods — transparently, and without political bias.",
      },
      {
        property: "og:title",
        content: "HAID Watch — Community Transparency & Incident Reporting",
      },
      {
        property: "og:description",
        content:
          "Document and share incidents in your community, particularly during election periods — transparently, and without political bias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const PRINCIPLES = [
  {
    title: "Report what you see",
    body: "Submit an incident in minutes — with a location, photos, and the option to stay anonymous. Every report is reviewed before publication.",
  },
  {
    title: "Moderated before it spreads",
    body: "Trained moderators verify each submission. Only reviewed, published reports appear on the public map — no rumor mill.",
  },
  {
    title: "Open to everyone",
    body: "The public map and searchable archive keep communities, journalists, and observers informed with the same facts.",
  },
];

function HomePage() {
  return (
    <div className="animate-fade-up">
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Community Transparency & Election Incident Reporting
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            See it. Report it. Keep your community informed.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            HAID Watch lets citizens document and share incidents in their
            communities, particularly during election periods — transparently,
            and without political bias.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/report"
              className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-(--shadow-card) transition-colors hover:bg-primary/90"
            >
              Report an Incident
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              View Public Map
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="bg-card p-7">
              <p className="font-display text-sm font-semibold text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            What you can report
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <li
                key={c.value}
                className="rounded-md border border-border bg-card px-5 py-4 text-sm font-medium shadow-(--shadow-card)"
              >
                {c.label}
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Link
              to="/report"
              className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Submit a Report
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
