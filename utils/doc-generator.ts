import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";

export type DocumentType = "lab-report" | "assignment" | "project-report";
export type ProjectTemplateVariant = 1 | 2 | 3;

export interface LabReportData {
  name: string;
  rollNumber: string;
  labWeek?: string;
  courseName: string;
  submittedTo?: string;
  dateSubmitted: string;
}

export interface Member {
  reg: string;
  name: string;
}

export interface AssignmentData {
  title: string;
  courseName: string;
  instructor: string;
  dateSubmitted: string;
  name?: string; // For single member
  members?: Member[]; // For multiple members
}

export interface ProjectReportData {
  projectTitle: string;
  courseName: string;
  instructor: string;
  dateSubmitted: string;
  members: Member[];
}

export type FormData = LabReportData | AssignmentData | ProjectReportData;

function getTemplatePath(
  docType: DocumentType,
  templateVariant?: ProjectTemplateVariant,
): string {
  if (docType === "project-report" && templateVariant) {
    return path.join(
      process.cwd(),
      "templates",
      `projects/project-report-${templateVariant}.docx`,
    );
  }

  const templateMap: Record<DocumentType, string> = {
    "lab-report": "labs/lab-report.docx",
    assignment: "assignments/assignment.docx",
    "project-report": "projects/project-report-1.docx",
  };

  return path.join(process.cwd(), "templates", templateMap[docType]);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateDocument(
  docType: DocumentType,
  formData: FormData,
  templateVariant?: ProjectTemplateVariant,
): Promise<Buffer> {
  const templatePath = getTemplatePath(docType, templateVariant);

  // Read the template file
  const templateContent = fs.readFileSync(templatePath, "binary");

  // Unzip the template
  const zip = new PizZip(templateContent);

  // Create docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Add generated date to the data
  const generatedDate = formatDate(new Date());

  // Prepare data with generated date
  const data = {
    ...formData,
    generatedDate,
    pageNumber: "{PAGE}",
  };

  // Replace placeholders
  doc.render(data);

  // Generate the output
  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buf;
}

export function getTemplateFields(docType: DocumentType): string[] {
  const fieldsMap: Record<DocumentType, string[]> = {
    "lab-report": [
      "name",
      "rollNumber",
      "labWeek",
      "courseName",
      "submittedTo",
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
