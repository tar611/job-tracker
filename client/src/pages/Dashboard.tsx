import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Application, ApplicationStatus } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ApplicationForm } from "../components/ApplicationForm";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  async function refresh() {
    setApplications(await api.getApplications());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(app: Application) {
    setEditing(app);
    setShowForm(true);
  }

  async function handleSave(data: Partial<Application>) {
    if (editing) {
      await api.updateApplication(editing.id, data);
    } else {
      await api.createApplication(data);
    }
    setShowForm(false);
    setEditing(null);
    await refresh();
  }

  async function handleStatusChange(app: Application, status: ApplicationStatus) {
    await api.updateApplication(app.id, { status });
    await refresh();
  }

  async function handleDelete(id: string) {
    await api.deleteApplication(id);
    await refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-900">Job Application Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <button onClick={logout} className="text-sm text-slate-500 underline hover:text-slate-700">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex justify-end">
          <button onClick={openCreate} className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700">
            + Add Application
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : applications.length === 0 ? (
          <p className="text-slate-500">No applications yet — add your first one.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Applied</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium text-slate-900">{app.company}</td>
                    <td className="px-4 py-2">{app.role}</td>
                    <td className="px-4 py-2">
                      {/* Quick status change without opening the full edit form */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      <button onClick={() => openEdit(app)} className="mr-3 text-slate-500 hover:text-slate-900">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <ApplicationForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
