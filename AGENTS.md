# AGENTS.md - au-template-generator

## Commands

- `pnpm dev` – start dev server (Next.js)
- `pnpm build` – build Next.js app
- `pnpm lint` – run ESLint
- `pnpm typecheck` – run TypeScript check (`npx tsc --noEmit`)
- `pnpm-workspace.yaml` uses `onlyBuiltDependencies` — if `pnpm install` prompts to approve builds, edit this file rather than answering interactively (breaks CI)

## Project structure

- `app/` – Next.js app router: pages, API routes, constants
- `components/` – React UI: forms (lab/assignment/project), preview renderers, shadcn ui
- `lib/` – utils (`cn` via clsx/tailwind-merge) and Zod schemas for validation
- `utils/doc-generator.ts` – DOCX generation via docxtemplater/pizzip; auto-adds `generatedDate`
- `templates/` – .docx templates: labs/, assignments/, projects/ (variants 1/2/3)
- `app/constants/dashboard.ts` – tab definitions (lab-report, assignment, project-report)

## Preview system (canvas-based, actual .docx)

- `components/preview/WordDocPreview.tsx` renders the actual .docx templates on a `<canvas>` via `@silurus/ooxml` (Rust/WASM parser) — NOT the old React JSX mockups (`LabTemplateRenderer` etc., still present but unused)
- Templates are served by GET `/api/preview-template?key=<key>` where key is one of: `lab-report`, `assignment-individual`, `assignment-group`, `project-report-1|2|3`
- The `key` prop on `WordDocPreview` forces re-render when the current template changes
- `@silurus/ooxml` bundles a WASM asset (`docx_parser_bg.*.wasm`) emitted to `.next/static/media/` — works on Vercel; worker runs via inline `data:` URL
- New .docx preview templates must be added to the `ALLOWED_PATHS` map + `PreviewTemplateKey` union in both `app/api/preview-template/route.ts` and `components/preview/WordDocPreview.tsx`

## Key workflows

**Generate document**: POST to `/api/generate-doc` with `{docType, formData, templateVariant?}`.
- `docType`: "lab-report" | "assignment" | "project-report"
- `formData`: validated via Zod schemas in `lib/schemas.ts`
- `templateVariant`: 1|2|3 for project-report; "individual"|"group" for assignment

**Form patterns**:
- Assignment form toggles between individual and group mode (`isSingleMember` state)
- Group mode requires at least one member with `reg` and `name`
- Project reports always require `members` array (min 1)
- `cn()` from `lib/utils` combines clsx + tailwind-merge

**Template variants**:
- Project report: variants 1, 2, 3 select `templates/projects/project-report-${V}.docx`
- Assignment: "individual" → `assignments/assignment-template-individual.docx`, "group" → group version

## Important quirks

- `generatedDate` is auto-injected by `doc-generator.ts`; do not remove from form data
- API route at `app/api/generate-doc/route.ts` sanitizes filenames; special chars → underscores
- TypeScript `strict` mode; paths `@/*` resolve to `./*`
- ESLint global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`