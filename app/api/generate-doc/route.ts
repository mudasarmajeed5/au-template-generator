import { NextRequest, NextResponse } from "next/server";
import {
  generateDocument,
  DocumentType,
  FormData as DocFormData,
  ProjectTemplateVariant,
  AssignmentTemplateVariant,
  AssignmentData,
  LabReportData,
} from "@/utils/doc-generator";

export const runtime = "nodejs";

// Sanitize filename by removing/replacing special characters
function sanitizeFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, "") // Remove invalid characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { docType, formData, templateVariant } = body as {
      docType: DocumentType;
      formData: DocFormData;
      templateVariant?: ProjectTemplateVariant;
    };

    if (!docType || !formData) {
      return NextResponse.json(
        { error: "Missing docType or formData" },
        { status: 400 },
      );
    }

    // Validate document type
    const validTypes: DocumentType[] = [
      "lab-report",
      "assignment",
      "project-report",
    ];
    if (!validTypes.includes(docType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      );
    }

    // Determine assignment variant based on members
    let assignmentVariant: AssignmentTemplateVariant | undefined;
    if (docType === "assignment") {
      const assignmentData = formData as AssignmentData;
      assignmentVariant =
        assignmentData.members && assignmentData.members.length > 0
          ? "group"
          : "individual";
    }

    // Generate the document with optional template variant
    const docBuffer = await generateDocument(docType, formData, {
      projectVariant:
        docType === "project-report" ? templateVariant : undefined,
      assignmentVariant:
        docType === "assignment" ? assignmentVariant : undefined,
    });

    // Create filename based on document type
    let filename: string;

    if (docType === "lab-report") {
      // Format: RollNumber_Subject_LabWeek
      const labData = formData as LabReportData;
      const rollNumber = sanitizeFilename(labData.rollNumber || "unknown");
      const subject = sanitizeFilename(labData.courseName || "lab");
      const labWeek = sanitizeFilename(labData.labWeek || "");
      filename = labWeek
        ? `${rollNumber}_${subject}_${labWeek}.docx`
        : `${rollNumber}_${subject}.docx`;
    } else if (docType === "assignment") {
      // Format: RollNumber_Topic
      const assignmentData = formData as AssignmentData;
      const rollNumber =
        assignmentVariant === "group" && assignmentData.members?.[0]?.reg
          ? sanitizeFilename(assignmentData.members[0].reg)
          : sanitizeFilename(assignmentData.rollNumber || "unknown");
      const topic = sanitizeFilename(assignmentData.title || "assignment");
      filename = `${rollNumber}_${topic}.docx`;
    } else {
      // Project report - keep existing format
      filename = `project-report${templateVariant ? `-style-${templateVariant}` : ""}-${Date.now()}.docx`;
    }

    // Return the document as a download
    return new NextResponse(new Uint8Array(docBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 },
    );
  }
}
