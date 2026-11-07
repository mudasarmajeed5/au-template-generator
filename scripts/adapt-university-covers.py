"""Preserve downloaded cover backgrounds and add editable AU submission fields."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from PIL import Image
from io import BytesIO

ROOT = Path(__file__).resolve().parent.parent
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'w': W, 'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006'}
IDS = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14]

def paragraph(text, size=24, bold=False, after=120):
    p = E.Element(f'{{{W}}}p')
    props = E.SubElement(p, f'{{{W}}}pPr')
    E.SubElement(props, f'{{{W}}}spacing', {f'{{{W}}}after': str(after)})
    run = E.SubElement(p, f'{{{W}}}r')
    rp = E.SubElement(run, f'{{{W}}}rPr')
    E.SubElement(rp, f'{{{W}}}rFonts', {f'{{{W}}}ascii': 'Arial', f'{{{W}}}hAnsi': 'Arial'})
    E.SubElement(rp, f'{{{W}}}sz', {f'{{{W}}}val': str(size)})
    E.SubElement(rp, f'{{{W}}}color', {f'{{{W}}}val': '142D46'})
    if bold:
        E.SubElement(rp, f'{{{W}}}b')
    E.SubElement(run, f'{{{W}}}t').text = text
    return p

for number in IDS:
    source = ROOT / f'downloaded-templates/docx/university-cover-{number:02}.docx'
    with ZipFile(source) as original:
        parts = {name: original.read(name) for name in original.namelist()}
    doc = E.fromstring(parts['word/document.xml'])
    body = doc.find(f'{{{W}}}body')
    for item in doc.xpath('//mc:AlternateContent[.//w:txbxContent]', namespaces=NS):
        item.getparent().remove(item)
    section = body.find(f'{{{W}}}sectPr')
    margin = section.find(f'{{{W}}}pgMar')
    for side in ['top', 'right', 'bottom', 'left']:
        margin.set(f'{{{W}}}{side}', '3600' if side == 'top' and number in [8, 9, 10, 11, 12, 13, 14] else '1296' if side == 'top' and number == 6 else '1440')
    # Keep the original page background and remove residual empty text runs.
    for p in list(body):
        if p.tag == f'{{{W}}}p' and not p.xpath('.//w:drawing | .//w:pict', namespaces=NS):
            body.remove(p)
    for anchor in doc.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}anchor'):
        anchor.set('behindDoc', '1')
        for axis in ['H', 'V']:
            position = anchor.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}position' + axis)
            if position is not None:
                position.set('relativeFrom', 'page')
                for child in list(position):
                    position.remove(child)
                E.SubElement(position, '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}posOffset').text = '0'
    for shape in doc.iter('{urn:schemas-microsoft-com:vml}shape'):
        shape.set('style', shape.get('style', '') + ';z-index:-1')
    logo = E.fromstring(f'''<w:p xmlns:w="{W}" xmlns:r="{R}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:drawing><wp:inline><wp:extent cx="1100000" cy="821333"/><wp:docPr id="90001" name="Air University logo" descr="Air University"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="Air University logo"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdAULogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1100000" cy="821333"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>''')
    # Use one unambiguous DrawingML background. Remove legacy VML fallbacks,
    # which can obscure foreground text in LibreOffice and canvas viewers.
    background = E.fromstring(E.tostring(logo))
    wp = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
    a = 'http://schemas.openxmlformats.org/drawingml/2006/main'
    anchor = background.find('.//{' + wp + '}inline')
    anchor.tag = '{' + wp + '}anchor'
    anchor.attrib.update({'distT': '0', 'distB': '0', 'distL': '0', 'distR': '0', 'simplePos': '0', 'relativeHeight': '0', 'behindDoc': '1', 'locked': '0', 'layoutInCell': '1', 'allowOverlap': '1'})
    anchor.insert(0, E.Element('{' + wp + '}simplePos', x='0', y='0'))
    for index, axis in enumerate(['H', 'V'], 1):
        position = E.Element('{' + wp + '}position' + axis, relativeFrom='page')
        E.SubElement(position, '{' + wp + '}posOffset').text = '0'
        anchor.insert(index, position)
    anchor.insert(4, E.Element('{' + wp + '}wrapNone'))
    page = section.find(f'{{{W}}}pgSz')
    width, height = [str(int(page.get(f'{{{W}}}{key}')) * 635) for key in ['w', 'h']]
    for extent in background.iter():
        if extent.tag in ['{' + wp + '}extent', '{' + a + '}ext']:
            extent.set('cx', width)
            extent.set('cy', height)
    background.find('.//{' + a + '}blip').set('{' + R + '}embed', 'rIdAUBackground')
    background.find('.//{' + wp + '}docPr').set('id', '90002')
    background.find('.//{' + wp + '}docPr').set('name', 'Original cover background')
    props = background.find(f'{{{W}}}pPr')
    props.clear()
    E.SubElement(props, f'{{{W}}}spacing', {f'{{{W}}}after': '0', f'{{{W}}}line': '1', f'{{{W}}}lineRule': 'exact'})
    for item in list(body):
        body.remove(item)
    body.append(background)
    body.append(section)
    if number == 6:
        for extent in logo.iter():
            if extent.tag in ['{' + wp + '}extent', '{' + a + '}ext']:
                extent.set('cx', '800000')
                extent.set('cy', '597333')
    content = [logo, paragraph('Air University', 36, True, 260), paragraph('{documentLabel}', 22, True), paragraph('{coverTitle}', 40, True, 200), paragraph('{courseName}', 26, False, 240), paragraph('Submitted to', 22, True, 60), paragraph('{instructor}', 24, False, 200), paragraph('Submitted by', 22, True, 60), paragraph('{submittedBy}', 24, False, 240), paragraph('Submission date   {dateSubmitted}', 22), paragraph('Generated   {generatedDate}', 18)]
    for p in content:
        body.insert(list(body).index(section), p)
    parts['word/document.xml'] = E.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    relationships = E.fromstring(parts['word/_rels/document.xml.rels'])
    E.SubElement(relationships, '{http://schemas.openxmlformats.org/package/2006/relationships}Relationship', Id='rIdAULogo', Type=R+'/image', Target='media/au-logo.png')
    E.SubElement(relationships, '{http://schemas.openxmlformats.org/package/2006/relationships}Relationship', Id='rIdAUBackground', Type=R+'/image', Target='media/image1.png')
    parts['word/_rels/document.xml.rels'] = E.tostring(relationships)
    parts['word/media/au-logo.png'] = (ROOT / 'public/aulogo.png').read_bytes()
    # Lossless PNG recompression and removal of unused preview metadata reduce downloads.
    for name in list(parts):
        if name.startswith('word/media/') and name.endswith('.png'):
            output = BytesIO()
            Image.open(BytesIO(parts[name])).save(output, format='PNG', optimize=True)
            parts[name] = output.getvalue()
    # All live text uses Arial. Remove the original, now unused embedded fonts.
    font_table = E.fromstring(parts['word/fontTable.xml'])
    for font in font_table:
        for child in list(font):
            if E.QName(child).localname.startswith('embed'):
                font.remove(child)
    parts['word/fontTable.xml'] = E.tostring(font_table)
    for name in list(parts):
        if name.startswith('word/fonts/') or name == 'word/_rels/fontTable.xml.rels':
            del parts[name]
    types = E.fromstring(parts['[Content_Types].xml'])
    for child in list(types):
        if child.get('PartName', '').startswith('/word/fonts/'):
            types.remove(child)
    parts['[Content_Types].xml'] = E.tostring(types)
    output_path = ROOT / f'public/templates/collection/university-{number:02}.docx'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output_path, 'w', ZIP_DEFLATED) as output:
        for name, data in parts.items():
            output.writestr(name, data)
    print(output_path.name, output_path.stat().st_size)
