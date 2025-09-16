export default function StatementCard1({ data }) {
  // Map type to generic status label
  // Assuming data.type === 1 means success, else failed
  const typeLabel = data.type === 1 ? "Success" : "Failed";

  // Choose one name to display (try client first, then freelancer)
  const nameToShow = data.client || data.freelancer || "N/A";

  return (
    <tr>
      <td>{data.date}</td>
      <td>
        <span className={typeLabel === "Failed" ? "pending-style style5" : "pending-style style4"}>
          {typeLabel}
        </span>
      </td>
      <td>{nameToShow}</td>
      <td>${data.amount}</td>
    </tr>
  );
}
