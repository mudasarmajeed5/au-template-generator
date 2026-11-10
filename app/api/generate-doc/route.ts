import { NextRequest, NextResponse } from "next/server";
import {
  generateDocument,
  type DocumentType,
  type FormData,
  type ProjectTemplateVariant,
} from "@/utils/doc-generator";
import { prepareDocument, type CoverDesignId } from "@/utils/docx-core";

export const runtime = "nodejs";

const VALID_TYPES: DocumentType[] = [
  "lab-report",
  "assignment",
  "project-report",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { docType, formData, templateVariant, coverDesign, includePageNumbers } = body as {
      docType: DocumentType;
      formData: FormData;
      templateVariant?: ProjectTemplateVariant;
      coverDesign?: CoverDesignId;
      includePageNumbers?: boolean;
    };

    if (!docType || !formData) {
      return NextResponse.json(
        { error: "Missing docType or formData" },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.includes(docType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      );
    }

    if (includePageNumbers !== undefined && typeof includePageNumbers !== "boolean") {
      return NextResponse.json({ error: "Invalid page numbers option" }, { status: 400 });
    }

    const options = {
      includePageNumbers,
      coverDesign,
      projectVariant: docType === "project-report" ? templateVariant : undefined,
    };
    const prepared = prepareDocument(docType, formData, options);

    // Server-side fallback used only when in-browser generation fails; the
    // client normally renders the document itself (see utils/docx-client.ts).
    const docBuffer = await generateDocument(docType, formData, options);

    return new NextResponse(docBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${prepared.filename}"`,
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
