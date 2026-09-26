# AGENTS.md - au-template-generator

## Commands

- `pnpm dev` – start dev server (Next.js)
- `pnpm build` – build Next.js app
- `pnpm lint` – run ESLint
- `pnpm typecheck` – run TypeScript check (`npx tsc --noEmit`)
- `pnpm test` – Node smoke test (`scripts/smoke-test.mjs`): generates all 6 document variants
- `pnpm-workspace.yaml` uses `onlyBuiltDependencies` — if `pnpm install` prompts to approve builds, edit this file rather than answering interactively (breaks CI)

## Project structure

- `app/` – Next.js app router: `page.tsx` (client UI), API fallback route, constants
- `app/api/generate-doc/route.ts` – server fallback only; primary generation is client-side
- `components/preview/` – `PreviewSection` (memoized panel) + `WordDocPreview` (`@silurus/ooxml` canvas)
- `components/` – UI (forms live in `app/page.tsx`, shadcn ui under `components/ui/`)
- `lib/` – `cn` util (`lib/utils.ts`) and Zod schemas (`lib/schemas.ts`)
- `utils/docx-core.ts` – isomorphic core: template paths, payload shaping, filename, `renderDocx` (dynamic `docxtemplater`/`pizzip`), `generatedDate`
- `utils/docx-client.ts` – browser helpers: template cache/fetch, `generateDocxBlob`, API fallback, `downloadBlob`
- `utils/doc-generator.ts` – server wrapper around `docx-core` (reads templates from `public/`)
- `public/templates/` – single source of .docx templates: labs/, assignments/, projects/ (variants 1/2/3); served statically at `/templates/...`
- `app/constants/dashboard.ts` – tab definitions (lab-report, assignment, project-report)

## Preview system (@silurus/ooxml canvas, actual .docx, filled data)

- `components/preview/WordDocPreview.tsx` renders the filled .docx on a `<canvas>` via `@silurus/ooxml` (Rust/WASM `DocxViewer`, lazy `import("@silurus/ooxml/docx")`) — NOT the old React JSX mockups (`LabTemplateRenderer` etc., still present but unused); `docx-preview` was tried and rejected (poor fidelity)
- Preview shows **filled form data**: `prepareDocument` → `generateDocxBlob` → `viewer.load(arrayBuffer)`; one `DocxViewer` instance per mount (reused via `load()`, `destroy()`ed on unmount; loads are serialized through a promise chain)
- Renders are debounced 400 ms + `requestIdleCallback`, cancellable; `paused` while a download runs
- `PreviewSection` subscribes to the active form with `useWatch({ control })` — `app/page.tsx` must NOT `watch()` forms or keep preview state (typing would re-render the whole page)
- Templates are fetched from static `/templates/<path>.docx` (no API route); `templates/` at repo root no longer exists
- New preview templates: add the file under `public/templates/`, then add its key to `TEMPLATE_PATHS` + `previewKeyFor`/`templatePathFor` in `utils/docx-core.ts` and the `PreviewTemplateKey` union in `components/preview/WordDocPreview.tsx`

## Key workflows

**Download (primary path, client-side)**: `app/page.tsx` `handleSubmit` → `prepareDocument` (`utils/docx-core.ts`) → `generateDocxBlob` (fetch static template + `renderDocx` in browser) → `downloadBlob`. No serverless invocation; independent of preview.
**Fallback**: if client generation throws, POST `/api/generate-doc` with `{docType, formData, templateVariant?}` (Node runtime, same `docx-core` logic).

- `docType`: "lab-report" | "assignment" | "project-report"
- `formData`: validated via Zod schemas in `lib/schemas.ts`
- `templateVariant`: 1|2|3 for project-report; "individual"|"group" for assignment
- Payload shaping (in `prepareDocument`): `isSingleMember === true` → individual (drop `members`), `=== false` → group (drop `name`), `undefined` → legacy behavior (variant from `members.length`). Keep this in sync with old client behavior.

**Form patterns**:
- Assignment form toggles between individual and group mode (`isSingleMember` state)
- Group mode requires at least one member with `reg` and `name`
- Project reports always require `members` array (min 1)
- All field-level validation errors render via `FieldError` in `app/page.tsx` — required fields must show their error on failed submit (assignment/project require `instructor` + `courseName`)
- `cn()` from `lib/utils` combines clsx + tailwind-merge

**Template variants**:
- Project report: variants 1, 2, 3 → `public/templates/projects/project-report-${V}.docx`
- Assignment: "individual" → `assignments/assignment-template-individual.docx`, "group" → group version

## Important quirks

- `generatedDate` is auto-injected by `utils/docx-core.ts`; do not remove from form data
- Filename sanitization (special chars → underscores) happens in `prepareDocument` (`utils/docx-core.ts`); `Date.now()` is appended for project filenames, so `filename` is excluded from the preview change-key
- TypeScript `strict` mode, no `any`; paths `@/*` resolve to `./*`
- ESLint global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
- Bundle budget (measured): ~5570 KB total static JS+wasm with `@silurus/ooxml` (wasm + render worker + viewer chunk, all lazy — first load ~697 KB); `@silurus/ooxml`/`docxtemplater`/`pizzip` must stay in lazy chunks — don't import them statically from `app/page.tsx`
