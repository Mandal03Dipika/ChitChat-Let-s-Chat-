import { Ban, Trash2, UserMinus } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

function ChatUserInfo() {
  const {
    selectedUser,
    deleteAllChats,
    blockUser,
    unblockUser,
    unfriendUser,
    blockedUsers,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isBlocked = blockedUsers.includes(selectedUser._id);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto avatar">
        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img
            src={selectedUser.profilePic || "/1.jpg"}
            alt={selectedUser.name}
          />
        </div>
      </div>
      <h2 className="text-xl font-bold">{selectedUser.name}</h2>
      <h3 className="text-lg semi-bold">{selectedUser.email}</h3>
      <p className={`badge ${isOnline ? "badge-success" : "badge-ghost"}`}>
        {isOnline ? "Online" : "Offline"}
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={() => setShowBlockModal(true)}
          className="px-4 btn btn-warning btn-sm rounded-xl"
        >
          <Ban />
          {isBlocked ? "Unblock" : "Block"}
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 btn btn-error btn-sm rounded-xl"
        >
          <Trash2 />
          Delete All Chats
        </button>
        <button
          onClick={() => setShowUnfriendModal(true)}
          className="px-4 btn btn-secondary btn-sm rounded-xl"
        >
          <UserMinus />
          Unfriend
        </button>
      </div>
      {showBlockModal && selectedUser && (
        <ConfirmModal
          title={isBlocked ? "Unblock User" : "Block User"}
          message={`Are you sure you want to ${
            isBlocked ? "unblock" : "block"
          } ${selectedUser.name}?`}
          confirmText={isBlocked ? "Yes, Unblock" : "Yes, Block"}
          confirmColor={isBlocked ? "btn-success" : "btn-warning"}
          onConfirm={() => {
            if (isBlocked) {
              unblockUser(selectedUser._id);
            } else {
              blockUser(selectedUser._id);
            }
            setShowBlockModal(false);
            window.location.href = "/";
          }}
          onCancel={() => setShowBlockModal(false)}
        />
      )}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete All Chats"
          message={`Are you sure you want to delete all chats with ${selectedUser.name}?`}
          confirmText="Yes, Delete"
          confirmColor="btn-error"
          onConfirm={() => {
            deleteAllChats(selectedUser._id);
            setShowDeleteModal(false);
            window.location.href = "/";
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showUnfriendModal && (
        <ConfirmModal
          title="Unfriend User"
          message={`Are you sure you want to unfriend ${selectedUser.name}?`}
          confirmText="Yes, Unfriend"
          confirmColor="btn-secondary"
          onConfirm={() => {
            unfriendUser(selectedUser._id);
            setShowUnfriendModal(false);
            window.location.href = "/";
          }}
          onCancel={() => setShowUnfriendModal(false)}
        />
      )}
    </div>
  );
}

export default ChatUserInfo;
