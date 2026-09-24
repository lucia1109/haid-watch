import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { formatLocation, type LocationNames } from "@/lib/incidents";

type PublishedIncident = LocationNames & {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
};

export function IncidentSearch() {
  const [incidents, setIncidents] = useState<PublishedIncident[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("incidents")
      .select(
        "id, title, description, category, created_at, states (name), lgas (name), wards (name), polling_units (name)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setIncidents(data as unknown as PublishedIncident[]);
        setLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((incident) => {
      const matchesQuery =
        q === "" ||
        incident.title.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        formatLocation(incident).toLowerCase().includes(q);
      const matchesCategory = category === "" || incident.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [incidents, query, category]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by keyword or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-52 flex-1 rounded-md border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading reports…</p>
      ) : results.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No published reports match your search.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {results.map((incident) => (
            <li
              key={incident.id}
              className="rounded-lg border border-border bg-card p-5 shadow-(--shadow-card) transition-shadow hover:shadow-(--shadow-lifted)"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                {categoryLabel(incident.category)}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold leading-snug">
                {incident.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {incident.description}
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                {formatLocation(incident)} ·{" "}
                {new Date(incident.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
