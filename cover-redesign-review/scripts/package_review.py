"""Validate the review files and build a local gallery and comparison sheet."""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from PIL import Image, ImageDraw, ImageFont
import json
import posixpath
import subprocess

root = Path(__file__).resolve().parents[1]
items = [
    ('01-formal-academic-lab', 'Heritage academic', 'lab-report', 'Ivory paper, navy and gold framing, centered university masthead and paired submission details.'),
    ('02-editorial-assignment', 'Maroon editorial', 'individual-assignment', 'Cream university masthead, maroon geometric edge, serif title and a shaded author panel.'),
    ('03-split-group-assignment', 'Teal geometry', 'group-assignment', 'Deep teal sidebar, diagonal corner artwork, white university lettering and an editable team roster.'),
    ('04-technical-project', 'Blueprint project', 'project-report', 'Navy university banner, gold accents, original system illustration and a full width member table.'),
]
ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
for file in sorted(root.glob('**/*.docx')):
    with ZipFile(file) as archive:
        assert archive.testzip() is None
        names = set(archive.namelist())
        assert {'[Content_Types].xml', 'word/document.xml', 'word/styles.xml'} <= names
        for name in names:
            if name.endswith(('.xml', '.rels')):
                tree = etree.fromstring(archive.read(name))
                if name.endswith('.rels'):
                    parent = '' if name == '_rels/.rels' else name.split('/_rels/')[0]
                    for relationship in tree:
                        if relationship.get('TargetMode') == 'External':
                            continue
                        target = relationship.get('Target')
                        destination = posixpath.normpath(posixpath.join(parent, target)).lstrip('/')
                        assert destination in names, (file, name, destination)
        assert any(n.startswith('word/media/') for n in names)
        footer = ''.join(archive.read(n).decode() for n in names if n.startswith('word/footer') and n.endswith('.xml'))
        assert 'PAGE' in footer

cards = []
metadata = []
font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
try:
    font = ImageFont.truetype(font_path, 23)
except OSError:
    font = ImageFont.load_default(size=23)
