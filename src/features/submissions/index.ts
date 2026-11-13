import type { RouteDescriptor } from "@core/navigation/types";

import { SubmissionsPage } from "./SubmissionsPage.js";

export const submissionsRoute: RouteDescriptor = {
  id: "submissions",
  path: "portal/submissions",
  public: false,
  capability: "submissions.read",
  element: SubmissionsPage,
};

export {
  SubmissionStatusCard,
  type SubmissionStatusCardProps,
} from "./SubmissionStatusCard.js";
export { SubmissionStatusSection } from "./SubmissionStatusSection.js";
export { useAssignmentSubmissions } from "./useSubmission.js";
