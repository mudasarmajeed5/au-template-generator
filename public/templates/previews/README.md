# Template picker images

These WebP files show the first page of each actual DOCX template, filled with
sample student details. Each template has an 850px image for the hover preview
and a 240px `-thumb` image for the picker. Assignment originals have separate
individual and group images.

When a template changes:

1. Run `node scripts/generate-template-previews.mjs /tmp/au-template-previews`
   with Node 22.18+ to create sample documents from the current templates.
2. Render those documents to PNG with LibreOffice, using the documents skill's
   `render_docx.py` when available. Check the first page visually.
3. Resize the first page proportionally to widths of 850px and 240px, and save
   as `<template-key>.webp` and `<template-key>-thumb.webp` at quality 85.

The picker uses static images so browsing templates does not start additional
Word/WASM viewers or render the form's contents in each thumbnail.
