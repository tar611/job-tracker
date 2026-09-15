const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ApplicationStatus = "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  source: string | null; // link to the posting, or where you found it
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

// Thin fetch wrapper: attaches the JWT and normalizes error responses.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  signup: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getApplications: () => request<Application[]>("/api/applications"),

  createApplication: (data: Partial<Application>) =>
    request<Application>("/api/applications", { method: "POST", body: JSON.stringify(data) }),

  updateApplication: (id: string, data: Partial<Application>) =>
    request<Application>(`/api/applications/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteApplication: (id: string) => request<void>(`/api/applications/${id}`, { method: "DELETE" }),
};
