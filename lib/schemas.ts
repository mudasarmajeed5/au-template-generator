import { z } from "zod";

export const memberSchema = z.object({
  reg: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Name is required"),
});

export const labReportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  labWeek: z.string().optional(),
  courseName: z.string().min(1, "Course name is required"),
  instructor: z.string().optional(),
  dateSubmitted: z.string().min(1, "Date submitted is required"),
});

// Lenient member schema for form - allows empty strings at base level
const lenientMemberSchema = z.object({
  reg: z.string(),
  name: z.string(),
});

export const assignmentSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    courseName: z.string().min(1, "Course name is required"),
    instructor: z.string().min(1, "Instructor name is required"),
    dateSubmitted: z.string().min(1, "Date submitted is required"),
    isSingleMember: z.boolean(),
    name: z.string().optional(),
    rollNumber: z.string().optional(),
    members: z.array(lenientMemberSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSingleMember) {
      if (!data.name || data.name.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is required",
          path: ["name"],
        });
      }
    } else {
      // Validate members only in group mode
      if (!data.members || data.members.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one member is required",
          path: ["members"],
        });
      } else {
        // Validate each member has required fields
        data.members.forEach((member, index) => {
          if (!member.reg || member.reg.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Registration number is required",
              path: ["members", index, "reg"],
            });
          }
          if (!member.name || member.name.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Name is required",
              path: ["members", index, "name"],
            });
          }
        });
      }
    }
  });

export const projectReportSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  courseName: z.string().min(1, "Course name is required"),
  instructor: z.string().min(1, "Instructor name is required"),
  dateSubmitted: z.string().min(1, "Date submitted is required"),
  members: z.array(memberSchema).min(1, "At least one member is required"),
});

export type LabReportFormData = z.infer<typeof labReportSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type ProjectReportFormData = z.infer<typeof projectReportSchema>;
export type Member = z.infer<typeof memberSchema>;

export type DocumentType = "lab-report" | "assignment" | "project-report";
