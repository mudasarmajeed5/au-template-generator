import fs from "fs";
import path from "path";
import {
  prepareDocument,
  renderDocx,
  type AssignmentTemplateVariant,
  type DocumentType,
  type FormData,
  type ProjectTemplateVariant,
} from "./docx-core";

export type {
  AssignmentData,
  AssignmentTemplateVariant,
  DocumentType,
  LabReportData,
  Member,
  ProjectReportData,
  ProjectTemplateVariant,
} from "./docx-core";
export { type FormData } from "./docx-core";

/** Serves the same templates the browser loads statically from `/public`. */
function resolveTemplateFile(templatePath: string): string {
  return path.join(process.cwd(), "public", templatePath.replace(/^\//, ""));
}

export async function generateDocument(
  docType: DocumentType,
  formData: FormData,
  options?: {
    projectVariant?: ProjectTemplateVariant;
    assignmentVariant?: AssignmentTemplateVariant;
  },
): Promise<Uint8Array<ArrayBuffer>> {
  const prepared = prepareDocument(docType, formData, options);

  // Read the template file (templates are served statically to the browser,
  // and read from disk here as the server-side fallback path).
  const template = await fs.promises.readFile(resolveTemplateFile(prepared.templatePath));

  return renderDocx(template, prepared.payload);
}

export function getTemplateFields(docType: DocumentType): string[] {
  const fieldsMap: Record<DocumentType, string[]> = {
    "lab-report": [
      "name",
      "rollNumber",
      "labWeek",
      "courseName",
      "instructor",
      "dateSubmitted",
      "generatedDate",
    ],
    assignment: [
      "title",
      "courseName",
      "instructor",
      "dateSubmitted",
      "name",
      "members",
      "generatedDate",
    ],
    "project-report": [
      "projectTitle",
      "courseName",
      "instructor",
      "dateSubmitted",
      "members",
      "generatedDate",
    ],
  };

  return fieldsMap[docType];
}
