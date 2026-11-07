/**
 * Browser-side document helpers. Everything here runs in the client so the
 * Download flow never waits on a serverless invocation and never competes with
 * the preview for the main thread.
 */

import {
  DOCX_MIME_TYPE,
  renderDocx,
  type DocumentType,
  type FormData,
  type PreparedDocument,
  type ProjectTemplateVariant,
  type CoverDesignId,
} from "./docx-core";

const templateCache = new Map<string, Promise<ArrayBuffer>>();

/** Fetches a .docx template once per session (static asset, cached forever). */
export function fetchTemplate(templatePath: string): Promise<ArrayBuffer> {
  const cached = templateCache.get(templatePath);
  if (cached) return cached;

  const request = fetch(templatePath).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to load template (${res.status})`);
    }
    return res.arrayBuffer();
  });

  templateCache.set(templatePath, request);
  // Allow a retry after a failed fetch instead of caching the rejection.
  request.catch(() => templateCache.delete(templatePath));
  return request;
}

/** Fills the template for `prepared` entirely in the browser. */
export async function generateDocxBlob(
  prepared: PreparedDocument,
): Promise<Blob> {
  const template = await fetchTemplate(prepared.templatePath);
  const bytes = await renderDocx(template, prepared.payload);
  return new Blob([bytes], { type: DOCX_MIME_TYPE });
}

/** Last-resort fallback: let the server render the document. */
export async function generateDocxViaApi(
  docType: DocumentType,
  formData: FormData,
  templateVariant?: ProjectTemplateVariant,
  coverDesign?: CoverDesignId,
): Promise<Blob> {
  const response = await fetch("/api/generate-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType, formData, templateVariant, coverDesign }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error || "Failed to generate document");
  }

  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
