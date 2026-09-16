import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationForm } from "../ApplicationForm";
import type { Application } from "../../lib/api";

const existing: Application = {
  id: "1",
  company: "Acme",
  role: "Software Engineer",
  status: "OFFER",
  appliedDate: "2024-01-01",
  source: "https://example.com/job",
  note: "Referral",
  notes: "Great conversation",
  createdAt: "",
  updatedAt: "",
};

describe("ApplicationForm", () => {
  it("submits the entered fields via onSave", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ApplicationForm initial={null} onSave={onSave} onClose={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Company"), "Acme");
    await user.type(screen.getByPlaceholderText("Role"), "Software Engineer");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ company: "Acme", role: "Software Engineer", status: "APPLIED" }),
    );
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ApplicationForm initial={null} onSave={vi.fn()} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("pre-fills fields when editing an existing application", () => {
    render(<ApplicationForm initial={existing} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText("Edit Application")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Referral")).toBeInTheDocument();
  });

  // Regression test for a real bug: a failed save used to leave the button
  // stuck on "Saving…" forever with no explanation (fixed by catching the
  // error in ApplicationForm's handleSubmit).
  it("shows an error message instead of hanging when saving fails", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<ApplicationForm initial={null} onSave={onSave} onClose={vi.fn()} />);
    await user.type(screen.getByPlaceholderText("Company"), "Acme");
    await user.type(screen.getByPlaceholderText("Role"), "SWE");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Network error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
  });
});
