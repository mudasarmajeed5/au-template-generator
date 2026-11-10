import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div role="group" aria-label="Preview zoom" className="flex items-center gap-0.5 rounded-full border bg-card p-1">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= 0.2}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-30"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <output aria-live="polite" className="w-10 text-center text-xs font-medium text-foreground tabular-nums">
        {Math.round(zoom * 100)}%
      </output>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= 1}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-30"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button
        type="button"
        onClick={onReset}
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
        title="Reset zoom"
        aria-label="Reset zoom"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}
