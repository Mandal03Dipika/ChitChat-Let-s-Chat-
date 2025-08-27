import { Users2, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

function ChatHeader() {
  const {
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    setShowChatInfo,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3"
            onClick={() => setShowChatInfo(true)}
          >
            <div className="avatar">
              <div className="relative rounded-full size-10">
                {selectedUser ? (
                  <img
                    src={selectedUser.profilePic || "/1.jpg"}
                    alt={selectedUser.name}
                  />
                ) : (
                  <img
                    src={selectedGroup.profilePic || "/1.jpg"}
                    alt={selectedGroup.name}
                  />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium">
                {selectedUser ? selectedUser.name : selectedGroup?.name}
              </h3>
              <p className="text-sm text-base-content/70">
                {selectedUser
                  ? onlineUsers.includes(selectedUser._id)
                    ? "Online"
                    : "Offline"
                  : selectedGroup.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setSelectedGroup(null);
            }}
          >
            <X />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatHeader;
