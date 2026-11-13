import { useAssignmentSubmissions } from "@core/submissions/useAssignmentSubmissions";
import type { Locale } from "@core/i18n";

import { SubmissionStatusCard } from "./SubmissionStatusCard.js";

export function SubmissionStatusSection({
  cohortSlug,
  weekNumber,
  locale,
}: {
  cohortSlug: string;
  weekNumber: number;
  locale: Locale;
}) {
  const { data, isLoading, isError, refetch } = useAssignmentSubmissions(
    cohortSlug,
    weekNumber,
  );

  return (
    <SubmissionStatusCard
      locale={locale}
      weekNumber={weekNumber}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRefresh={() => {
        void refetch();
      }}
    />
  );
}
