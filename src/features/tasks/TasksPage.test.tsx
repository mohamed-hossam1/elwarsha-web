import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@core/api";
import { assignmentFixture } from "@core/catalog/fixtures";
import { renderWithQueryClient } from "@test/query-wrapper";

import { TasksPage } from "./TasksPage.js";

vi.mock("@core/api", () => ({
  api: {
    listAssignments: vi.fn(),
    getAssignmentSubmissions: vi.fn(),
  },
}));

const submissionsFixture = {
  assignmentId: assignmentFixture.id,
  weekNumber: assignmentFixture.weekNumber,
  submissions: [
    {
      id: "submission-1",
      assignmentId: assignmentFixture.id,
      weekNumber: assignmentFixture.weekNumber,
      productRepositoryId: "repo-1",
      githubOwner: "El-warsha",
      githubRepo: "elwarsha-api",
      status: "draft" as const,
      prUrl: null,
      pullRequest: null,
      updatedAt: "2026-11-07T11:00:00.000Z",
    },
  ],
};

describe("TasksPage", () => {
  beforeEach(() => {
    vi.mocked(api.listAssignments).mockReset();
    vi.mocked(api.getAssignmentSubmissions).mockReset();
    vi.mocked(api.getAssignmentSubmissions).mockResolvedValue(submissionsFixture);
  });

  it("renders the assignment returned by the data hook", async () => {
    vi.mocked(api.listAssignments).mockResolvedValue([assignmentFixture]);

    renderWithQueryClient(<TasksPage locale="en" />);

    expect(
      await screen.findByRole("heading", { name: assignmentFixture.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Week 1")).toBeInTheDocument();
    expect(
      await screen.findByRole("region", {
        name: "Submission Status & GitHub Tracking",
      }),
    ).toBeInTheDocument();
  });
});
