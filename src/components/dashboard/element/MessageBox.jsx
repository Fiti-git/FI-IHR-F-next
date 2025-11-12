"use client";
import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../section/MessageInfo";

// ✨ NEW HELPER: Creates the correct WebSocket URL (ws:// or wss://)
const getWebSocketURL = (httpUrl) => {
  const url = new URL(httpUrl);
  // In production, your API might be served over HTTPS
  const protocol = url.protocol === "https:" ? "wss://" : "ws://";
  return `${protocol}${url.host}`;
};

export default function MessageBox({ conversationId, currentUserId ,onBack, chatName}) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✨ NEW: Use a ref to hold the WebSocket object.
  // This ensures the connection persists across component re-renders.
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Helper Functions (No changes here) ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    const options = { hour: "numeric", minute: "numeric" };
    const timeString = date.toLocaleTimeString([], options);
    if (diff < oneDay && date.getDate() === now.getDate()) {
      return `Today, ${timeString}`;
    } else if (diff < 2 * oneDay && date.getDate() === now.getDate() - 1) {
      return `Yesterday, ${timeString}`;
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + timeString;
  };

  // --- 🔧 CORE LOGIC: This useEffect is now completely refactored ---
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // 1. Fetch the initial message history via REST API
    const fetchInitialMessages = async () => {
      setLoading(true);
      setError(null);
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/messages/${conversationId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch message history.");
        const data = await res.json();
        const sorted = [...(data.results || [])].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMessages();

    // 2. Establish the WebSocket connection for real-time updates
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return; // Can't connect without a token

    const wsUrl = getWebSocketURL(API_BASE_URL);
    // This URL format matches your backend routing.py and the new middleware.py
    const socket = new WebSocket(
      `${wsUrl}/ws/chat/${conversationId}/?token=${accessToken}`
    );

    socket.onopen = () => console.log("WebSocket connection established.");
    socket.onclose = () => console.log("WebSocket connection closed.");
    socket.onerror = (err) => {
      console.error("WebSocket error: ", err);
      setError("Real-time connection failed. Please refresh the page.");
    };

    // This is the most important part: listening for new messages
    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      // Add the new message to the state to display it in the UI
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Store the socket instance in the ref
    ws.current = socket;

    // 3. Cleanup: Close the WebSocket connection when the component unmounts
    // or when the conversationId changes.
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [conversationId]); // This effect re-runs if the user switches to a different conversation

  // --- 🔧 MODIFIED: The send handler now uses the WebSocket ---
  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // Check if the WebSocket is connected and ready
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // The backend consumer expects a JSON object with a "message" key
      ws.current.send(JSON.stringify({ message: messageText }));
      setMessageText(""); // Clear the input field
    } else {
      console.error("Cannot send message, WebSocket is not open.");
      // Optionally show an error to the user
    }
  };

  // --- The JSX (View) remains exactly the same as before ---
return (
  <>
    <div className="message-box">
      {/* Conversation Header */}
      <div className="message-header">
        <div className="chat-info">
          <h3 className="chat-name">{chatName || "Conversation"}</h3>
        </div>
      </div>

      <div className="messages-area">
        {loading ? (
          <p className="info-text">Loading messages...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : messages.length === 0 ? (
          <p className="info-text">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, i) => {
            const isSent = msg.sender.toString() === currentUserId;
            const showTime =
              i === 0 ||
              new Date(msg.timestamp).getTime() -
                new Date(messages[i - 1].timestamp).getTime() >
                5 * 60 * 1000;

            return (
              <div
                key={msg.id}
                className={`message-row ${isSent ? "sent" : "received"}`}
              >
                <div
                  className={`message-bubble ${
                    isSent ? "sent-bubble" : "received-bubble"
                  }`}
                >
                  {msg.text}
                </div>
                {showTime && (
                  <span className="timestamp">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="message-form">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>

    <style jsx>{`
      .message-box {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      /* ✅ Header styles */
      .message-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: #f3f4f6;
        border-bottom: 1px solid #e5e7eb;
      }

      .back-button {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #374151;
      }

      .chat-info {
        display: flex;
        flex-direction: column;
      }

      .chat-name {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }

      .chat-status {
        font-size: 12px;
        color: #10b981;
      }

      /* Existing styles below */
      .messages-area {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        height: 420px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #f9fafb;
      }

      .message-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .message-row.sent {
        align-items: flex-end;
      }

      .message-bubble {
        padding: 10px 14px;
        border-radius: 16px;
        max-width: 75%;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .sent-bubble {
        background: #3b82f6;
        color: #fff;
        border-bottom-right-radius: 4px;
      }

      .received-bubble {
        background: #e5e7eb;
        color: #111;
        border-bottom-left-radius: 4px;
      }

      .timestamp {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 2px;
        align-self: center;
      }

      .message-form {
        display: flex;
        padding: 12px;
        border-top: 1px solid #e5e7eb;
        background: #fff;
        gap: 8px;
      }

      .message-form input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: all 0.2s ease;
      }

      .message-form input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      .message-form button {
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0 18px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .message-form button:hover {
        background: #2563eb;
      }

      .info-text {
        text-align: center;
        color: #6b7280;
        font-size: 14px;
        margin-top: 20px;
      }

      .error-text {
        text-align: center;
        color: #ef4444;
        font-size: 14px;
        margin-top: 20px;
      }

      @media (prefers-color-scheme: dark) {
        .message-box {
          background: #1f2937;
          border-color: #374151;
        }
        .message-header {
          background: #111827;
          border-bottom: 1px solid #374151;
        }
        .chat-name {
          color: #f9fafb;
        }
        .chat-status {
          color: #10b981;
        }
        .messages-area {
          background: #111827;
        }
        .message-bubble.received-bubble {
          background: #374151;
          color: #f9fafb;
        }
        .timestamp {
          color: #9ca3af;
        }
        .message-form {
          background: #1f2937;
          border-color: #374151;
        }
        .message-form input {
          background: #111827;
          color: #f3f4f6;
          border-color: #374151;
        }
      }
    `}</style>
  </>
);

}
