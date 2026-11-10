"use client";

import Image from "next/image";
import { useRef } from "react";
import { Check } from "lucide-react";
import { Tooltip } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  COVER_DESIGNS,
  type CoverDesignId,
  type DocumentType,
  type PreviewTemplateKey,
  type ProjectTemplateVariant,
} from "@/utils/docx-core";

interface TemplateOption {
  id: PreviewTemplateKey;
  name: string;
  coverDesign?: CoverDesignId;
  projectVariant?: ProjectTemplateVariant;
}

interface TemplatePickerProps {
  docType: DocumentType;
  coverDesign?: CoverDesignId;
  projectTemplate: ProjectTemplateVariant;
  isSingleMember: boolean;
  onSelect: (option: {
    coverDesign?: CoverDesignId;
    projectVariant?: ProjectTemplateVariant;
  }) => void;
}

export function TemplatePicker({
  docType,
  coverDesign,
  projectTemplate,
  isSingleMember,
  onSelect,
}: TemplatePickerProps) {
  const preloadedImages = useRef(new Set<string>());
  const preloadPreview = (id: string) => {
    if (preloadedImages.current.has(id)) return;
    preloadedImages.current.add(id);
    const image = new window.Image();
    image.src = `/templates/previews/${id}.webp`;
    void image.decode().catch(() => {
      preloadedImages.current.delete(id);
    });
  };
  const options: TemplateOption[] = COVER_DESIGNS.filter(
    (design) => design.docType === docType,
  ).map((design) => ({ ...design, coverDesign: design.id }));

  if (docType === "project-report") {
    for (const variant of [1, 2, 3] as const) {
      options.push({
        id: `project-report-${variant}`,
        name: `Original · Style ${variant}`,
        projectVariant: variant,
      });
    }
  } else {
    options.push({
      id: docType === "assignment"
        ? `assignment-${isSingleMember ? "individual" : "group"}`
        : "lab-report",
      name: "Original template",
    });
  }

  const selectedId = coverDesign ?? (
    docType === "project-report"
      ? `project-report-${projectTemplate}`
      : options[options.length - 1].id
  );

  return (
    <aside
      aria-label="Cover templates"
      className="shrink-0 border-b bg-background p-3 md:flex md:min-h-0 md:w-44 md:flex-col md:border-r md:border-b-0"
    >
      <div className="mb-3 shrink-0 px-1">
        <h2 className="text-sm font-semibold">Choose a template</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="hidden md:inline">Hover to enlarge. Click to use.</span>
          <span className="md:hidden">Tap a cover to use it.</span>
        </p>
      </div>
      <Tooltip.Provider delayDuration={100} skipDelayDuration={150}>
        <div className="flex gap-3 overflow-x-auto p-1 md:min-h-0 md:flex-1 md:flex-col md:overflow-x-hidden md:overflow-y-auto">
          {options.map((option) => {
            const selected = option.id === selectedId;
            return (
              <Tooltip.Root key={option.id}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-label={`Use ${option.name}`}
                    aria-pressed={selected}
                    onPointerEnter={() => preloadPreview(option.id)}
                    onFocus={() => preloadPreview(option.id)}
                    onClick={() => onSelect(option)}
                    className={cn(
                      "group relative w-28 shrink-0 rounded-xl border-2 p-2 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:w-full",
                      selected
                        ? "border-primary bg-secondary/60"
                        : "border-transparent hover:border-input hover:bg-card",
                    )}
                  >
                    <Image
                      src={`/templates/previews/${option.id}-thumb.webp`}
                      alt=""
                      width={240}
                      height={311}
                      unoptimized
                      className="aspect-[8.5/11] w-full rounded-sm bg-white object-contain shadow-sm"
                    />
                    {selected && (
                      <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                    )}
                    <span className="mt-2 block text-xs leading-snug font-medium">
                      {option.name}
                    </span>
                    <span className={cn("mt-1 block text-[10px] font-medium", selected ? "text-primary" : "text-muted-foreground")}>
                      {selected ? "Selected" : "Select template"}
                    </span>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    align="center"
                    sideOffset={16}
                    collisionPadding={16}
                    className="template-zoom z-50 hidden max-w-[calc(100vw-2rem)] rounded-2xl border bg-popover p-3 text-popover-foreground shadow-xl md:block"
                  >
                    <Image
                      src={`/templates/previews/${option.id}.webp`}
                      alt={`${option.name} sample cover`}
                      width={850}
                      height={1100}
                      unoptimized
                      className="h-auto max-h-[min(68dvh,620px)] w-auto max-w-[min(40vw,480px)] rounded-sm bg-white object-contain"
                    />
                    <p className="mt-3 text-sm font-semibold">{option.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sample cover · Click the thumbnail to use this design
                    </p>
                    <Tooltip.Arrow className="fill-popover" width={12} height={6} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </div>
      </Tooltip.Provider>
    </aside>
  );
}
