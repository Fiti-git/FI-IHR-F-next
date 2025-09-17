"use client";

import { useState } from "react";

export default function ContactUsForm() {
  const [contactMethod, setContactMethod] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Contact Method: ${contactMethod}`);
  };

  return (
    <form onSubmit={handleSubmit} className="contact-us-form" style={{ maxWidth: 400, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 10 }}>
          <input
            type="radio"
            name="contactMethod"
            value="Phone"
            checked={contactMethod === "Phone"}
            onChange={() => setContactMethod("Phone")}
            style={{ marginRight: 8 }}
          />
          Phone
        </label>
        <small style={{ display: "block", marginBottom: 15, color: "#555" }}>
          We'll call you back at your number.
        </small>

        <label style={{ display: "block", marginBottom: 10 }}>
          <input
            type="radio"
            name="contactMethod"
            value="Chat"
            checked={contactMethod === "Chat"}
            onChange={() => setContactMethod("Chat")}
            style={{ marginRight: 8 }}
          />
          Chat
        </label>
        <small style={{ color: "#555" }}>
          Chat online with a representative.
        </small>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" onClick={() => alert("Cancelled")} style={{ padding: "8px 16px" }}>
          Cancel
        </button>
        <button type="button" onClick={() => alert("Previous clicked")} style={{ padding: "8px 16px" }}>
          Previous
        </button>
        <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#ff9900", color: "white", border: "none" }}>
          Submit
        </button>
      </div>
    </form>
  );
}
