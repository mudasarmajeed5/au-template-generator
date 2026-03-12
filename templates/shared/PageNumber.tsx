interface PageNumberProps {
  page: number;
}

export function PageNumber({ page }: PageNumberProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "14mm",
        right: "18mm",
        backgroundColor: "#555",
        color: "#fff",
        fontSize: "11pt",
        padding: "3px 10px",
        borderRadius: 2,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {page}
    </div>
  );
}
