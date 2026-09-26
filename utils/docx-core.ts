/**
 * Isomorphic (browser + Node) DOCX helpers.
 *
 * This module must never import Node built-ins (`fs`, `path`, ...) so it can be
 * bundled into the client. Heavy dependencies (docxtemplater / pizzip) are
 * loaded with dynamic `import()` so they only land in an async chunk that is
 * fetched the first time a document is actually rendered.
 */

export type DocumentType = "lab-report" | "assignment" | "project-report";
export type ProjectTemplateVariant = 1 | 2 | 3;
export type AssignmentTemplateVariant = "individual" | "group";

/** Identifies one of the .docx templates that can be previewed / generated. */
export type PreviewTemplateKey =
  | "lab-report"
  | "assignment-individual"
  | "assignment-group"
  | "project-report-1"
  | "project-report-2"
  | "project-report-3";

export interface Member {
  reg: string;
  name: string;
}

export interface LabReportData {
  name: string;
  rollNumber: string;
  labWeek?: string;
  courseName: string;
  instructor?: string;
  dateSubmitted: string;
}

export interface AssignmentData {
  title: string;
  courseName: string;
  instructor: string;
  dateSubmitted: string;
  rollNumber?: string;
  name?: string;
  members?: Member[];
  /** Present only in the browser form payload. */
  isSingleMember?: boolean;
}

export interface ProjectReportData {
  projectTitle: string;
  courseName: string;
  instructor: string;
  dateSubmitted: string;
  members: Member[];
}

export type FormData = LabReportData | AssignmentData | ProjectReportData;

export interface DocRequestOptions {
  projectVariant?: ProjectTemplateVariant;
  assignmentVariant?: AssignmentTemplateVariant;
}

/** Everything needed to render (preview or download) one document. */
export interface PreparedDocument {
  templateKey: PreviewTemplateKey;
  /** Static URL of the .docx template (served from `/public`). */
  templatePath: string;
  /** Data handed to docxtemplater (already shaped for the chosen variant). */
  payload: Record<string, unknown>;
  projectVariant?: ProjectTemplateVariant;
  assignmentVariant?: AssignmentTemplateVariant;
  filename: string;
}

export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Public (static) paths of every supported template. */
const TEMPLATE_PATHS: Record<PreviewTemplateKey, string> = {
  "lab-report": "/templates/labs/lab-report.docx",
  "assignment-individual":
    "/templates/assignments/assignment-template-individual.docx",
  "assignment-group": "/templates/assignments/assignment-template-group.docx",
  "project-report-1": "/templates/projects/project-report-1.docx",
  "project-report-2": "/templates/projects/project-report-2.docx",
  "project-report-3": "/templates/projects/project-report-3.docx",
};

export function templatePathFor(key: PreviewTemplateKey): string {
  return TEMPLATE_PATHS[key];
}

export function previewKeyFor(
  docType: DocumentType,
  options?: DocRequestOptions,
): PreviewTemplateKey {
  if (docType === "project-report") {
    return `project-report-${options?.projectVariant ?? 1}` as PreviewTemplateKey;
  }
  if (docType === "assignment") {
    const variant = options?.assignmentVariant ?? "individual";
    return `assignment-${variant}`;
  }
  return "lab-report";
}

function sanitizeFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

function resolveAssignmentVariant(data: AssignmentData): AssignmentTemplateVariant {
  if (data.isSingleMember === true) return "individual";
  if (data.isSingleMember === false) return "group";
  return data.members && data.members.length > 0 ? "group" : "individual";
}

/**
 * Strips fields the selected variant does not use so the payload matches what
 * the server historically received (and what the template expects).
 */
function shapePayload(
  docType: DocumentType,
  formData: FormData,
  assignmentVariant?: AssignmentTemplateVariant,
): Record<string, unknown> {
  if (docType !== "assignment") return { ...formData };

  const data = { ...(formData as AssignmentData) };
  delete data.isSingleMember;

  if (assignmentVariant === "individual") {
    delete data.members;
  }
  return data;
}

function buildFilename(
  docType: DocumentType,
  formData: FormData,
  options?: DocRequestOptions,
): string {
  if (docType === "lab-report") {
    const lab = formData as LabReportData;
    const rollNumber = sanitizeFilename(lab.rollNumber || "unknown");
    const subject = sanitizeFilename(lab.courseName || "lab");
    const labWeek = sanitizeFilename(lab.labWeek || "");
    return labWeek
      ? `${rollNumber}_${subject}_${labWeek}.docx`
      : `${rollNumber}_${subject}.docx`;
  }

  if (docType === "assignment") {
    const assignment = formData as AssignmentData;
    const variant =
      options?.assignmentVariant ?? resolveAssignmentVariant(assignment);
    const rollNumber =
      variant === "group" && assignment.members?.[0]?.reg
        ? sanitizeFilename(assignment.members[0].reg)
        : sanitizeFilename(assignment.rollNumber || "unknown");
    const topic = sanitizeFilename(assignment.title || "assignment");
    return `${rollNumber}_${topic}.docx`;
  }

  const variant = options?.projectVariant;
  return `project-report${variant ? `-style-${variant}` : ""}-${Date.now()}.docx`;
}

/**
 * Turns raw form data into a complete render request: template choice,
 * shaped payload and download filename. The browser and the server both call
 * this so preview, client download and API fallback stay byte-identical.
 */
export function prepareDocument(
  docType: DocumentType,
  formData: FormData,
  options?: DocRequestOptions,
): PreparedDocument {
  const assignmentVariant =
    docType === "assignment"
      ? options?.assignmentVariant ??
        resolveAssignmentVariant(formData as AssignmentData)
      : undefined;
  const resolved: DocRequestOptions = {
    projectVariant: options?.projectVariant,
    assignmentVariant,
  };
  const templateKey = previewKeyFor(docType, resolved);

  return {
    templateKey,
    templatePath: templatePathFor(templateKey),
    payload: shapePayload(docType, formData, assignmentVariant),
    projectVariant: docType === "project-report" ? options?.projectVariant : undefined,
    assignmentVariant,
    filename: buildFilename(docType, formData, resolved),
  };
}

export function formatGeneratedDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Renders a filled .docx from raw template bytes. Dynamic imports keep
 * docxtemplater/pizzip out of the initial client bundle (and out of the
 * server's startup path).
 */
export async function renderDocx(
  template: ArrayBuffer | Uint8Array | string,
  payload: Record<string, unknown>,
): Promise<Uint8Array<ArrayBuffer>> {
  const [{ default: PizZip }, { default: Docxtemplater }] = await Promise.all([
    import("pizzip"),
    import("docxtemplater"),
  ]);

  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    ...payload,
    generatedDate: formatGeneratedDate(),
    pageNumber: "{PAGE}",
  });

  const buffer = doc.getZip().generate({
    type: "arraybuffer",
    compression: "DEFLATE",
  });
  return new Uint8Array(buffer);
}
