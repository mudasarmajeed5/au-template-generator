"use client";

import { useState, ReactNode } from "react";
import { ZoomControls } from "./ZoomControls";

interface PreviewPanelProps {
  children: (zoom: number) => ReactNode;
}

export function PreviewPanel({ children }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(0.5);

  const handleZoomIn = () => setZoom(Math.min(1, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.2, zoom - 0.1));
  const handleReset = () => setZoom(0.5);

  return (
    <div className="w-1/2 bg-slate-100 p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm text-slate-500 uppercase tracking-wider">
          <span className="font-extrabold">Preview</span> - Final output may
          vary.
        </h3>
        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>

      <div className="flex-1 overflow-auto bg-slate-200/50 rounded-lg flex items-center justify-center">
        {children(zoom)}
      </div>
    </div>
  );
}
