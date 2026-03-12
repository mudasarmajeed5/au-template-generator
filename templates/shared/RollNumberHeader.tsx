interface RollNumberHeaderProps {
  rollNumber: string;
}

export function RollNumberHeader({ rollNumber }: RollNumberHeaderProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "18mm",
        left: "22mm",
        fontSize: "11pt",
      }}
    >
      Roll No: <span>{rollNumber}</span>
    </div>
  );
}
