import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@core/api";
import { renderWithQueryClient } from "@test/query-wrapper";
import { WeekDetailPage } from "./WeekDetailPage.js";

import type { Week } from "./weeks.schema.js";

vi.mock("@core/api", () => ({
  api: {
    getCohortWeek: vi.fn(),
    getAssignmentSubmissions: vi.fn(),
  },
}));

describe("WeekDetailPage", () => {
  const sampleWeek: Week = {
    weekNumber: 1,
    title: "Navigate the codebase and trace system boundaries",
    tagline: "Find boundaries before changing code",
    concept: "Architecture and modularity",
    guidingQuestion: "How does a request travel without breaking boundaries?",
    startDate: "2026-10-01",
    endDate: "2026-10-07",
    isCurrent: true,
    status: "active",
    isLocked: false,
    cohort: {
      id: "cohort-1",
      slug: "cohort-01",
      name: "Cohort 01",
      currentWeekNumber: 3,
      startsOn: "2026-10-01",
      endsOn: "2026-11-26",
    },
    bigIdea: "Trace a complete vertical slice through the architecture.",
    outcomes: [
      "Trace a request from HTTP entry to module",
      "Map Nest modules to domain rows",
    ],
    coreConcepts: ["Separation of concerns", "Dependency injection"],
    appliedThroughTheStack: [
      { layer: "React", details: "Feature folders and state hooks" },
      { layer: "NestJS", details: "Controllers, modules, and providers" },
    ],
    assignment: {
      id: "assignment-1",
      title: "Navigate the codebase and open a focused PR",
      summary: "Understand boundaries and open PR",
      status: "published",
      labels: ["frontend", "backend", "review"],
      detailsMd: "### Deliverables\n- Open PR on GitHub",
    },
    resources: {
      required: [
        {
          title: "ARCHITECTURE.md",
          url: "https://github.com",
          layers: "Full Stack",
          format: "Read",
          time: "15 min",
          why: "Explains architecture",
        },
      ],
      assignment: [],
      alternative: [],
    },
    reflectionQuestion: "Which boundary would you be most likely to break, and why?",
    prerequisites: ["Node 22", "Corepack/Yarn"],
  };

  beforeEach(() => {
    vi.mocked(api.getCohortWeek).mockReset();
    vi.mocked(api.getAssignmentSubmissions).mockReset();
    vi.mocked(api.getAssignmentSubmissions).mockResolvedValue({
      assignmentId: "assignment-1",
      weekNumber: 1,
      submissions: [
        {
          id: "submission-1",
          assignmentId: "assignment-1",
          weekNumber: 1,
          productRepositoryId: "repo-1",
          githubOwner: "El-warsha",
          githubRepo: "elwarsha-api",
          status: "draft",
          prUrl: null,
          pullRequest: null,
          updatedAt: "2026-11-07T11:00:00.000Z",
        },
      ],
    });
  });

  it("renders week details, guiding question, big idea, concepts, stack, and resources", async () => {
    vi.mocked(api.getCohortWeek).mockResolvedValue(sampleWeek);

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/en/portal/cohorts/cohort-01/weeks/1"]}>
        <Routes>
          <Route
            path="/:locale/portal/cohorts/:cohortSlug/weeks/:weekNumber"
            element={<WeekDetailPage locale="en" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Navigate the codebase and trace system boundaries",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/How does a request travel/)).toBeInTheDocument();
    expect(screen.getByText(/Trace a complete vertical slice/)).toBeInTheDocument();
    expect(
      screen.getByText("Trace a request from HTTP entry to module"),
    ).toBeInTheDocument();
    expect(screen.getByText("Separation of concerns")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("ARCHITECTURE.md ↗")).toBeInTheDocument();
    expect(
      screen.getByText(/Which boundary would you be most likely to break/),
    ).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: /Back to Cohort Weeks/i });
    expect(backLink).toHaveAttribute("href", "/en/portal/cohorts/cohort-01/weeks");

    const nextWeekLink = screen.getByRole("link", { name: /Next Week \(2\)/i });
    expect(nextWeekLink).toHaveAttribute("href", "/en/portal/cohorts/cohort-01/weeks/2");
    expect(nextWeekLink).toHaveTextContent("→");
  });

  it("renders markdown formatting inside bigIdea correctly", async () => {
    vi.mocked(api.getCohortWeek).mockResolvedValue({
      ...sampleWeek,
      bigIdea:
        "This is **important idea** with `code token`.\n\n1. First point\n2. Second point",
    });

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/en/portal/cohorts/cohort-01/weeks/1"]}>
        <Routes>
          <Route
            path="/:locale/portal/cohorts/:cohortSlug/weeks/:weekNumber"
            element={<WeekDetailPage locale="en" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const boldText = await screen.findByText("important idea");
    expect(boldText.tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("code token").tagName.toLowerCase()).toBe("code");
    expect(screen.getByText("First point")).toBeInTheDocument();
  });

  it("renders not found state when week query fails", async () => {
    vi.mocked(api.getCohortWeek).mockRejectedValue(new Error("Week not found"));

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/en/portal/cohorts/cohort-01/weeks/99"]}>
        <Routes>
          <Route
            path="/:locale/portal/cohorts/:cohortSlug/weeks/:weekNumber"
            element={<WeekDetailPage locale="en" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Week Not Found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The requested week could not be found for this cohort."),
    ).toBeInTheDocument();
  });

  it("renders locked state panel when week is upcoming", async () => {
    vi.mocked(api.getCohortWeek).mockResolvedValue({
      ...sampleWeek,
      weekNumber: 4,
      isCurrent: false,
      status: "upcoming" as const,
      isLocked: true,
      assignment: null,
      outcomes: [],
      coreConcepts: [],
      appliedThroughTheStack: [],
      resources: { required: [], assignment: [], alternative: [] },
    });

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/en/portal/cohorts/cohort-01/weeks/4"]}>
        <Routes>
          <Route
            path="/:locale/portal/cohorts/:cohortSlug/weeks/:weekNumber"
            element={<WeekDetailPage locale="en" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Navigate the codebase and trace system boundaries",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/This week is currently locked/)).toBeInTheDocument();
    expect(screen.getByText(/This week unlocks on 2026-10-01/)).toBeInTheDocument();
    expect(screen.queryByText("ARCHITECTURE.md ↗")).not.toBeInTheDocument();
  });
});
