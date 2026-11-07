"""Four distinct cover compositions for review, with existing DOCX placeholders."""
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'cover-redesign-review'
LOGO = ROOT / 'public/aulogo.png'
NAVY = '15384C'
GREY = '59636D'
CENTER = WD_ALIGN_PARAGRAPH.CENTER
RIGHT = WD_ALIGN_PARAGRAPH.RIGHT


def xml_element(name, **attributes):
    node = OxmlElement(name)
    for key, value in attributes.items():
        node.set(qn('w:' + key), str(value))
    return node


def text(parent, value='', size=11, font='Arial', bold=False, color='000000',
         before=0, after=8, align=None, style=None):
    p = parent.add_paragraph(style=style)
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.12
    if align is not None:
        p.alignment = align
    run = p.add_run(value)
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    return p


def label(parent, value, **kwargs):
    return text(parent, value.upper(), size=8.5, bold=True, after=5, **kwargs)


def logo(parent, width=0.9, align=None):
    p = parent.add_paragraph()
    p.paragraph_format.space_after = Pt(10)
    if align is not None:
        p.alignment = align
    p.add_run().add_picture(str(LOGO), width=Inches(width))
    p._p.xpath('.//wp:docPr')[0].set('descr', 'Air University logo')
    return p


def spacer(parent, height):
    p = parent.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = Pt(height)
    p.add_run(' ').font.size = Pt(1)


def shade(cell, fill):
    cell._tc.get_or_add_tcPr().append(xml_element('w:shd', fill=fill))


def padding(cell, amount=120):
    margins = xml_element('w:tcMar')
    for side in ['top', 'left', 'bottom', 'right']:
        margins.append(xml_element('w:' + side, w=amount, type='dxa'))
    cell._tc.get_or_add_tcPr().append(margins)


def table(parent, widths):
    t = parent.add_table(rows=1, cols=len(widths))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for column, width in zip(t.columns, widths):
        column.width = Inches(width)
    for cell, width in zip(t.rows[0].cells, widths):
        cell.width = Inches(width)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        cell.paragraphs[0].paragraph_format.space_after = Pt(0)
        cell.paragraphs[0].paragraph_format.line_spacing = Pt(1)
    borders = xml_element('w:tblBorders')
    for side in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        borders.append(xml_element('w:' + side, val='nil'))
    t._tbl.tblPr.append(borders)
    return t


def members(parent, widths, fill='E8EFF3'):
    t = table(parent, widths)
    for cell, title in zip(t.rows[0].cells, ['REGISTRATION', 'TEAM MEMBER']):
        shade(cell, fill)
        padding(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.1
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title)
        r.bold = True
        r.font.size = Pt(8)
    t.rows[0]._tr.get_or_add_trPr().append(xml_element('w:tblHeader'))
    row = t.add_row()
    for cell, value, width in zip(row.cells, ['{#members}{reg}', '{name}{/members}'], widths):
        cell.width = Inches(width)
        padding(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(value)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
    borders = t._tbl.tblPr.find(qn('w:tblBorders'))
    for node in borders:
        node.set(qn('w:val'), 'single')
        node.set(qn('w:sz'), '4')
        node.set(qn('w:color'), 'D9D9D9')
    return t


def base(name, margin=0.85):
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.2677)
    section.page_height = Inches(11.6929)
    section.top_margin = section.bottom_margin = Inches(margin)
    section.left_margin = section.right_margin = Inches(margin)
    section.header_distance = section.footer_distance = Inches(0.4)
    normal = doc.styles['Normal']
    normal.font.name = 'Arial'
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(8)
    for style_name in ['Title', 'Heading 1', 'Heading 2']:
        style = doc.styles[style_name]
        style.font.color.rgb = RGBColor(0, 0, 0)
        for border in style.element.xpath('./w:pPr/w:pBdr'):
            border.getparent().remove(border)
    doc.core_properties.title = name
    doc.core_properties.author = 'Air University'
    doc.core_properties.subject = 'Editable submission cover'
    doc.styles['Footer'].font.name = 'Arial'
    doc.styles['Footer'].font.size = Pt(8)
    footer = section.footer.paragraphs[0]
    footer.alignment = RIGHT
    r = footer.add_run('Air University    /    ')
    r.font.name = 'Arial'
    r.font.size = Pt(8)
    field = xml_element('w:fldSimple', instr='PAGE')
    field.append(OxmlElement('w:r'))
    field[0].append(OxmlElement('w:t'))
    field[0][0].text = '1'
    footer._p.append(field)
    return doc


