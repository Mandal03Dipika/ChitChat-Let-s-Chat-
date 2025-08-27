import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "../../store/useChatStore";
import MessageSkeleton from "../Skeletons/MessageSkeleton";
import { formatMessageTime } from "../../library/utils";
import { useAuthStore } from "../../store/useAuthStore";

function ChatContainer() {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unSubscribeFromMessages,
    subscribeToGroupMessages,
    unSubscribeFromGroupMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unSubscribeFromMessages();
    }
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
      return () => unSubscribeFromGroupMessages();
    }
  }, [
    selectedUser?._id,
    selectedGroup?._id,
    getMessages,
    getGroupMessages,
    subscribeToMessages,
    subscribeToGroupMessages,
    unSubscribeFromMessages,
    unSubscribeFromGroupMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <ChatHeader />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => {
          const isAuthUser = message.senderId === authUser._id;
          const profilePic = isAuthUser
            ? authUser.profilePic || "/1.jpg"
            : selectedUser?.profilePic || "/1.jpg";

          return (
            <div
              key={message._id}
              className={`chat ${isAuthUser ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="border rounded-full size-10">
                  <img src={profilePic} alt="profile pic" />
                </div>
              </div>
              <div className="mb-1 chat-header">
                <time className="ml-1 text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="flex flex-col chat-bubble">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatContainer;
