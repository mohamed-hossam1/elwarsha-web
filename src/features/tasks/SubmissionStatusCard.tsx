import {
  SubmissionStatusCardView,
  type SubmissionStatusCardProps,
} from "@ui/components/SubmissionStatusCard/SubmissionStatusCard";

import { useAssignmentSubmissions } from "./useSubmission.js";

export type { SubmissionStatusCardProps };

export function SubmissionStatusCard(props: SubmissionStatusCardProps) {
  if (props.cohortSlug && !props.data && !props.response && !props.submissions) {
    return <SubmissionStatusCardFetcher {...props} />;
  }

  return <SubmissionStatusCardView {...props} />;
}

function SubmissionStatusCardFetcher(props: SubmissionStatusCardProps) {
  const query = useAssignmentSubmissions(props.cohortSlug, props.weekNumber);

  return (
    <SubmissionStatusCardView
      {...props}
      data={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      refetch={() => {
        void query.refetch();
      }}
    />
  );
}
