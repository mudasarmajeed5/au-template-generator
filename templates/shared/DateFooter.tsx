interface DateFooterProps {
  date: string;
}

export function DateFooter({ date }: DateFooterProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "14mm",
        left: "22mm",
        fontSize: "11pt",
        color: "#c0392b",
        fontStyle: "italic",
      }}
    >
      {date}
    </div>
  );
}
