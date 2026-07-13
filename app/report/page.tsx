'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { value: 'election_incident', label: 'Election Incident' },
  { value: 'security_concern', label: 'Security Concern' },
  { value: 'community_disturbance', label: 'Community Disturbance' },
  { value: 'voter_intimidation', label: 'Voter Intimidation' },
  { value: 'public_safety', label: 'Public Safety Observation' },
];

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');

    const { error } = await supabase.from('incidents').insert({
      title,
      description,
      category,
      is_anonymous: isAnonymous,
      reporter_contact: isAnonymous ? null : contact,
      status: 'pending_review',
    });

    if (error) {
      console.error(error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setTitle('');
    setDescription('');
    setContact('');
  }

  if (status === 'success') {
    return (
      <section className="form-page">
        <h1>Thank you</h1>
        <p>
          Your report has been submitted and will appear on the public map once reviewed.
          Location tagging (State / LGA / Ward / Polling Unit) and media uploads are being
          added in the next iteration of this form.
        </p>
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>Report an Incident</h1>
      <p className="muted">
        Your report will be reviewed before appearing publicly. You may report anonymously.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            maxLength={2000}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Submit anonymously
        </label>

        {!isAnonymous && (
          <label>
            Contact (optional, never shown publicly)
            <input value={contact} onChange={(e) => setContact(e.target.value)} />
          </label>
        )}

        <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : 'Submit Report'}
        </button>

        {status === 'error' && <p className="error">Something went wrong. Please try again.</p>}
      </form>
    </section>
  );
}