def save(doc, filename):
    doc.save(OUT / 'docx' / filename)


def background(doc, name):
    """Place an original page illustration behind editable Word content."""
    section = doc.sections[0]
    p = section.header.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = Pt(1)
    picture = p.add_run().add_picture(str(OUT / 'assets' / f'{name}-background.png'),
                                    width=section.page_width, height=section.page_height)
    anchor = picture._inline
    anchor.tag = qn('wp:anchor')
    anchor.attrib.update({'distT': '0', 'distB': '0', 'distL': '0', 'distR': '0',
                         'simplePos': '0', 'relativeHeight': '0', 'behindDoc': '1',
                         'locked': '0', 'layoutInCell': '1', 'allowOverlap': '1'})
    simple = OxmlElement('wp:simplePos')
    simple.set('x', '0')
    simple.set('y', '0')
    anchor.insert(0, simple)
    for index, axis in enumerate(['H', 'V'], 1):
        position = OxmlElement('wp:position' + axis)
        position.set('relativeFrom', 'page')
        offset = OxmlElement('wp:posOffset')
        offset.text = '0'
        position.append(offset)
        anchor.insert(index, position)
    anchor.insert(4, OxmlElement('wp:wrapNone'))
    anchor.find(qn('wp:docPr')).set('descr', 'Decorative geometric page artwork')
    if name == 'formal':
        section.footer_distance = Inches(0.62)
    if name in ['editorial', 'technical']:
        doc.styles['Footer'].font.color.rgb = RGBColor(255, 255, 255)
        for run in section.footer.paragraphs[0]._p.xpath('.//w:r'):
            props = run.find(qn('w:rPr'))
            if props is None:
                props = OxmlElement('w:rPr')
                run.insert(0, props)
            for old in props.findall(qn('w:color')):
                props.remove(old)
            props.append(xml_element('w:color', val='FFFFFF'))


def info(parent, caption, value, size=11, color='000000'):
    label(parent, caption, color=GREY)
    text(parent, value, size, color=color, after=16)


def formal():
    doc = base('Formal academic lab cover', 0.95)
    background(doc, 'formal')
    logo(doc, 1.08, CENTER)
    text(doc, 'AIR UNIVERSITY', 18, font='Times New Roman', bold=True, align=CENTER, after=6)
    text(doc, 'ACADEMIC LABORATORY SUBMISSION', 8, color=GREY, align=CENTER)
    spacer(doc, 42)
    text(doc, 'LAB REPORT', 26, bold=True, align=CENTER, after=22)
    text(doc, '{courseName}', 24, font='Times New Roman', align=CENTER,
         style='Title', after=16)
    text(doc, '{labWeek}', 12, align=CENTER)
    spacer(doc, 46)
    meta = table(doc, [3.0, 3.0])
    left, right = meta.rows[0].cells
    label(left, 'Submitted by', color=GREY)
    text(left, '{name}', 12, bold=True, after=6)
    text(left, '{rollNumber}', 10, color=GREY)
    label(right, 'Submitted to', color=GREY)
    text(right, '{instructor}', 12, bold=True, after=6)
    text(right, 'Course instructor', 10, color=GREY)
    spacer(doc, 35)
    label(doc, 'Date of submission', color=GREY, align=CENTER)
    text(doc, '{dateSubmitted}', 11, align=CENTER)
    save(doc, '01-formal-academic-lab.docx')


