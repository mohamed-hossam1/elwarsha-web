import { messages, type Locale } from "@core/i18n";
import { SubmissionStatusSection } from "@ui/components/SubmissionStatusCard/SubmissionStatusSection";
import { PageSection } from "@ui/patterns/PageSection/PageSection";

import { useTasks } from "./useTasks.js";

export function TasksPage({ locale }: { locale: Locale }) {
  const copy = messages[locale];
  const { tasks } = useTasks();
  const task = tasks?.[0];

  return (
    <PageSection
      eyebrow={copy.portal.assignments}
      title={task?.title ?? copy.portal.loading}
    >
      <SubmissionStatusSection
        cohortSlug="cohort-01"
        weekNumber={task?.weekNumber ?? 1}
        locale={locale}
      />
      {task ? (
        <p>
          {copy.portal.week} {task.weekNumber}
        </p>
      ) : null}
    </PageSection>
  );
}
