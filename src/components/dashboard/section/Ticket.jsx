"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = Number(params.id);

  const [messageInput, setMessageInput] = useState("");
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch ticket details from API
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/support/tickets/${ticketId}/`);
        const data = response.data;

        console.log("Ticket details:", data);

        // Transform ticket data
        const ticketData = {
          id: data.ticket.id,
          subject: data.ticket.subject,
          description: data.ticket.description,
          category: data.ticket.category,
          status: data.ticket.status ? data.ticket.status.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Open",
          priority: data.ticket.priority ? data.ticket.priority.charAt(0).toUpperCase() + data.ticket.priority.slice(1) : "Low",
          ticketType: data.ticket.ticket_type,
          referenceId: data.ticket.reference_id,
          referenceTitle: data.ticket.reference_title,
          createdAt: data.ticket.created_at,
          updatedAt: data.ticket.updated_at,
        };

        setTicket(ticketData);
        setUser(data.user);
        setMessages(data.messages || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(err.response?.data?.detail || "Failed to load ticket details.");
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const titleText = ticket ? `${ticket.referenceTitle} ticket` : "Support Center";

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // TODO: Implement API call to send message
    const newMessage = {
      sender: "user",
      sender_id: user?.id,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <div className="dashboard_title_area">
              <h2>Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <div className="dashboard_title_area">
              <h2>Error</h2>
              <p className="text-danger">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <strong>Reference:</strong> {ticket.referenceTitle || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong> {ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1) : "N/A"} &nbsp;|&nbsp;
                  <strong>Priority:</strong> {ticket.priority} &nbsp;|&nbsp;
                  <strong>Status:</strong> {ticket.status}
                </p>
                <p>
                  <em>Created at: {new Date(ticket.createdAt).toLocaleString()}</em>
                </p>
                {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                  <p>
                    <em>Updated at: {new Date(ticket.updatedAt).toLocaleString()}</em>
                  </p>
                )}
                {user && (
                  <p>
                    <strong>User:</strong> {user.username} ({user.roles?.join(", ")})
                  </p>
                )}
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
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
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
                        <div><strong>{msg.sender === "user" ? "You" : "Support"}:</strong></div>
                        <div>{msg.message}</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted">No messages yet.</p>
                )}
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
