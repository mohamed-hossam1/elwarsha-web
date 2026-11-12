import { createElWarshaClient } from "@elwarsha/api-client";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
if (!baseUrl && import.meta.env.PROD) {
  throw new Error("VITE_API_BASE_URL is required in production");
}

export const api = createElWarshaClient({
  baseUrl: baseUrl ?? "http://localhost:3001",
});
export { ElWarshaApiError } from "@elwarsha/api-client";
export type {
  ApplyCohortInput,
  CohortApplicationResponse,
  ApiError,
  AssignmentSubmissionResponse,
  AssignmentSubmissionsResponse,
  RepositorySubmissionItem,
  SubmissionStatus,
  PullRequestSummary,
} from "@elwarsha/api-client";
