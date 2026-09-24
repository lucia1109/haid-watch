import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Option = { id: number; name: string };

export type LocationValue = {
  state_id: number | null;
  lga_id: number | null;
  ward_id: number | null;
  polling_unit_id: number | null;
};

export const EMPTY_LOCATION: LocationValue = {
  state_id: null,
  lga_id: null,
  ward_id: null,
  polling_unit_id: null,
};

const selectClass =
  "w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function LocationPicker({
  onChange,
}: {
  onChange: (value: LocationValue) => void;
}) {
  const [states, setStates] = useState<Option[]>([]);
  const [lgas, setLgas] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [pollingUnits, setPollingUnits] = useState<Option[]>([]);
  const [value, setValue] = useState<LocationValue>(EMPTY_LOCATION);

  useEffect(() => {
    supabase
      .from("states")
      .select("id, name")
      .order("name")
      .then(({ data, error }) => {
        if (!error && data) setStates(data as Option[]);
      });
  }, []);

  useEffect(() => {
    if (!value.state_id) {
      setLgas([]);
      return;
    }
    supabase
      .from("lgas")
      .select("id, name")
      .eq("state_id", value.state_id)
      .order("name")
      .then(({ data, error }) => {
        if (!error && data) setLgas(data as Option[]);
      });
  }, [value.state_id]);

  useEffect(() => {
    if (!value.lga_id) {
      setWards([]);
      return;
    }
    supabase
      .from("wards")
      .select("id, name")
      .eq("lga_id", value.lga_id)
      .order("name")
      .then(({ data, error }) => {
        if (!error && data) setWards(data as Option[]);
      });
  }, [value.lga_id]);

  useEffect(() => {
    if (!value.ward_id) {
      setPollingUnits([]);
      return;
    }
    supabase
      .from("polling_units")
      .select("id, name")
      .eq("ward_id", value.ward_id)
      .order("name")
      .then(({ data, error }) => {
        if (!error && data) setPollingUnits(data as Option[]);
      });
  }, [value.ward_id]);

  function update(next: Partial<LocationValue>) {
    const merged = { ...value, ...next };
    setValue(merged);
    onChange(merged);
  }

  const toId = (raw: string) => (raw ? Number(raw) : null);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State">
          <select
            className={selectClass}
            value={value.state_id ?? ""}
            onChange={(e) =>
              update({
                state_id: toId(e.target.value),
                lga_id: null,
                ward_id: null,
                polling_unit_id: null,
              })
            }
          >
            <option value="">Select state…</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="LGA">
          <select
            className={selectClass}
            value={value.lga_id ?? ""}
            disabled={!value.state_id}
            onChange={(e) =>
              update({ lga_id: toId(e.target.value), ward_id: null, polling_unit_id: null })
            }
          >
            <option value="">Select LGA…</option>
            {lgas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ward">
          <select
            className={selectClass}
            value={value.ward_id ?? ""}
            disabled={!value.lga_id}
            onChange={(e) => update({ ward_id: toId(e.target.value), polling_unit_id: null })}
          >
            <option value="">Select ward…</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Polling Unit">
          <select
            className={selectClass}
            value={value.polling_unit_id ?? ""}
            disabled={!value.ward_id}
            onChange={(e) => update({ polling_unit_id: toId(e.target.value) })}
          >
            <option value="">Select polling unit…</option>
            {pollingUnits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Pick as far down as you know — state is enough, polling unit is optional.
      </p>
    </div>
  );
}