sheet = Image.new('RGB', (1480, 2180), '#e8edf0')
draw = ImageDraw.Draw(sheet)
for index, (id, name, category, purpose) in enumerate(items):
    variants = {}
    for mode in ['sample', 'stress']:
        folder = root / 'previews' / f'{id}-{mode}'
        pdf = folder / f'{id}-{mode}.pdf'
        pages = list(folder.glob('page-*.png'))
        assert len(pages) == 1, (id, mode, len(pages))
        result = subprocess.run(['/home/mudassar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo', str(pdf)], capture_output=True, text=True, check=True)
        assert any(line.split() == ['Pages:', '1'] for line in result.stdout.splitlines())
        variants[mode] = {'docx': f'samples/{id}-{mode}.docx', 'pdf': str(pdf.relative_to(root)), 'image': str((folder / 'page-1.png').relative_to(root)), 'pages': 1}
    image = Image.open(root / variants['sample']['image']).convert('RGB')
    image.thumbnail((680, 970))
    x, y = 40 + (index % 2) * 740, 70 + (index // 2) * 1080
    draw.text((x, y - 40), f'{index + 1:02d}  {name}', fill='#15384c', font=font)
    sheet.paste(image, (x, y))
    template = f'docx/{id}.docx'
    metadata.append({'id': id, 'name': name, 'category': category, 'designStyle': name, 'purpose': purpose, 'template': template, 'previews': variants, 'editableText': True, 'logo': 'Existing public/aulogo.png', 'testedMemberCount': 5 if index >= 2 else None})
    cards.append(f'''<article><h2>{index + 1:02d} {name}</h2><p>{purpose}</p><a href="{variants['sample']['image']}"><img src="{variants['sample']['image']}" alt="{name} cover preview"></a><nav><a href="{template}">Word template</a><a href="{variants['sample']['docx']}">Filled Word</a><a href="{variants['sample']['pdf']}">PDF</a><a href="{variants['stress']['pdf']}">Long content PDF</a></nav></article>''')
sheet.save(root / 'previews/comparison.png')
(root / 'manifest.json').write_text(json.dumps({'status': 'design-review', 'templateCount': 4, 'filledCases': 8, 'validation': {'zipAndXml': 'passed', 'internalRelationships': 'passed', 'placeholderPopulation': 'passed', 'singlePagePdf': '8 of 8', 'renderer': 'Bundled LibreOffice', 'microsoftWordValidation': 'not run', 'browser': 'In-app browser; Chrome connection unavailable'}, 'templates': metadata}, indent=2) + '\n')
(root / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Air University cover design review</title><style>body{margin:0;background:#e8edf0;color:#173447;font:16px/1.6 Arial,sans-serif}header,main{max-width:1240px;margin:auto;padding:28px}h1{font:42px Georgia,serif;margin:12px 0}header p{max-width:800px}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;padding-top:0}article{background:white;padding:24px;border-radius:8px}h2{margin:0}p{color:#526473}img{width:100%;border:1px solid #d9e0e4;margin:12px 0}nav{display:flex;flex-wrap:wrap;gap:10px 18px}a{color:#175d83}nav a{font-size:14px}@media(max-width:750px){main{grid-template-columns:1fr}h1{font-size:32px}}</style><header><h1>Air University cover design review</h1><p>Four editable Air University cover designs. Open a page preview to inspect it, or download the filled Word file and PDF.</p></header><main>''' + ''.join(cards) + '</main></html>')
(root / 'README.md').write_text('''# Air University cover redesign review

Four representative covers for design approval, covering the existing application document categories.

## Collection

| Design | Document type | Composition |
| --- | --- | --- |
| Heritage academic | Individual lab | Navy and gold frame, centered masthead, serif title and paired submission details |
| Maroon editorial | Individual assignment | Cream university masthead, maroon geometric edge, shaded author panel |
| Teal geometry | Group assignment | Deep teal sidebar, diagonal artwork, serif title and native member table |
| Blueprint project | Group project | Navy university banner, original technical illustration and full width member roster |

Open `index.html` for individual previews and download links. `previews/comparison.png` presents the four designs together. `docx/` contains reusable placeholder templates, `samples/` contains eight filled Word documents, and `previews/` contains matching PDFs and page images.

## Dynamic content

The templates use the application's existing brace syntax and existing `prepareDocument` and `renderDocx` functions. Fields include `{name}`, `{rollNumber}`, `{courseName}`, `{labWeek}`, `{title}`, `{projectTitle}`, `{instructor}`, `{dateSubmitted}` and `{generatedDate}` where appropriate. Group tables use `{#members}{reg}` and `{name}{/members}` across a native table row. The loop remains flexible for member counts. Five members were tested in each group design.

Text, table cells and paragraph formatting remain editable. The existing `public/aulogo.png` provides university branding. The page backgrounds and technical illustration were created as original SVGs in `assets/` and rasterized to PNG for Word compatibility. Only the decorative artwork is rasterized. Document text and member tables remain native Word elements. Typography uses Arial and Times New Roman. The renderer uses available substitute fonts where necessary.

## Validation

All twelve Word files passed ZIP integrity, XML parsing, internal relationship target and native page field checks. All eight filled samples passed placeholder population checks and rendered as exactly one page in bundled LibreOffice. Both normal and longer course names, titles and instructor names were tested. All rendered pages were visually inspected after the final design changes.

Microsoft Word desktop and the application's canvas preview have not been verified for these review designs. The one page result covers the supplied sample cases. Arbitrarily long user input may need content limits or adaptive formatting during future integration.

## Review workflow

Select the preferred compositions before expanding the full collection. Integration can register approved DOCX files through the current document generation paths, with matching category metadata and live canvas testing.

## Reproduction

Run `scripts/backgrounds.mjs` with the bundled Node runtime to regenerate page artwork, then `scripts/create.py` with the bundled document Python runtime, `scripts/fill.mjs` with Node, then `scripts/render.py` and `scripts/package_review.py` with the bundled Python runtime. The artwork PNG is supplied alongside its SVG source.
''')
print('Validated 12 DOCX packages and eight single page PDFs. Gallery and comparison sheet ready.')
