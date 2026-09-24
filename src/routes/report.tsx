import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import { LocationPicker, EMPTY_LOCATION, type LocationValue } from "@/components/LocationPicker";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Incident — HAID Watch" },
      {
        name: "description",
        content:
          "Submit an incident report for review. You may report anonymously; published reports appear on the public map.",
      },
      { property: "og:title", content: "Report an Incident — HAID Watch" },
      {
        property: "og:description",
        content:
          "Submit an incident report for review. You may report anonymously; published reports appear on the public map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

const inputClass =
  "w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

const labelClass = "flex flex-col gap-1.5";
const labelTextClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

function ReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.value ?? "other");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "error">("idle");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeoStatus("idle");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    // Generated up front so it can be used as the storage path prefix and the
    // incident_media foreign key before the incidents row exists.
    const incidentId = crypto.randomUUID();
    const mediaRows: { incident_id: string; storage_path: string; media_type: "photo" }[] = [];

    for (const file of files) {
      const path = `${incidentId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("incident-media")
        .upload(path, file);

      if (uploadError) {
        console.error(uploadError);
        setStatus("error");
        return;
      }

      mediaRows.push({ incident_id: incidentId, storage_path: path, media_type: "photo" });
    }

    const { error } = await supabase.from("incidents").insert({
      id: incidentId,
      title,
      description,
      category,
      is_anonymous: isAnonymous,
      reporter_contact: isAnonymous ? null : contact,
      status: "pending_review",
      ...location,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }

    if (mediaRows.length > 0) {
      const { error: mediaError } = await supabase.from("incident_media").insert(mediaRows);
      if (mediaError) {
        console.error(mediaError);
        setStatus("error");
        return;
      }
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Report received
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Thank you
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Your report has been submitted and will appear on the public map once
          reviewed by our moderators.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/map"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View Public Map
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20 animate-fade-up">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Incident Report
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Report an Incident
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your report will be reviewed before appearing publicly. You may report
        anonymously.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-7">
        <label className={labelClass}>
          <span className={labelTextClass}>Title</span>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            placeholder="A short, factual summary"
          />
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Category</span>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Description</span>
          <textarea
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            maxLength={2000}
            placeholder="What happened, when, and who was involved. Stick to what you saw."
          />
        </label>

        <div className="rule pt-7">
          <h2 className="font-display text-lg font-semibold">Location</h2>
          <div className="mt-4">
            <LocationPicker onChange={setLocation} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={geoStatus === "locating"}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {geoStatus === "locating" ? "Locating…" : "Use My Current Location"}
            </button>
            {coords && (
              <span className="text-xs text-muted-foreground">
                Location captured ({coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)})
              </span>
            )}
            {geoStatus === "error" && (
              <span className="text-xs text-destructive">
                Couldn’t get your location. You can still submit without it.
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Optional — pins your report on the public map. Only works if you’re
            reporting from the scene.
          </p>
        </div>

        <div className="rule pt-7">
          <label className={labelClass}>
            <span className={labelTextClass}>Photos (optional)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-secondary"
            />
          </label>
          {files.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {files.length} photo{files.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <div className="rule flex flex-col gap-5 pt-7">
          <label className="flex items-center gap-2.5 text-sm font-medium">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Submit anonymously
          </label>

          {!isAnonymous && (
            <label className={labelClass}>
              <span className={labelTextClass}>Contact (optional, never shown publicly)</span>
              <input
                className={inputClass}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or email"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-(--shadow-card) transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit Report"}
        </button>

        {status === "error" && (
          <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
