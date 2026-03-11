import { NextRequest, NextResponse } from "next/server";
import {
  generateDocument,
  DocumentType,
  FormData as DocFormData,
} from "@/utils/doc-generator";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { docType, formData } = body as {
      docType: DocumentType;
      formData: DocFormData;
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

    // Generate the document
    const docBuffer = await generateDocument(docType, formData);

    // Create filename based on document type
    const filenameMap: Record<DocumentType, string> = {
      "lab-report": "lab-report",
      assignment: "assignment",
      "project-report": "project-report",
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
