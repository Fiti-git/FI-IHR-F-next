"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

const dummyTickets = [
  {
    id: 1,
    subject: "Issue with payment processing",
    description: "I am unable to receive payment for my last completed project.",
    priority: "High",
    status: "Open",
    relatedProject: { id: 1, type: "Project", name: "Mobile App Development" },
    createdAt: new Date().toISOString(),
    messages: [
      { sender: "user", content: "I haven't received my payment.", timestamp: new Date().toISOString() },
      { sender: "support", content: "Thanks for reaching out. We'll check with the finance team.", timestamp: new Date().toISOString() },
    ],
  },
  {
    id: 2,
    subject: "Bug in job application",
    description: "The job application form crashes when I upload my resume.",
    priority: "Medium",
    status: "In Progress",
    relatedProject: { id: 2, type: "Job", name: "Logo Design Job" },
    createdAt: new Date().toISOString(),
    messages: [],
  },
];

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = Number(params.id);

  const [messageInput, setMessageInput] = useState("");
  const [tickets, setTickets] = useState(dummyTickets);

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  const ticket = ticketIndex !== -1 ? tickets[ticketIndex] : null;

  const titleText = ticket ? `${ticket.relatedProject.name} ticket` : "Support Center";

  const handleSendMessage = () => {
    if (!messageInput.trim() || ticketIndex === -1) return;

    const newMessage = {
      sender: "user",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedTickets = [...tickets];
    updatedTickets[ticketIndex] = {
      ...tickets[ticketIndex],
      messages: [...tickets[ticketIndex].messages, newMessage],
    };

    setTickets(updatedTickets);
    setMessageInput("");
  };

  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>{titleText}</h2>
            <p className="text">Viewing details of your support ticket.</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-12 mb-4">
          <div className="ps-widget bgc-white bdrs4 p30 overflow-hidden position-relative">
            <h4 className="mb-3">Ticket Details</h4>

            {ticket ? (
              <div>
                <h5>{ticket.subject}</h5>
                <p>{ticket.description}</p>
                <p>
                  <strong>Project/Job:</strong> {ticket.relatedProject.type} - {ticket.relatedProject.name}
                </p>
                <p>
                  <strong>Priority:</strong> {ticket.priority} &nbsp;|&nbsp; <strong>Status:</strong> {ticket.status}
                </p>
                <p>
                  <em>Created at: {new Date(ticket.createdAt).toLocaleString()}</em>
                </p>
              </div>
            ) : (
              <p className="text-center">No ticket found for ID: {ticketId}</p>
            )}
          </div>
        </div>

        {/* Chat Box */}
        {ticket && (
          <div className="col-lg-12">
            <div className="ps-widget bgc-white bdrs4 p30 overflow-hidden position-relative">
              <h4 className="mb-3">Messages</h4>

              <div
                className="chat-box"
                style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}
              >
                {ticket.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 d-flex ${
                      msg.sender === "user" ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    <div
                      className="p-2 rounded"
                      style={{
                        maxWidth: "70%",
                        backgroundColor: msg.sender === "user" ? "#28a745" : "#f1f1f1",
                        color: msg.sender === "user" ? "#fff" : "#000",
                      }}
                    >
                      <div>{msg.content}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Field */}
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="form-control"
                  placeholder="Type your message..."
                />
                <button className="btn btn-success" onClick={handleSendMessage}>
  Send
</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
