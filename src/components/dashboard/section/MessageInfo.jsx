"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardNavigation from "../header/DashboardNavigation";
import UserChatList1 from "../card/UserChatList1";
import MessageBox from "../element/MessageBox";

export const API_BASE_URL = "http://127.0.0.1:8000";

export default function MessageInfo() {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorConversations, setErrorConversations] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConversationId = searchParams.get("conversation_id");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);

    const fetchConversations = async () => {
      setLoadingConversations(true);
      setErrorConversations(null);
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setErrorConversations("Authentication token not found. Please log in.");
        setLoadingConversations(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/list/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch conversations.");
        const data = await res.json();
        setConversations(data);
      } catch (error) {
        setErrorConversations(error.message);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  const handleConversationClick = (conversationId) => {
    router.push(`/message?conversation_id=${conversationId}`);
  };

  return (
    <div className="dashboard__content hover-bgc-color">
      {/* ✅ Page Header */}
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Message Center</h2>
            <p className="text">
              Stay connected and collaborate effectively in real time.
            </p>
          </div>
        </div>
      </div>
      <div className="row mb40">
        {/* ✅ LEFT COLUMN — Chat List with Header */}
        <div className="col-lg-6 col-xl-5 col-xxl-4">
          <div className="message_container">
            {/* ✅ Added Header for Chat List */}
            <div className="chat-list-header">
              <h4 className="chat-list-title">User</h4>
            </div>
            {/* ✅ User List */}
            <div className="inbox_user_list">
              <div className="chat-member-list pr20">
                {loadingConversations ? (
                  <p>Loading...</p>
                ) : errorConversations ? (
                  <p className="text-danger">{errorConversations}</p>
                ) : (
                  conversations.map((c) => (
                    <div key={c.id} className="list-item pt5">
                      <a
                        onClick={() => handleConversationClick(c.id)}
                        className={
                          c.id.toString() === activeConversationId ? "active" : ""
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <UserChatList1
                          conversation={c}
                          currentUserId={currentUserId}
                        />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ RIGHT COLUMN — Chat Box */}
        <div className="col-lg-6 col-xl-7 col-xxl-8">
          {activeConversationId ? (
            <MessageBox
              conversationId={activeConversationId}
              currentUserId={currentUserId}
            />
          ) : (
            <div
              className="message_container mt30-md d-flex justify-content-center align-items-center"
              style={{ minHeight: "300px" }}
            >
              <p className="text-muted">
                Select a conversation to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Inline Styles for Header */}
      <style jsx>{`
        .chat-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px 12px 0 0;
        }

        .chat-list-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .new-chat-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .new-chat-btn:hover {
          background: #2563eb;
        }

        @media (prefers-color-scheme: dark) {
          .chat-list-header {
            background: #111827;
            border-color: #374151;
          }
          .chat-list-title {
            color: #f9fafb;
          }
          .new-chat-btn {
            background: #2563eb;
          }
          .new-chat-btn:hover {
            background: #1d4ed8;
          }
        }
      `}</style>
    </div>
  );
}
