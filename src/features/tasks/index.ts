import type { RouteDescriptor } from "@core/navigation/types";

import { TasksPage } from "./TasksPage.js";

export const assignmentsRoute: RouteDescriptor = {
  id: "assignments",
  path: "portal/assignments",
  public: false,
  capability: "assignments.read",
  element: TasksPage,
};

export {
  SubmissionStatusCard,
  type SubmissionStatusCardProps,
} from "./SubmissionStatusCard.js";
export { useAssignmentSubmissions } from "./useSubmission.js";
