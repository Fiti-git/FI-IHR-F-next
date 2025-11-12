"use client";
import Image from "next/image";

export default function UserChatList1({ conversation, currentUserId }) {
  if (!conversation || !conversation.participants) return null;

  const otherParticipant = conversation.participants.find(
    (p) => p.id.toString() !== currentUserId
  );
  if (!otherParticipant) return null;

  const displayName =
    otherParticipant.username ||
    otherParticipant.email ||
    "Unknown User";
  const userImage = otherParticipant.image || otherParticipant.avatar || null;

  const getInitials = (name) => {
    if (!name) return "U";
    if (name.includes("@")) return name.split("@")[0][0].toUpperCase();
    const words = name.trim().split(" ");
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name[0].toUpperCase();
  };

  const initials = getInitials(displayName);

  const getAvatarColor = (id) => {
    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#10b981",
      "#ec4899",
      "#6366f1",
      "#f97316",
      "#14b8a6",
      "#ef4444",
    ];
    return colors[id % colors.length];
  };

  const avatarColor = getAvatarColor(otherParticipant.id);

  return (
    <>
      <div className="user-card">
        {/* Avatar + Name */}
        <div className="user-info">
          {userImage ? (
            <Image
              src={userImage}
              alt={`${displayName} avatar`}
              width={44}
              height={44}
              className="user-avatar"
            />
          ) : (
            <div
              className="user-avatar-placeholder"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}

          <div className="user-details">
            <span className="user-name">{displayName}</span>
          </div>
        </div>

        {/* Optional right-side info */}
        <div className="user-extra">{/* Placeholder */}</div>
      </div>

      {/* CSS in the same file */}
      <style jsx>{`
        .user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .user-card:hover {
          background: #f9fafb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 15px;
          font-weight: 500;
          color: #111827;
        }

        .user-extra {
          font-size: 12px;
          color: #9ca3af;
        }

        /* Optional dark mode support */
        @media (prefers-color-scheme: dark) {
          .user-card {
            background: #1f2937;
            border-color: #374151;
            box-shadow: 0 1px 4px rgba(255, 255, 255, 0.05);
          }
          .user-card:hover {
            background: #2d3748;
          }
          .user-name {
            color: #f3f4f6;
          }
          .user-extra {
            color: #9ca3af;
          }
        }
      `}</style>
    </>
  );
}
