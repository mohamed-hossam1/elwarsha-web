import { useQuery } from "@tanstack/react-query";

import { api } from "@core/api";
import {
  assignmentSubmissionsSchema,
  type AssignmentSubmissions,
} from "./submissions.schema.js";

export function useAssignmentSubmissions(
  cohortSlug: string | undefined,
  weekNumber: number | undefined,
  options?: { enabled?: boolean },
) {
  const query = useQuery<AssignmentSubmissions>({
    queryKey: [
      "cohorts",
      cohortSlug ?? "unknown",
      "assignments",
      weekNumber ?? 0,
      "submissions",
    ],
    queryFn: async () => {
      const data = await api.getAssignmentSubmissions(
        cohortSlug as string,
        weekNumber as number,
      );
      return assignmentSubmissionsSchema.parse(data);
    },
    staleTime: 60_000,
    enabled:
      Boolean(cohortSlug) &&
      Number.isInteger(weekNumber) &&
      (weekNumber ?? 0) > 0 &&
      (options?.enabled ?? true),
  });

  return {
    ...query,
    submissions: query.data?.submissions ?? [],
  };
}
