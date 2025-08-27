import { useChatStore } from "../../store/useChatStore";
import { ArrowLeft, Users2 } from "lucide-react";
import ChatUserInfo from "./ChatUserInfo";
import ChatGroupInfo from "./ChatGroupInfo";

function ChatInformation() {
  const { selectedUser, selectedGroup, setShowChatInfo } = useChatStore();

  return (
    <>
      <div className="w-full h-full p-6 overflow-y-auto">
        <button
          onClick={() => setShowChatInfo(false)}
          className="flex items-center gap-2 mb-6 btn btn-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chat
        </button>
        <div className="p-6 space-y-6 rounded-lg shadow bg-base-100">
          {selectedUser ? (
            <ChatUserInfo />
          ) : selectedGroup ? (
            <ChatGroupInfo />
          ) : (
            <div className="text-center text-base-content/60">
              <Users2 className="w-12 h-12 mx-auto mb-2" />
              No chat selected
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatInformation;
