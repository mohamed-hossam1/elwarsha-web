import type { Assignment, Engagement, Product } from "@elwarsha/api-client";

export const productFixture: Product = {
  id: "product-1",
  slug: "elwarsha-web",
  name: "ElWarsha Web",
  status: "active",
  repositories: [
    { githubOwner: "elwarsha", githubRepo: "elwarsha-api" },
    { githubOwner: "elwarsha", githubRepo: "elwarsha-web" },
  ],
  repository: { githubOwner: "elwarsha", githubRepo: "elwarsha-web" },
};

export const engagementFixture: Engagement = {
  id: "engagement-1",
  status: "active",
  cohort: {
    id: "cohort-1",
    slug: "cohort-01",
    name: "Cohort 01",
    startsOn: "2026-10-01",
    endsOn: "2026-11-26",
  },
  product: productFixture,
};

export const assignmentFixture: Assignment = {
  id: "assignment-1",
  weekNumber: 1,
  title: "Navigate the codebase and open a focused PR",
  status: "published",
  engagementId: "engagement-1",
};
