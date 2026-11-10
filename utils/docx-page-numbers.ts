import { DOMParser, XMLSerializer, type Element } from "@xmldom/xmldom";
import type PizZip from "pizzip";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const REL = "http://schemas.openxmlformats.org/package/2006/relationships";
const CT = "http://schemas.openxmlformats.org/package/2006/content-types";
const parser = new DOMParser();
const serializer = new XMLSerializer();
const elements = (node: Element, name: string) => Array.from(node.getElementsByTagNameNS(W, name));
const isPage = (instruction: string) => /^\s*PAGE(?:\s|$)/i.test(instruction);

/** Remove or refresh PAGE fields without deleting footer dates or artwork. */
function updateFields(root: Element, enabled: boolean): boolean {
  let found = false;
  for (const field of elements(root, "fldSimple")) {
    if (!isPage(field.getAttributeNS(W, "instr") ?? "")) continue;
    found = true;
    if (!enabled) field.parentNode?.removeChild(field);
    else {
      field.setAttributeNS(W, "w:dirty", "true");
      for (const text of elements(field, "t")) text.textContent = "1";
    }
  }
  // Complex fields use begin / instruction / cached result / end runs. Work
  // within each paragraph so a drawing's outer run is never removed with it.
  for (const paragraph of elements(root, "p")) {
    const runs = Array.from(paragraph.childNodes).filter(
      (node): node is Element => node.nodeType === 1 && node.namespaceURI === W && node.localName === "r",
    );
    for (let start = 0; start < runs.length; start++) {
      const begin = elements(runs[start], "fldChar").find((el) => el.getAttributeNS(W, "fldCharType") === "begin");
      if (!begin) continue;
      let depth = 0;
      let end = start;
      let instruction = "";
      for (; end < runs.length; end++) {
        instruction += elements(runs[end], "instrText").map((el) => el.textContent).join("");
        for (const char of elements(runs[end], "fldChar")) {
          if (char.getAttributeNS(W, "fldCharType") === "begin") depth++;
          if (char.getAttributeNS(W, "fldCharType") === "end") depth--;
        }
        if (depth === 0) break;
      }
      if (end === runs.length || !isPage(instruction)) continue;
      found = true;
      if (enabled) begin.setAttributeNS(W, "w:dirty", "true");
      for (let i = start; i <= end; i++) {
        if (!enabled) runs[i].parentNode?.removeChild(runs[i]);
        else for (const text of elements(runs[i], "t")) text.textContent = "1";
      }
      start = end;
    }
  }
  return found;
}

export function applyPageNumbers(zip: PizZip, enabled: boolean): void {
  const parse = (path: string) => parser.parseFromString(zip.file(path)!.asText(), "application/xml");
  const save = (path: string, doc: ReturnType<typeof parse>) => zip.file(path, serializer.serializeToString(doc));
  const numberedFooters = new Set<string>();
  for (const file of zip.file(/^word\/(?:footer\d+|header\d+|document)\.xml$/)) {
    const doc = parse(file.name);
    if (updateFields(doc.documentElement!, enabled)) numberedFooters.add(file.name);
    save(file.name, doc);
  }
  if (!enabled) return;

  const document = parse("word/document.xml");
  const rels = parse("word/_rels/document.xml.rels");
  const types = parse("[Content_Types].xml");
  const footer = parser.parseFromString(`<w:ftr xmlns:w="${W}"><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:fldSimple w:instr="PAGE" w:dirty="true"><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="18"/><w:color w:val="666666"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`, "application/xml");
  let generatedId: string | undefined;
  const newFooter = () => {
    if (generatedId) return generatedId;
    let n = 1;
    while (zip.file(`word/footer${n}.xml`)) n++;
    save(`word/footer${n}.xml`, footer);
    const ids = new Set(Array.from(rels.documentElement!.childNodes).map((node) => node.nodeType === 1 ? (node as Element).getAttribute("Id") : ""));
    let id = 1;
    while (ids.has(`rId${id}`)) id++;
    generatedId = `rId${id}`;
    const relationship = rels.createElementNS(REL, "Relationship");
    relationship.setAttribute("Id", generatedId);
    relationship.setAttribute("Type", `${R}/footer`);
    relationship.setAttribute("Target", `footer${n}.xml`);
    rels.documentElement!.appendChild(relationship);
    const override = types.createElementNS(CT, "Override");
    override.setAttribute("PartName", `/word/footer${n}.xml`);
    override.setAttribute("ContentType", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml");
    types.documentElement!.appendChild(override);
    return generatedId;
  };
  for (const section of elements(document.documentElement!, "sectPr")) {
    const references = elements(section, "footerReference");
    for (const reference of references) {
      const id = reference.getAttributeNS(R, "id");
      const relationship = Array.from(rels.getElementsByTagNameNS(REL, "Relationship")).find((el) => el.getAttribute("Id") === id);
      const target = relationship?.getAttribute("Target")?.replace(/^\/?word\//, "");
      if (!target || numberedFooters.has(`word/${target}`)) continue;
      const path = `word/${target}`;
      const existing = parse(path);
      existing.documentElement!.appendChild(existing.importNode(footer.documentElement!.firstChild!, true));
      save(path, existing);
      numberedFooters.add(path);
    }
    for (const type of ["default", "first", "even"]) {
      if (references.some((ref) => ref.getAttributeNS(W, "type") === type)) continue;
      const reference = document.createElementNS(W, "w:footerReference");
      reference.setAttributeNS(W, "w:type", type);
      reference.setAttributeNS(R, "r:id", newFooter());
      section.insertBefore(reference, section.firstChild);
    }
  }
  save("word/document.xml", document);
  save("word/_rels/document.xml.rels", rels);
  save("[Content_Types].xml", types);
}
