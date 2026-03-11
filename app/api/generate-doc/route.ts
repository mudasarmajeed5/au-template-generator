import { NextRequest, NextResponse } from "next/server";
import {
  generateDocument,
  DocumentType,
  FormData as DocFormData,
  ProjectTemplateVariant,
} from "@/utils/doc-generator";

export const runtime = "nodejs";

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

    // Generate the document with optional template variant
    const docBuffer = await generateDocument(
      docType,
      formData,
      templateVariant,
    );

    // Create filename based on document type and template variant
    const filenameMap: Record<DocumentType, string> = {
      "lab-report": "lab-report",
      assignment: "assignment",
      "project-report": `project-report${templateVariant ? `-style-${templateVariant}` : ""}`,
    };

    const filename = `${filenameMap[docType]}-${Date.now()}.docx`;

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
