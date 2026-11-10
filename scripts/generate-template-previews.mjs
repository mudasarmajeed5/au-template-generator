// Usage: node scripts/generate-template-previews.mjs /tmp/au-template-previews
// Fill every template with the same sample data before rendering its cover image.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COVER_DESIGNS, prepareDocument, renderDocx } from "../utils/docx-core.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.argv[2];
if (!output) throw new Error("Pass a temporary output directory for the sample documents.");
await mkdir(output, { recursive: true });

const sample = {
  name: "Ayesha Khan",
  rollNumber: "FA23-BSE-042",
  labWeek: "Week 07",
  courseName: "Software Engineering",
  instructor: "Dr. Sana Ahmed",
  dateSubmitted: "2026-11-10",
  title: "Campus Navigation System",
  projectTitle: "Campus Navigation System",
  isSingleMember: true,
  members: [
    { reg: "FA23-BSE-042", name: "Ayesha Khan" },
    { reg: "FA23-BSE-051", name: "Ahmed Ali" },
  ],
};

const cases = [
  ...COVER_DESIGNS.map((design) => ({
    docType: design.docType,
    options: { coverDesign: design.id },
    data: { ...sample, isSingleMember: design.id !== "03-split-group-assignment" },
  })),
  { docType: "lab-report", data: sample },
  { docType: "assignment", data: sample },
  { docType: "assignment", data: { ...sample, isSingleMember: false } },
  ...[1, 2, 3].map((projectVariant) => ({
    docType: "project-report",
    data: { ...sample, projectTitle: "Smart Campus", courseName: "Software Design", instructor: "Dr. Ahmed" },
    options: { projectVariant },
  })),
];

for (const entry of cases) {
  const prepared = prepareDocument(entry.docType, entry.data, entry.options);
  const template = await readFile(path.join(root, "public", prepared.templatePath));
  const docx = await renderDocx(template, prepared.payload);
  await writeFile(path.join(output, `${prepared.templateKey}.docx`), docx);
  console.log(prepared.templateKey);
}
