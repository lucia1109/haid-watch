'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, categoryLabel } from '@/lib/categories';
import { formatLocation } from '@/lib/format-location';

type PublishedIncident = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  states: { name: string } | null;
  lgas: { name: string } | null;
  wards: { name: string } | null;
  polling_units: { name: string } | null;
};

export default function IncidentSearch() {
  const [incidents, setIncidents] = useState<PublishedIncident[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublished() {
      const { data, error } = await supabase
        .from('incidents')
        .select(
          'id, title, description, category, created_at, states (name), lgas (name), wards (name), polling_units (name)'
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) setIncidents(data as unknown as PublishedIncident[]);
      setLoading(false);
    }
    loadPublished();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return incidents.filter((incident) => {
      const matchesQuery =
        q === '' ||
        incident.title.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        formatLocation(incident).toLowerCase().includes(q);
      const matchesCategory = category === '' || incident.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [incidents, query, category]);

  return (
    <div className="incident-search">
      <div className="incident-search-controls">
        <input
          type="search"
          placeholder="Search by keyword or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading reports…</p>
      ) : results.length === 0 ? (
        <p className="muted">No published reports match your search.</p>
      ) : (
        <ul className="incident-search-results">
          {results.map((incident) => (
            <li key={incident.id}>
              <h3>{incident.title}</h3>
              <p className="report-card-description">{incident.description}</p>
              <p className="muted">
                {categoryLabel(incident.category)} · {formatLocation(incident)} ·{' '}
                {new Date(incident.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
