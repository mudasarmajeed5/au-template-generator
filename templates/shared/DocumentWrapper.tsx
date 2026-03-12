import { CSSProperties, ReactNode } from "react";

interface DocumentWrapperProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function DocumentWrapper({ children, style }: DocumentWrapperProps) {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#fff",
        fontFamily: "Times New Roman, Times, serif",
        fontSize: "13pt",
        color: "#000",
        position: "relative",
        boxSizing: "border-box",
        padding: "20mm 22mm 20mm 22mm",
        margin: "0 auto",
        boxShadow: "0 0 12px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
