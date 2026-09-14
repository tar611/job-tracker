import { useState } from "react";
import type { FormEvent } from "react";
import type { Application, ApplicationStatus } from "../lib/api";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
];

interface Props {
  initial: Application | null; // null = creating, otherwise editing this one
  onSave: (data: Partial<Application>) => Promise<void>;
  onClose: () => void;
}

// Modal form shared by "Add Application" and "Edit" — same fields either way.
export function ApplicationForm({ initial, onSave, onClose }: Props) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(initial?.status ?? "APPLIED");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ company, role, status, notes });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Application" : "New Application"}</h2>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role"
          required
          className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="w-full rounded border border-slate-300 px-3 py-2"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <textarea
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={3}
          className="w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
