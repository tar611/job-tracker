import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "../Dashboard";
import { api } from "../../lib/api";
import type { Application } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    getApplications: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}));

const sample: Application = {
  id: "1",
  company: "Acme",
  role: "Software Engineer",
  status: "APPLIED",
  appliedDate: "2024-01-01",
  source: null,
  note: null,
  notes: null,
  createdAt: "",
  updatedAt: "",
};

describe("Dashboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows an empty state when there are no applications", async () => {
    vi.mocked(api.getApplications).mockResolvedValue([]);
    render(<Dashboard />);
    expect(await screen.findByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("renders a row per application", async () => {
    vi.mocked(api.getApplications).mockResolvedValue([sample]);
    render(<Dashboard />);
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  // Regression test for a real bug: a failed initial load used to fail
  // silently (fixed by catching the error and showing a banner).
  it("shows an error banner if the initial load fails", async () => {
    vi.mocked(api.getApplications).mockRejectedValue(new Error("Backend unreachable"));
    render(<Dashboard />);
    expect(await screen.findByText("Backend unreachable")).toBeInTheDocument();
  });
});
