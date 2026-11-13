import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@core/api";
import type { AssignmentSubmissionsResponse, RepositorySubmissionItem } from "@core/api";
import { renderWithQueryClient } from "@test/query-wrapper";

import { SubmissionStatusCard } from "./SubmissionStatusCard.js";

vi.mock("@core/api", () => ({
  api: {
    getAssignmentSubmissions: vi.fn(),
  },
}));

function repository(
  overrides: Partial<RepositorySubmissionItem> = {},
): RepositorySubmissionItem {
  return {
    id: "submission-1",
    assignmentId: "assignment-6",
    weekNumber: 6,
    productRepositoryId: "repo-1",
    githubOwner: "El-warsha",
    githubRepo: "elwarsha-api",
    status: "draft",
    prUrl: null,
    pullRequest: null,
    updatedAt: "2026-11-07T11:00:00.000Z",
    ...overrides,
  };
}

function response(
  submissions: RepositorySubmissionItem[],
): AssignmentSubmissionsResponse {
  return {
    assignmentId: "assignment-6",
    weekNumber: 6,
    submissions,
  };
}

describe("SubmissionStatusCard", () => {
  beforeEach(() => {
    vi.mocked(api.getAssignmentSubmissions).mockReset();
  });

  it("renders a draft card for every repository with PR title instructions", () => {
    render(
      <SubmissionStatusCard
        locale="en"
        weekNumber={6}
        data={response([
          repository(),
          repository({
            id: "submission-2",
            productRepositoryId: "repo-2",
            githubRepo: "elwarsha-web",
          }),
        ])}
        onRefresh={vi.fn()}
      />,
    );

    const region = screen.getByRole("region", {
      name: "Submission Status & GitHub Tracking",
    });
    expect(region).toHaveAttribute("aria-live", "polite");

    expect(screen.getByRole("link", { name: /elwarsha-api/ })).toHaveAttribute(
      "href",
      "https://github.com/El-warsha/elwarsha-api",
    );
    expect(screen.getByRole("link", { name: /elwarsha-web/ })).toHaveAttribute(
      "href",
      "https://github.com/El-warsha/elwarsha-web",
    );
    expect(screen.getAllByText("Draft")).toHaveLength(2);
    expect(screen.getAllByText(/\[week-06\]/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^#\d+$/)).not.toBeInTheDocument();
  });

  it("renders an in-review badge, PR number, and GitHub link", () => {
    render(
      <SubmissionStatusCard
        locale="en"
        weekNumber={6}
        data={response([
          repository({
            status: "in_review",
            prUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
            pullRequest: {
              number: 42,
              state: "open",
              htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
            },
          }),
        ])}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("● In Review")).toBeInTheDocument();
    const prLink = screen.getByRole("link", {
      name: "View Pull Request on GitHub #42",
    });
    expect(prLink).toHaveTextContent("#42");
    expect(prLink).toHaveAttribute(
      "href",
      "https://github.com/El-warsha/elwarsha-api/pull/42",
    );
    expect(prLink).toHaveAttribute("target", "_blank");
    expect(prLink).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("renders a merged badge and PR link", () => {
    render(
      <SubmissionStatusCard
        locale="en"
        weekNumber={6}
        data={response([
          repository({
            status: "merged",
            prUrl: "https://github.com/El-warsha/elwarsha-web/pull/43",
            githubRepo: "elwarsha-web",
            pullRequest: {
              number: 43,
              state: "merged",
              htmlUrl: "https://github.com/El-warsha/elwarsha-web/pull/43",
            },
          }),
        ])}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("✓ Merged")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /#43/ })).toHaveAttribute(
      "href",
      "https://github.com/El-warsha/elwarsha-web/pull/43",
    );
  });

  it("renders loading and error states", () => {
    const { rerender } = render(
      <SubmissionStatusCard locale="en" weekNumber={6} isLoading />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Preparing the workshop");

    rerender(<SubmissionStatusCard locale="en" weekNumber={6} isError />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not sync submission status from GitHub",
    );
  });

  it("triggers a manual refresh when the refresh button is clicked", async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();

    render(
      <SubmissionStatusCard
        locale="en"
        weekNumber={6}
        data={response([repository()])}
        onRefresh={onRefresh}
      />,
    );

    await user.click(screen.getByRole("button", { name: "↻ Refresh from GitHub" }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("fetches submissions by cohort and refetches from GitHub on click", async () => {
    vi.mocked(api.getAssignmentSubmissions).mockResolvedValue(response([repository()]));
    const user = userEvent.setup();

    renderWithQueryClient(
      <SubmissionStatusCard locale="en" cohortSlug="cohort-01" weekNumber={6} />,
    );

    expect(await screen.findByText("Draft")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "↻ Refresh from GitHub" }));

    await waitFor(() => {
      expect(api.getAssignmentSubmissions).toHaveBeenCalledTimes(2);
    });
  });
});
