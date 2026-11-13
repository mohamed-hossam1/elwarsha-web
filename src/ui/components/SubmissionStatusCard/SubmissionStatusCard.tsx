import type { AssignmentSubmissionsResponse, RepositorySubmissionItem } from "@core/api";
import { messages, type Locale } from "@core/i18n";
import { useAssignmentSubmissions } from "@core/submissions/useAssignmentSubmissions";
import { Button } from "@ui/components/Button/Button";

import styles from "./SubmissionStatusCard.module.css";

export type SubmissionStatusCardProps = {
  locale: Locale;
  cohortSlug?: string;
  weekNumber?: number;
  data?: AssignmentSubmissionsResponse;
  response?: AssignmentSubmissionsResponse;
  submissions?: RepositorySubmissionItem[];
  isLoading?: boolean;
  loading?: boolean;
  isError?: boolean;
  error?: boolean;
  onRefresh?: () => void;
  onRefetch?: () => void;
  refetch?: () => void;
};

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}

function statusBadge(
  status: RepositorySubmissionItem["status"],
  copy: (typeof messages)[Locale],
): { label: string; className: string } {
  if (status === "merged") {
    return {
      label: copy.portal.submissionMergedBadge,
      className: styles.badgeMerged,
    };
  }
  if (status === "in_review") {
    return {
      label: copy.portal.submissionInReviewBadge,
      className: styles.badgeInReview,
    };
  }
  return {
    label: copy.portal.submissionDraftBadge,
    className: styles.badgeDraft,
  };
}

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

export function SubmissionStatusCardView({
  locale,
  weekNumber,
  data,
  response,
  submissions,
  isLoading,
  loading,
  isError,
  error,
  onRefresh,
  onRefetch,
  refetch,
}: SubmissionStatusCardProps) {
  const copy = messages[locale];
  const items = submissions ?? data?.submissions ?? response?.submissions ?? [];
  const targetWeek = weekNumber ?? data?.weekNumber ?? response?.weekNumber ?? 0;
  const weekTag = `[week-${String(targetWeek).padStart(2, "0")}]`;
  const refresh = onRefresh ?? onRefetch ?? refetch;
  const showLoading = isLoading ?? loading ?? false;
  const showError = isError ?? error ?? false;

  return (
    <section
      className={styles.card}
      role="region"
      aria-live="polite"
      aria-label={copy.portal.submissionStatus}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.portal.submissions}</p>
          <h2 className={styles.title}>{copy.portal.submissionStatus}</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => refresh?.()}
          aria-label={copy.portal.submissionRefresh}
        >
          {copy.portal.submissionRefresh}
        </Button>
      </header>

      {showLoading && (
        <p className={styles.state} role="status">
          {copy.portal.loading}
        </p>
      )}

      {showError && !showLoading && (
        <p className={styles.error} role="alert">
          {copy.portal.submissionError}
        </p>
      )}

      {!showLoading && !showError && items.length === 0 && (
        <p className={styles.state}>{copy.portal.submissionEmpty}</p>
      )}

      {!showLoading && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => {
            const badge = statusBadge(item.status, copy);
            const repositoryUrl = `https://github.com/${item.githubOwner}/${item.githubRepo}`;
            const prNumber = item.pullRequest?.number;

            return (
              <li
                key={item.productRepositoryId ?? `${item.githubOwner}/${item.githubRepo}`}
                className={styles.repositoryCard}
              >
                <div className={styles.repositoryHeader}>
                  <a
                    className={styles.repositoryLink}
                    href={repositoryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={interpolate(copy.portal.submissionRepoView, {
                      repo: `${item.githubOwner}/${item.githubRepo}`,
                    })}
                  >
                    <span className={styles.repositoryOwner}>{item.githubOwner}/</span>
                    {item.githubRepo}
                  </a>
                  <span className={`${styles.badge} ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {item.status === "draft" ? (
                  <div className={styles.draft}>
                    <strong>{copy.portal.submissionDraftTitle}</strong>
                    <p>
                      {interpolate(copy.portal.submissionDraftBody, { tag: weekTag })}
                    </p>
                  </div>
                ) : (
                  <div className={styles.review}>
                    <p className={styles.reviewBody}>
                      {item.status === "merged"
                        ? copy.portal.submissionMergedBody
                        : copy.portal.submissionInReviewBody}
                    </p>
                    {item.prUrl && prNumber !== undefined && (
                      <a
                        className={styles.prLink}
                        href={item.prUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`${copy.portal.viewPrOnGithub} #${prNumber}`}
                      >
                        #{prNumber}
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
