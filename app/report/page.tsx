'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LocationPicker, { LocationValue } from '@/components/LocationPicker';
import { CATEGORIES } from '@/lib/categories';

const EMPTY_LOCATION: LocationValue = {
  state_id: null,
  lga_id: null,
  ward_id: null,
  polling_unit_id: null,
};

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeoStatus('idle');
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');

    // Generated up front so it can be used as the storage path prefix and the
    // incident_media foreign key before the incidents row exists.
    const incidentId = crypto.randomUUID();
    const mediaRows: { incident_id: string; storage_path: string; media_type: 'photo' }[] = [];

    for (const file of files) {
      const path = `${incidentId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from('incident-media')
        .upload(path, file);

      if (uploadError) {
        console.error(uploadError);
        setStatus('error');
        return;
      }

      mediaRows.push({ incident_id: incidentId, storage_path: path, media_type: 'photo' });
    }

    const { error } = await supabase.from('incidents').insert({
      id: incidentId,
      title,
      description,
      category,
      is_anonymous: isAnonymous,
      reporter_contact: isAnonymous ? null : contact,
      status: 'pending_review',
      ...location,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });

    if (error) {
      console.error(error);
      setStatus('error');
      return;
    }

    if (mediaRows.length > 0) {
      const { error: mediaError } = await supabase.from('incident_media').insert(mediaRows);
      if (mediaError) {
        console.error(mediaError);
        setStatus('error');
        return;
      }
    }

    setStatus('success');
    setTitle('');
    setDescription('');
    setContact('');
    setLocation(EMPTY_LOCATION);
    setCoords(null);
    setGeoStatus('idle');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (status === 'success') {
    return (
      <section className="form-page">
        <h1>Thank you</h1>
        <p>
          Your report has been submitted and will appear on the public map once reviewed.
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

        <LocationPicker onChange={setLocation} />

        <div className="geolocation-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleUseLocation}
            disabled={geoStatus === 'locating'}
          >
            {geoStatus === 'locating' ? 'Locating…' : 'Use My Current Location'}
          </button>
          {coords && (
            <span className="muted">
              Location captured ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)})
            </span>
          )}
          {geoStatus === 'error' && (
            <span className="error">Couldn&rsquo;t get your location. You can still submit without it.</span>
          )}
        </div>
        <p className="muted">
          Optional — pins your report on the public map. Only works if you&rsquo;re reporting from the scene.
        </p>

        <label>
          Photos (optional)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {files.length > 0 && (
          <p className="muted">{files.length} photo{files.length > 1 ? 's' : ''} selected</p>
        )}

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
