import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  prepareDocument,
  renderDocx,
  templatePathFor,
  DOCX_MIME_TYPE,
} from "../utils/docx-core.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function extractDocumentXml(bytes) {
  const { default: PizZip } = await import("pizzip");
  const zip = new PizZip(bytes);
  const entry = zip.file("word/document.xml");
  assert.ok(entry, "generated docx must contain word/document.xml");
  return entry.asText();
}

const lab = {
  name: "Alice Khan",
  rollNumber: "FA21-BSE-042",
  labWeek: "Week 5",
  courseName: "Data Structures Lab",
  instructor: "Dr. Smith",
  dateSubmitted: "2026-09-27",
};

const assignmentIndividual = {
  title: "Sprint Planning",
  courseName: "Software Engineering",
  instructor: "Dr. Rahman",
  dateSubmitted: "2026-09-27",
  isSingleMember: true,
  name: "Bob Ahmed",
  rollNumber: "FA21-BSE-007",
  members: [{ reg: "", name: "" }],
};

const assignmentGroup = {
  title: "Group Case Study",
  courseName: "Software Engineering",
  instructor: "Dr. Rahman",
  dateSubmitted: "2026-09-27",
  isSingleMember: false,
  members: [
    { reg: "FA21-BSE-001", name: "Carol Bibi" },
    { reg: "FA21-BSE-002", name: "Danial Khan" },
  ],
};

const project = {
  projectTitle: "Campus Navigator",
  courseName: "Final Year Project",
  instructor: "Dr. Siddiqui",
  dateSubmitted: "2026-09-27",
  members: [{ reg: "FA21-BSE-011", name: "Eve Sarfraz" }],
};

const cases = [
  {
    name: "lab report",
    docType: "lab-report",
    formData: lab,
    expectedKey: "lab-report",
    filename: "FA21-BSE-042_Data_Structures_Lab_Week_5.docx",
    present: ["Alice Khan", "FA21-BSE-042", "Data Structures Lab", "Week 5"],
    absent: ["{name}", "{rollNumber}", "{courseName}"],
  },
  {
    name: "assignment (individual)",
    docType: "assignment",
    formData: assignmentIndividual,
    expectedKey: "assignment-individual",
    filename: "FA21-BSE-007_Sprint_Planning.docx",
    present: ["Bob Ahmed", "Sprint Planning", "FA21-BSE-007"],
    absent: ["{title}", "{name}"],
    payloadAbsent: ["members", "isSingleMember"],
  },
  {
    name: "assignment (group)",
    docType: "assignment",
    formData: assignmentGroup,
    expectedKey: "assignment-group",
    filename: "FA21-BSE-001_Group_Case_Study.docx",
    present: ["Carol Bibi", "Danial Khan", "Group Case Study"],
    absent: ["{members}", "{title}"],
    payloadAbsent: ["name", "isSingleMember"],
  },
  ...[1, 2, 3].map((variant) => ({
    name: `project report (style ${variant})`,
    docType: "project-report",
    formData: project,
    options: { projectVariant: variant },
    expectedKey: `project-report-${variant}`,
    filenamePattern: new RegExp(`^project-report-style-${variant}-\\d+\\.docx$`),
    present: ["Campus Navigator", "Eve Sarfraz", "Final Year Project"],
    absent: ["{projectTitle}", "{members}"],
  })),
];

let passed = 0;

for (const testCase of cases) {
  const prepared = prepareDocument(
    testCase.docType,
    testCase.formData,
    testCase.options,
  );

  assert.equal(
    prepared.templateKey,
    testCase.expectedKey,
    `${testCase.name}: template key`,
  );
  assert.ok(
    prepared.templatePath.startsWith("/templates/"),
    `${testCase.name}: template is a static public path`,
  );

  if (testCase.filename) {
    assert.equal(prepared.filename, testCase.filename, `${testCase.name}: filename`);
  }
  if (testCase.filenamePattern) {
    assert.match(
      prepared.filename,
      testCase.filenamePattern,
      `${testCase.name}: filename`,
    );
  }
  for (const key of testCase.payloadAbsent ?? []) {
    assert.ok(
      !(key in prepared.payload),
      `${testCase.name}: payload must not contain ${key}`,
    );
  }

  const template = await readFile(
    path.join(root, "public", prepared.templatePath),
  );
  const output = await renderDocx(template, prepared.payload);

  assert.ok(output instanceof Uint8Array, `${testCase.name}: returns bytes`);
  assert.equal(output[0], 0x50, `${testCase.name}: zip magic 1`);
  assert.equal(output[1], 0x4b, `${testCase.name}: zip magic 2`);

  const xml = await extractDocumentXml(output);
  for (const text of testCase.present) {
    assert.ok(
      xml.includes(text),
      `${testCase.name}: expected rendered output to contain "${text}"`,
    );
  }
  for (const text of testCase.absent ?? []) {
    assert.ok(
      !xml.includes(text),
      `${testCase.name}: expected no leftover placeholder "${text}"`,
    );
  }

  passed += 1;
  console.log(`  ✓ ${testCase.name}`);
}

// Every previewable template must exist as a static asset.
const allKeys = [
  "lab-report",
  "assignment-individual",
  "assignment-group",
  "project-report-1",
  "project-report-2",
  "project-report-3",
];
for (const key of allKeys) {
  const template = await readFile(
    path.join(root, "public", templatePathFor(key)),
  );
  assert.ok(template.byteLength > 0, `template ${key} exists`);
}

assert.equal(
  DOCX_MIME_TYPE,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
);

console.log(`\n✓ smoke test passed (${passed}/${cases.length} documents generated)`);
