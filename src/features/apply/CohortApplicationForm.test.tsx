import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, ElWarshaApiError } from "@core/api";
import { CohortApplicationForm } from "./CohortApplicationForm.js";

vi.mock("@core/api", () => {
  class MockElWarshaApiError extends Error {
    constructor(
      readonly status: number,
      readonly body: {
        detail?: string;
        invalidParams?: Array<{ name: string; reason: string }>;
      } | null,
    ) {
      super(body?.detail ?? "Mock error");
    }
  }

  return {
    api: {
      applyCohort: vi.fn(),
    },
    ElWarshaApiError: MockElWarshaApiError,
  };
});

describe("CohortApplicationForm", () => {
  beforeEach(() => {
    vi.mocked(api.applyCohort).mockReset();
  });

  it("renders all four sections and the submit button", () => {
    render(<CohortApplicationForm locale="en" />);

    expect(
      screen.getByRole("group", { name: /Personal & Contact Information/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Academic & Technical Background/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Personal Page Task/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Motivation & Commitment/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Submit Application/i }),
    ).toBeInTheDocument();
  });

  it("displays structured validation errors (422) below problematic inputs", async () => {
    const user = userEvent.setup();
    const error422 = new ElWarshaApiError(422, {
      type: "https://elwarsha.dev/errors/validation-failed",
      title: "Validation Failed",
      status: 422,
      detail: "Validation failed",
      invalidParams: [
        { name: "email", reason: "Must be a valid email address" },
        { name: "motivation", reason: "Motivation must be at least 50 characters" },
      ],
    });

    vi.mocked(api.applyCohort).mockRejectedValueOnce(error422);

    render(<CohortApplicationForm locale="en" />);

    await user.click(screen.getByRole("button", { name: /Submit Application/i }));

    expect(await screen.findByText("Must be a valid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Motivation must be at least 50 characters"),
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAccessibleDescription(/valid email/i);
  });

  it("displays duplicate submission conflict (409) in a global alert", async () => {
    const user = userEvent.setup();
    const error409 = new ElWarshaApiError(409, {
      type: "https://elwarsha.dev/errors/duplicate-application",
      status: 409,
      detail:
        "An application with this email or GitHub handle already exists for cohort-2",
    });

    vi.mocked(api.applyCohort).mockRejectedValueOnce(error409);

    render(<CohortApplicationForm locale="en" />);

    await user.click(screen.getByRole("button", { name: /Submit Application/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("displays a confirmation receipt card upon 201 Created", async () => {
    const user = userEvent.setup();
    vi.mocked(api.applyCohort).mockResolvedValueOnce({
      id: "app_7b2f1e9a",
      cohortSlug: "cohort-2",
      email: "sara@example.com",
      status: "received",
      createdAt: new Date().toISOString(),
    });

    render(<CohortApplicationForm locale="en" />);

    await user.type(screen.getByLabelText(/Full Name/i), "Sara Mahmoud");
    await user.type(screen.getByLabelText(/Email Address/i), "sara@example.com");

    await user.click(screen.getByRole("button", { name: /Submit Application/i }));

    expect(
      await screen.findByRole("heading", { name: /Application Received/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("app_7b2f1e9a")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Submit Application/i }),
    ).not.toBeInTheDocument();
  });
});