def editorial():
    doc = base('Editorial individual assignment cover', 0.85)
    doc.sections[0].right_margin = Inches(1.05)
    background(doc, 'editorial')
    masthead = table(doc, [1.12, 5.1])
    left, right = masthead.rows[0].cells
    logo(left, 0.8)
    text(right, 'AIR UNIVERSITY', 18, bold=True, before=7, after=6)
    text(right, 'ACADEMIC SUBMISSION', 8, color='702E3D')
    spacer(doc, 60)
    text(doc, 'ASSIGNMENT', 29, font='Times New Roman', bold=True, after=26)
    text(doc, '{title}', 25, font='Times New Roman', style='Title', after=16)
    text(doc, '{courseName}', 11, color=GREY, after=18)
    spacer(doc, 25)
    panel = table(doc, [6.15])
    cell = panel.cell(0, 0)
    shade(cell, 'F4ECE6')
    padding(cell, 230)
    label(cell, 'Submitted by', color='702E3D')
    text(cell, '{name}', 13, bold=True, after=6)
    text(cell, '{rollNumber}', 10, color=GREY)
    spacer(doc, 22)
    details = table(doc, [3.5, 2.65])
    instructor, date = details.rows[0].cells
    info(instructor, 'Submitted to', '{instructor}')
    info(date, 'Submission date', '{dateSubmitted}')
    save(doc, '02-editorial-assignment.docx')


def split():
    doc = base('Split layout group assignment cover', 0.65)
    background(doc, 'split')
    layout = table(doc, [1.65, 5.25])
    sidebar, main = layout.rows[0].cells
    padding(sidebar, 80)
    padding(main, 340)
    layout.rows[0].height = Inches(9.2)
    p = logo(sidebar, 1.05, CENTER)
    p._p.get_or_add_pPr().append(xml_element('w:shd', fill='FFFFFF'))
    text(sidebar, 'AIR\nUNIVERSITY', 14, bold=True, color='FFFFFF', after=30)
    text(sidebar, 'GROUP\nSUBMISSION', 9, color='C1E5DF', after=8)
    spacer(sidebar, 44)
    label(sidebar, 'Course', color='C1E5DF')
    text(sidebar, '{courseName}', 10, color='FFFFFF', after=25)
    label(sidebar, 'Submitted to', color='C1E5DF')
    text(sidebar, '{instructor}', 10, color='FFFFFF', after=25)
    label(sidebar, 'Submission', color='C1E5DF')
    text(sidebar, '{dateSubmitted}', 10, color='FFFFFF')
    spacer(main, 55)
    text(main, 'ASSIGNMENT', 26, bold=True, after=22)
    text(main, '{title}', 23, font='Times New Roman', style='Title', after=24)
    spacer(main, 85)
    label(main, 'Submitted by', color=GREY)
    members(main, [1.65, 2.9], fill='DCEFEB')
    save(doc, '03-split-group-assignment.docx')


def technical():
    doc = base('Technical project cover', 0.75)
    background(doc, 'technical')
    masthead = table(doc, [4.9, 1.75])
    left, right = masthead.rows[0].cells
    text(left, 'AIR UNIVERSITY', 19, bold=True, color='FFFFFF', before=7, after=7)
    text(left, 'ACADEMIC PROJECT SUBMISSION', 8, color='DCE7EE', after=0)
    p = logo(right, 0.78, CENTER)
    p._p.get_or_add_pPr().append(xml_element('w:shd', fill='FFFFFF'))
    spacer(doc, 45)
    text(doc, 'PROJECT REPORT', 26, bold=True, after=25)
    panel = table(doc, [1.75, 4.9])
    figure, title = panel.rows[0].cells
    p = figure.add_paragraph()
    p.add_run().add_picture(str(OUT / 'assets/system-structure.png'), width=Inches(1.45))
    padding(title, 100)
    text(title, '{projectTitle}', 23, font='Times New Roman', style='Title', after=16)
    text(title, '{courseName}', 11, color=GREY)
    spacer(doc, 25)
    details = table(doc, [3.8, 2.85])
    left, right = details.rows[0].cells
    info(left, 'Submitted to', '{instructor}')
    info(right, 'Submission date', '{dateSubmitted}')
    spacer(doc, 16)
    label(doc, 'Project team', color=GREY)
    members(doc, [2.0, 4.65], fill='E8EEF2')
    save(doc, '04-technical-project.docx')


formal()
editorial()
split()
technical()
print('Created four editable review templates')
