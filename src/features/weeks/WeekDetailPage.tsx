import { Link, useParams } from "react-router-dom";

import { messages, type Locale } from "@core/i18n";
import { PageSection } from "@ui/patterns/PageSection/PageSection";
import { StatePanel } from "@ui/patterns/StatePanel/StatePanel";
import { SubmissionStatusSection } from "@ui/components/SubmissionStatusCard/SubmissionStatusSection";
import { useCohortWeekDetail } from "./useCohortWeekDetail.js";
import { WeekLockedView } from "./components/WeekLockedView.js";
import { WeekHeader } from "./components/WeekHeader.js";
import { WeekOutcomesList } from "./components/WeekOutcomesList.js";
import { WeekConceptsGrid } from "./components/WeekConceptsGrid.js";
import { WeekStackGrid } from "./components/WeekStackGrid.js";
import { WeekAssignmentCard } from "./components/WeekAssignmentCard.js";
import { WeekResourcesSection } from "./components/WeekResourcesSection.js";
import { WeekReflectionSection } from "./components/WeekReflectionSection.js";
import { WeekPagination } from "./components/WeekPagination.js";

import styles from "./WeekDetailPage.module.css";

export function WeekDetailPage({ locale }: { locale: Locale }) {
  const copy = messages[locale];
  const { cohortSlug = "cohort-01", weekNumber = "1" } = useParams();
  const weekNum = parseInt(weekNumber, 10);

  const {
    data: week,
    isLoading,
    isError,
    error,
  } = useCohortWeekDetail(cohortSlug, weekNum, locale);

  if (isLoading) {
    return (
      <PageSection eyebrow={copy.portal.title} title={copy.portal.loading}>
        <StatePanel title={copy.portal.loading} body="" />
      </PageSection>
    );
  }

  if (isError || !week) {
    return (
      <main className={styles.page}>
        <Link
          to={`/${locale}/portal/cohorts/${cohortSlug}/weeks`}
          className={styles.backLink}
        >
          <span aria-hidden="true">{locale === "ar" ? "→" : "←"}</span>
          <span>{copy.portal.backToWeeks}</span>
        </Link>
        <PageSection eyebrow={copy.portal.title} title={copy.portal.weekNotFound}>
          <StatePanel
            title={copy.portal.weekNotFound}
            body={error instanceof Error ? error.message : copy.portal.weekNotFoundBody}
          />
        </PageSection>
      </main>
    );
  }

  if (week.isLocked || week.status === "upcoming") {
    return (
      <WeekLockedView
        week={week}
        cohortSlug={cohortSlug}
        weekNum={weekNum}
        locale={locale}
        copy={copy}
      />
    );
  }

  return (
    <main className={styles.page}>
      <Link
        to={`/${locale}/portal/cohorts/${cohortSlug}/weeks`}
        className={styles.backLink}
      >
        <span aria-hidden="true">{locale === "ar" ? "→" : "←"}</span>
        <span>{copy.portal.backToWeeks}</span>
      </Link>

      <WeekHeader week={week} copy={copy} />

      <SubmissionStatusSection
        cohortSlug={cohortSlug}
        weekNumber={weekNum}
        locale={locale}
      />

      <WeekOutcomesList outcomes={week.outcomes} title={copy.portal.learningOutcomes} />

      <WeekConceptsGrid
        coreConcepts={week.coreConcepts}
        title={copy.portal.coreConcepts}
      />

      <WeekStackGrid
        appliedThroughTheStack={week.appliedThroughTheStack}
        title={copy.portal.appliedThroughTheStack}
      />

      {week.assignment && <WeekAssignmentCard assignment={week.assignment} copy={copy} />}

      <WeekResourcesSection resources={week.resources} copy={copy} />

      <WeekReflectionSection
        reflectionQuestion={week.reflectionQuestion}
        prerequisites={week.prerequisites}
        copy={copy}
      />

      <WeekPagination
        cohortSlug={cohortSlug}
        weekNum={weekNum}
        locale={locale}
        copy={copy}
      />
    </main>
  );
}
