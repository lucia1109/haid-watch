'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Option = { id: number; name: string };

export type LocationValue = {
  state_id: number | null;
  lga_id: number | null;
  ward_id: number | null;
  polling_unit_id: number | null;
};

const EMPTY_VALUE: LocationValue = {
  state_id: null,
  lga_id: null,
  ward_id: null,
  polling_unit_id: null,
};

export default function LocationPicker({ onChange }: { onChange: (value: LocationValue) => void }) {
  const [states, setStates] = useState<Option[]>([]);
  const [lgas, setLgas] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [pollingUnits, setPollingUnits] = useState<Option[]>([]);
  const [value, setValue] = useState<LocationValue>(EMPTY_VALUE);

  useEffect(() => {
    async function loadStates() {
      const { data, error } = await supabase.from('states').select('id, name').order('name');
      if (!error && data) setStates(data as Option[]);
    }
    loadStates();
  }, []);

  useEffect(() => {
    async function loadLgas() {
      if (!value.state_id) {
        setLgas([]);
        return;
      }
      const { data, error } = await supabase
        .from('lgas')
        .select('id, name')
        .eq('state_id', value.state_id)
        .order('name');
      if (!error && data) setLgas(data as Option[]);
    }
    loadLgas();
  }, [value.state_id]);

  useEffect(() => {
    async function loadWards() {
      if (!value.lga_id) {
        setWards([]);
        return;
      }
      const { data, error } = await supabase
        .from('wards')
        .select('id, name')
        .eq('lga_id', value.lga_id)
        .order('name');
      if (!error && data) setWards(data as Option[]);
    }
    loadWards();
  }, [value.lga_id]);

  useEffect(() => {
    async function loadPollingUnits() {
      if (!value.ward_id) {
        setPollingUnits([]);
        return;
      }
      const { data, error } = await supabase
        .from('polling_units')
        .select('id, name')
        .eq('ward_id', value.ward_id)
        .order('name');
      if (!error && data) setPollingUnits(data as Option[]);
    }
    loadPollingUnits();
  }, [value.ward_id]);

  function update(next: Partial<LocationValue>) {
    const merged = { ...value, ...next };
    setValue(merged);
    onChange(merged);
  }

  function toId(raw: string): number | null {
    return raw ? Number(raw) : null;
  }

  return (
    <div className="location-picker">
      <label>
        State
        <select
          value={value.state_id ?? ''}
          onChange={(e) => update({ state_id: toId(e.target.value), lga_id: null, ward_id: null, polling_unit_id: null })}
        >
          <option value="">Select state…</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label>
        LGA
        <select
          value={value.lga_id ?? ''}
          disabled={!value.state_id}
          onChange={(e) => update({ lga_id: toId(e.target.value), ward_id: null, polling_unit_id: null })}
        >
          <option value="">Select LGA…</option>
          {lgas.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      <label>
        Ward
        <select
          value={value.ward_id ?? ''}
          disabled={!value.lga_id}
          onChange={(e) => update({ ward_id: toId(e.target.value), polling_unit_id: null })}
        >
          <option value="">Select ward…</option>
          {wards.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </label>

      <label>
        Polling Unit
        <select
          value={value.polling_unit_id ?? ''}
          disabled={!value.ward_id}
          onChange={(e) => update({ polling_unit_id: toId(e.target.value) })}
        >
          <option value="">Select polling unit…</option>
          {pollingUnits.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <p className="muted">
        Pick as far down as you know — state is enough, polling unit is optional.
      </p>
    </div>
  );
}
