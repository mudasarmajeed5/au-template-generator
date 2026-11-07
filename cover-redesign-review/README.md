# Air University cover redesign review

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
