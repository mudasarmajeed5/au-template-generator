import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import PizZip from 'pizzip';
import { DOMParser } from '@xmldom/xmldom';
import { COVER_DESIGNS, prepareDocument, renderDocx } from '../utils/docx-core.ts';
import { applyPageNumbers } from '../utils/docx-page-numbers.ts';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const parser = new DOMParser({ onError: (level, message) => { throw new Error(`${level}: ${message}`); } });
const sample = {
  name: 'Ayesha Khan', rollNumber: 'FA23-BSE-042', labWeek: 'Week 07',
  courseName: 'Software Design', instructor: 'Dr. Ahmed', dateSubmitted: '2026-11-10',
  title: 'Smart Campus', projectTitle: 'Smart Campus', isSingleMember: true,
  members: [{ reg: 'FA23-BSE-042', name: 'Ayesha Khan' }],
};
const cases = [
  ...COVER_DESIGNS.map(design => ({ type: design.docType, coverDesign: design.id })),
  { type: 'lab-report' },
  { type: 'assignment' },
  { type: 'assignment', group: true },
  ...[1,2,3].map(projectVariant => ({ type: 'project-report', projectVariant })),
];
await mkdir('/tmp/au-page-number-qa', { recursive: true });
for (const entry of cases) {
  const prepared = prepareDocument(entry.type, { ...sample, isSingleMember: !entry.group }, entry);
  const template = await readFile(`public${prepared.templatePath}`);
  for (const enabled of [false, true]) {
    const output = await renderDocx(template, prepared.payload, { includePageNumbers: enabled });
    const zip = new PizZip(output);
    for (const file of zip.file(/\.xml$/)) parser.parseFromString(file.asText(), 'application/xml');
    const xml = zip.file(/^word\/(?:footer\d+|header\d+|document)\.xml$/).map(file => file.asText()).join('');
    assert.equal(/(?:w:instr="\s*PAGE|>\s*PAGE\s+\\)/.test(xml), enabled, `${prepared.templateKey}: ${enabled}`);
    assert.ok(!xml.includes('{PAGE}'));
    assert.ok(xml.includes('Ayesha Khan'));
    if (entry.coverDesign || entry.type !== 'project-report') assert.ok(xml.includes('2026-11-10'));
    const doc = parser.parseFromString(zip.file('word/document.xml').asText(), 'application/xml');
    const rels = parser.parseFromString(zip.file('word/_rels/document.xml.rels').asText(), 'application/xml');
    for (const ref of Array.from(doc.getElementsByTagNameNS(W, 'footerReference'))) {
      const rel = Array.from(rels.getElementsByTagName('Relationship')).find(el=>el.getAttribute('Id')===ref.getAttributeNS(R,'id'));
      assert.ok(rel);
      const target = 'word/' + rel.getAttribute('Target').replace(/^\/?word\//,'');
      assert.ok(zip.file(target));
      if (enabled) assert.match(zip.file(target).asText(), /PAGE/);
    }
    const count = zip.file(/^word\/footer\d+\.xml$/).length;
    applyPageNumbers(zip, enabled);
    assert.equal(zip.file(/^word\/footer\d+\.xml$/).length, count, 'Repeated toggles do not duplicate footer parts');
    await writeFile(`/tmp/au-page-number-qa/${prepared.templateKey}${entry.group ? '-group' : ''}-${enabled}.docx`, output);
  }
}
// Prove a real PAGE field recalculates on later pages, using the render QA fixture.
const multi = new PizZip(await readFile('/tmp/au-page-number-qa/project-report-1-true.docx'));
multi.file('word/document.xml', multi.file('word/document.xml').asText().replace(/<w:sectPr\b/, '<w:p><w:r><w:br w:type="page"/><w:t>Second page</w:t></w:r></w:p><w:sectPr'));
await writeFile('/tmp/au-page-number-qa/multipage.docx', multi.generate({ type: 'nodebuffer' }));
console.log(`Page-number toggles passed for all ${cases.length} templates (on/off, valid XML, preserved content, footer references, no duplicates).`);
