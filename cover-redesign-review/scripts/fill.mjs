import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import PizZip from 'pizzip';
import { prepareDocument, renderDocx } from '../../utils/docx-core.ts';

const root = new URL('../', import.meta.url);
const templates = [
  ['01-formal-academic-lab', 'lab-report'],
  ['02-editorial-assignment', 'assignment'],
  ['03-split-group-assignment', 'assignment'],
  ['04-technical-project', 'project-report'],
];
for (const [id, type] of templates) {
  for (const stress of [false, true]) {
    const data = {
      name: stress ? 'Ayesha Noor Muhammad Khan' : 'Ayesha Khan',
      rollNumber: 'FA23-BSE-042',
      labWeek: stress ? 'Week 07 Implementation and performance evaluation' : 'Week 07 Binary search trees',
      courseName: stress ? 'Advanced Software Engineering and Distributed Information Systems' : 'Software Engineering',
      instructor: stress ? 'Dr Muhammad Abdullah Siddiqui' : 'Dr Sana Ahmed',
      dateSubmitted: '07 November 2026',
      title: stress ? 'Design and evaluation of an accessible campus navigation platform with real time service availability and multilingual support' : 'Accessible campus navigation',
      projectTitle: stress ? 'Design and evaluation of a distributed campus navigation platform with accessible real time services' : 'Smart campus service platform',
      isSingleMember: id.startsWith('02'),
      members: ['Ayesha Khan', 'Muhammad Hamza', 'Fatima Zahra', 'Ahmed Raza', 'Maryam Ali'].map((name, i) => ({
        name: stress ? `${name} ${['Siddiqui', 'Abdullah', 'Mahmood', 'Muhammad', 'Chaudhry'][i]}` : name,
        reg: `FA23-BSE-0${42 + i}`,
      })),
    };
    const prepared = prepareDocument(type, data);
    const bytes = await renderDocx(await readFile(new URL(`docx/${id}.docx`, root)), prepared.payload);
    const zip = new PizZip(bytes);
    for (const file of zip.file(/^word\/.*\.xml$/)) {
      assert.ok(!/\{(?:#|\/)?(?:members|name|reg|title|courseName|labWeek|projectTitle|instructor|rollNumber|dateSubmitted|generatedDate)\}/.test(file.asText()), `${id} has an unresolved field`);
    }
    const xml = zip.file('word/document.xml').asText();
    assert.ok(xml.includes('AIR UNIVERSITY') || xml.includes('AIR'));
    if (id.startsWith('03') || id.startsWith('04')) assert.ok(xml.includes('Maryam Ali'));
    await writeFile(new URL(`samples/${id}-${stress ? 'stress' : 'sample'}.docx`, root), bytes);
  }
}
console.log('Eight populated samples passed placeholder and member checks');
