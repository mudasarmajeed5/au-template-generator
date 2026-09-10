import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const TEMPLATE_ROOT = path.join(process.cwd(), "templates");

const ALLOWED_PATHS: Record<string, string> = {
  "lab-report": "labs/lab-report.docx",
  "assignment-individual": "assignments/assignment-template-individual.docx",
  "assignment-group": "assignments/assignment-template-group.docx",
  "project-report-1": "projects/project-report-1.docx",
  "project-report-2": "projects/project-report-2.docx",
  "project-report-3": "projects/project-report-3.docx",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key || !ALLOWED_PATHS[key]) {
      return NextResponse.json(
        { error: "Invalid template key" },
        { status: 400 },
      );
    }

    const filePath = path.join(TEMPLATE_ROOT, ALLOWED_PATHS[key]);
    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving template:", error);
    return NextResponse.json(
      { error: "Failed to load template" },
      { status: 500 },
    );
  }
}
