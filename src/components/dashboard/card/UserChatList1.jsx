// This component currently does not require "use client" unless it directly uses hooks or interactivity.
// If you add client-side interactions or state to *this specific component*, you'd add:
// "use client";

import Image from "next/image";

export default function UserChatList1({ conversation, currentUserId }) {
  if (!conversation || !conversation.participants) {
    return null; // Or render a placeholder
  }

  // Find the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.id.toString() !== currentUserId // Ensure ID comparison is consistent (string/number)
  );

  // You might want to display the other participant's name
  const displayName = otherParticipant ? otherParticipant.username : "Unknown User";

  return (
    <>
      <div className="d-flex align-items-center position-relative">
        {/* Placeholder for user avatar if you have one */}
        {/* <Image src="/path/to/avatar.jpg" alt="avatar" width={40} height={40} className="rounded-circle mr-3" /> */}
        <div className="d-sm-flex flex-grow-1 align-items-center justify-content-between">
          <div className="d-inline-block">
            <div className="fz15 fw500 dark-color ff-heading mb-0">
              {displayName}
            </div>
          </div>
          <div className="iul_notific text-end">
            {/* You can add dynamic elements like last message time or unread count here later */}
          </div>
        </div>
      </div>
    </>
  );
}