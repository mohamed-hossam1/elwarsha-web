export type Locale = "ar" | "en";
export type MembershipRole = "participant" | "mentor" | "maintainer" | "admin";
export type Capability =
  | "portal.view"
  | "products.read"
  | "cohorts.read"
  | "assignments.read"
  | "submissions.read"
  | "reviews.read"
  | "weeks.read";

export type SessionUser = {
  id: string;
  displayName: string;
  email: string;
  locale: Locale;
};

export type Membership = {
  id: string;
  userId: string;
  engagementId: string;
  role: MembershipRole;
};

export type SessionResponse = {
  user: SessionUser;
  roles: MembershipRole[];
  capabilities: Capability[];
  memberships: Membership[];
};

export type ProductRepositoryInfo = {
  id?: string;
  githubOwner: string;
  githubRepo: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  repositories?: ProductRepositoryInfo[];
  repository: ProductRepositoryInfo | null;
};

export type Engagement = {
  id: string;
  status: "planned" | "active" | "completed";
  cohort: {
    id: string;
    slug: string;
    name: string;
    startsOn: string;
    endsOn: string;
  };
  product: Product;
};

export type Assignment = {
  id: string;
  weekNumber: number;
  title: string;
  status: "draft" | "published" | "closed";
  engagementId: string;
};

export type CohortRef = {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  currentWeekNumber: number;
  startsOn: string;
  endsOn: string;
};

export type WeekResourceItem = {
  title: string;
  url: string;
  layers: string;
  format: "Read" | "Watch" | "Listen" | string;
  time: string;
  why: string;
};

export type WeekResources = {
  required: WeekResourceItem[];
  assignment: WeekResourceItem[];
  alternative: WeekResourceItem[];
};

export type WeekAppliedLayer = {
  layer: string;
  details: string;
};

export type WeekAssignment = {
  id?: string;
  title: string;
  summary: string;
  status: "draft" | "published" | "closed";
  labels: string[];
  detailsMd: string;
};

export type Week = {
  weekNumber: number;
  title: string;
  tagline?: string;
  concept: string;
  guidingQuestion: string;
  startDate: string;
  endDate: string;
  status: "completed" | "active" | "upcoming" | "draft";
  isCurrent: boolean;
  isLocked: boolean;
  cohort: CohortRef;
  bigIdea: string;
  outcomes: string[];
  coreConcepts: string[];
  appliedThroughTheStack: WeekAppliedLayer[];
  assignment: WeekAssignment | null;
  resources: WeekResources;
  reflectionQuestion: string;
  prerequisites: string[];
};

export type ApiError = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
  error?: {
    code: string;
    message: string;
    requestId: string | null;
  };
};

export type ApplyCohortInput = {
  fullName: string;
  email: string;
  whatsappNumber: string;
  githubHandle: string;
  discordHandle: string;
  currentStatus:
    "student" | "recent_graduate" | "employed_tech" | "career_switcher" | "other";
  collegeMajor: string;
  programmingExperience: string;
  technologies: string;
  gitExperience: "none" | "basics" | "comfortable";
  personalPageUrl: string;
  githubRepoUrl: string;
  aiUsage: string;
  motivation: string;
};

export type SubmissionStatus =
  "draft" | "submitted" | "in_review" | "eligible" | "merged" | "withdrawn";

export type PullRequestSummary = {
  number: number;
  state: "open" | "closed" | "merged";
  htmlUrl: string;
};

export type RepositorySubmissionItem = {
  id: string | null;
  assignmentId: string;
  weekNumber: number;
  productRepositoryId?: string | null;
  githubOwner: string;
  githubRepo: string;
  status: SubmissionStatus;
  prUrl: string | null;
  pullRequest: PullRequestSummary | null;
  updatedAt: string | null;
};

export type AssignmentSubmissionsResponse = {
  assignmentId: string;
  weekNumber: number;
  submissions: RepositorySubmissionItem[];
};

export type AssignmentSubmissionResponse = RepositorySubmissionItem;

export type CohortApplicationResponse = {
  id: string;
  cohortSlug: string;
  email: string;
  status: string;
  createdAt: string;
};

export type ElWarshaClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export class ElWarshaApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body?.detail ?? body?.error?.message ?? `Request failed with ${status}`);
  }
}

export function createElWarshaClient(options: ElWarshaClientOptions) {
  const fetchImpl = options.fetch ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchImpl(`${options.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      throw new ElWarshaApiError(response.status, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    version: "0.1.0",
    health: () => request<{ status: string }>("/healthz"),
    ready: () => request<{ status: string }>("/readyz"),
    loginUrl: (params?: { locale?: Locale }) =>
      params?.locale
        ? `${options.baseUrl}/api/v1/auth/login?locale=${params.locale}`
        : `${options.baseUrl}/api/v1/auth/login`,
    me: () => request<SessionResponse>("/api/v1/auth/me"),
    logout: () => request<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" }),
    listProducts: () => request<Product[]>("/api/v1/products"),
    listEngagements: () => request<Engagement[]>("/api/v1/engagements"),
    listAssignments: () => request<Assignment[]>("/api/v1/assignments"),
    listCohortWeeks: (cohortSlug: string, params?: { locale?: Locale }) =>
      request<Week[]>(
        params?.locale
          ? `/api/v1/cohorts/${cohortSlug}/weeks?locale=${params.locale}`
          : `/api/v1/cohorts/${cohortSlug}/weeks`,
      ),
    getCohortWeek: (
      cohortSlug: string,
      weekNumber: number,
      params?: { locale?: Locale },
    ) =>
      request<Week>(
        params?.locale
          ? `/api/v1/cohorts/${cohortSlug}/weeks/${weekNumber}?locale=${params.locale}`
          : `/api/v1/cohorts/${cohortSlug}/weeks/${weekNumber}`,
      ),
    listWeeks: (params?: { locale?: Locale }) =>
      request<Week[]>(
        params?.locale ? `/api/v1/weeks?locale=${params.locale}` : "/api/v1/weeks",
      ),
    getAssignmentSubmissions: (cohortSlug: string, weekNumber: number) =>
      request<AssignmentSubmissionsResponse>(
        `/api/v1/cohorts/${cohortSlug}/assignments/${weekNumber}/submissions`,
      ),
    getAssignmentSubmission: (
      cohortSlug: string,
      weekNumber: number,
      params?: { repositoryId?: string },
    ) =>
      request<AssignmentSubmissionResponse>(
        params?.repositoryId
          ? `/api/v1/cohorts/${cohortSlug}/assignments/${weekNumber}/submission?repositoryId=${params.repositoryId}`
          : `/api/v1/cohorts/${cohortSlug}/assignments/${weekNumber}/submission`,
      ),
    applyCohort: (cohortSlug: string, input: ApplyCohortInput) =>
      request<CohortApplicationResponse>(`/api/v1/cohorts/${cohortSlug}/applications`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      }),
  };
}

export type ElWarshaClient = ReturnType<typeof createElWarshaClient>;
