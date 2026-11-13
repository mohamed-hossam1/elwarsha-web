import { z } from "zod";

const submissionStatusSchema = z.enum([
  "draft",
  "submitted",
  "in_review",
  "eligible",
  "merged",
  "withdrawn",
]);

const pullRequestSummarySchema = z.object({
  number: z.number().int(),
  state: z.enum(["open", "closed", "merged"]),
  htmlUrl: z.string(),
});

const repositorySubmissionSchema = z.object({
  id: z.string().nullable(),
  assignmentId: z.string(),
  weekNumber: z.number().int(),
  productRepositoryId: z.string().nullable().optional(),
  githubOwner: z.string(),
  githubRepo: z.string(),
  status: submissionStatusSchema,
  prUrl: z.string().nullable(),
  pullRequest: pullRequestSummarySchema.nullable(),
  updatedAt: z.string().nullable(),
});

export const assignmentSubmissionsSchema = z.object({
  assignmentId: z.string(),
  weekNumber: z.number().int(),
  submissions: z.array(repositorySubmissionSchema),
});

export type AssignmentSubmissions = z.infer<typeof assignmentSubmissionsSchema>;
