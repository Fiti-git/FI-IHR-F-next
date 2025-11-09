"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardNavigation from "../header/DashboardNavigation";
import UserChatList1 from "../card/UserChatList1";
import MessageBox from "../element/MessageBox";

export const API_BASE_URL = "http://206.189.134.117:8000";

export default function MessageInfo() {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [errorConversations, setErrorConversations] = useState(null);
  
  // 1. Add state to hold the current user ID
  const [currentUserId, setCurrentUserId] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeConversationId = searchParams.get("conversation_id");

  // This useEffect will now handle all localStorage access
  useEffect(() => {
    // 2. Get user ID from localStorage only on the client side
    const userId = localStorage.getItem("user_id"); // Consistently use "user_id" or "userId"
    setCurrentUserId(userId);
    
    const fetchConversations = async () => {
      setLoadingConversations(true);
      setErrorConversations(null);
      let accessToken = localStorage.getItem("accessToken");

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
  }, []); // Empty dependency array ensures this runs once on mount

  const handleConversationClick = (conversationId) => {
    router.push(`/message?conversation_id=${conversationId}`);
  };

  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Message Center</h2>
            <p className="text">Stay connected and collaborate effectively in real time.</p>
          </div>
        </div>
      </div>
      <div className="row mb40">
        <div className="col-lg-6 col-xl-5 col-xxl-4">
          <div className="message_container">
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
                        className={c.id.toString() === activeConversationId ? "active" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        {/* 3. Pass the user ID from state */}
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
        <div className="col-lg-6 col-xl-7 col-xxl-8">
          {activeConversationId ? (
             // 4. Also pass the user ID from state here
            <MessageBox
              conversationId={activeConversationId}
              currentUserId={currentUserId}
            />
          ) : (
            <div
              className="message_container mt30-md d-flex justify-content-center align-items-center"
              style={{ minHeight: "300px" }}
            >
              <p className="text-muted">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}