import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import PizZip from 'pizzip';
import { COVER_DESIGNS, prepareDocument, renderDocx } from '../utils/docx-core.ts';
await mkdir('/tmp/au-cover-qa', { recursive: true });
for (const design of COVER_DESIGNS) {
  for (const single of design.docType === 'assignment' ? [true, false] : [false]) {
    const data = {
      name: 'Ayesha Khan', rollNumber: 'FA23-BSE-042', labWeek: 'Week 07',
      courseName: 'Advanced Software Engineering and Distributed Information Systems',
      instructor: 'Dr Sana Ahmed', dateSubmitted: '2026-11-07',
      title: 'Design and evaluation of accessible campus navigation and real time service availability',
      projectTitle: 'Design and evaluation of accessible campus navigation and real time service availability',
      isSingleMember: single,
      members: Array.from({ length: 5 }, (_, i) => ({ reg: `FA23-BSE-00${i+1}`, name: `Student ${i+1} with an extended family name` })),
    };
    const prepared = prepareDocument(design.docType, data, { coverDesign: design.id });
    const output = await renderDocx(await readFile(`public${prepared.templatePath}`), prepared.payload);
    const zip = new PizZip(output);
    const xml = zip.file('word/document.xml').asText();
    assert.ok(xml.includes('Air University'));
    assert.ok(zip.file('word/media/au-logo.png'));
    assert.ok(!/\{(?:coverTitle|submittedBy|courseName|instructor|dateSubmitted|generatedDate|documentLabel)\}/.test(xml));
    assert.ok(!xml.includes('John Doe') && !xml.includes('University Name'));
    assert.ok(xml.includes(design.docType === 'assignment' && single ? 'Ayesha Khan' : design.docType === 'lab-report' ? 'Ayesha Khan' : 'Student 5 with an extended family name'));
    await writeFile(`/tmp/au-cover-qa/${design.id}${single ? '-individual' : ''}.docx`, output);
  }
}
assert.throws(() => prepareDocument('lab-report', {}, { coverDesign: 'unknown' }));
assert.throws(() => prepareDocument('lab-report', {}, { coverDesign: 'university-14' }));
console.log('All 12 covers populate correctly, including five-member and individual assignments.');

const oversized = prepareDocument("lab-report", { labWeek: "A".repeat(2000) }, { coverDesign: "university-02" });
await assert.rejects(renderDocx(await readFile(`public${oversized.templatePath}`), oversized.payload), /one page/);
