"use client";
import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../section/MessageInfo";

export default function MessageBox({ conversationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // This useEffect scrolls to the bottom whenever the messages array is updated.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // This useEffect fetches messages when the component loads or the conversationId changes.
  useEffect(() => {
    const fetchMessages = async () => {
      setError(null);
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/messages/${conversationId}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch messages");
        
        const data = await res.json();
        
        // Correctly access the "results" array from the API response object.
        if (data && Array.isArray(data.results)) {
            // Reverse the array to display the oldest messages first (chronological order).
            setMessages(data.results.reverse());
        } else {
            console.warn("API response did not contain a 'results' array:", data);
            setMessages([]); 
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages(); // Fetch on initial load.

      // Set up an interval to poll for new messages every 5 seconds.
      const interval = setInterval(fetchMessages, 5000);
      
      // Clean up the interval when the component unmounts or conversationId changes.
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    if (!messageText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: messageText,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const newMessage = await res.json();
      
      // Optimistically update the UI with the new message for a better UX.
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="message_container d-flex flex-column">
      <div
        className="messages_area flex-grow-1 p-3 border rounded"
        style={{ overflowY: "auto", height: "400px" }}
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex mb-2 ${
                // The sender ID from the API is likely an integer.
                // Comparing with .toString() is a safe way to avoid type issues.
                msg.sender.toString() === currentUserId ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 rounded ${
                  msg.sender.toString() === currentUserId
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "75%" }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="d-flex mt-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}