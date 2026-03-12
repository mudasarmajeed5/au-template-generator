export function AULogo() {
  return (
    <img
      src="/aulogo.png"
      alt="Air University Logo"
      style={{ width: 280, height: "auto", display: "block", margin: "0 auto" }}
      onError={(e) => {
        // fallback: render text-based logo if image fails
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
