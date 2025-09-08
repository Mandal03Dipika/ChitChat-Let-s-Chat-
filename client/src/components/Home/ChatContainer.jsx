import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "../../store/useChatStore";
import MessageSkeleton from "../Skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { X } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

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
  const { chatImage } = useThemeStore();
  const messageEndRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    } else if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
    }
    return () => {
      unSubscribeFromMessages();
      unSubscribeFromGroupMessages();
    };
  }, [selectedUser?._id, selectedGroup?._id]);

  useEffect(() => {
    if (messageEndRef.current) {
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
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <ChatHeader />
      <div className="relative flex-1 p-4 space-y-4 overflow-y-auto">
        <div
          className="absolute inset-0 bg-center bg-cover pointer-events-none opacity-60"
          style={{ backgroundImage: `url(${chatImage})` }}
        ></div>
        <div className="relative space-y-4">
          {messages.map((message, index) => {
            const isAuthUser = message.senderId === authUser._id;
            const profilePic = isAuthUser
              ? authUser.profilePic || "/1.jpg"
              : selectedUser?.profilePic || "/1.jpg";

            const isLastMessage = index === messages.length - 1;
            return (
              <div
                key={message._id}
                className={`flex items-end ${
                  isAuthUser ? "justify-end" : "justify-start"
                }`}
                ref={isLastMessage ? messageEndRef : null}
              >
                {!isAuthUser && (
                  <div className="flex-shrink-0 w-8 h-8 mr-2 overflow-hidden rounded-full">
                    <img
                      src={profilePic}
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                    isAuthUser
                      ? "bg-primary text-primary-content"
                      : "bg-base-200"
                  }`}
                >
                  {message.file &&
                    (message.fileType === "image" ||
                      message.fileType?.startsWith("image/")) && (
                      <img
                        src={message.file}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90"
                        onClick={() => setEnlargedImage(message.file)}
                      />
                    )}
                  {message.file &&
                    (message.fileType === "video" ||
                      message.fileType?.startsWith("video/")) && (
                      <video
                        src={message.file}
                        controls
                        className="sm:max-w-[250px] rounded-md mb-2"
                      />
                    )}
                  {message.text && <p className="text-sm">{message.text}</p>}
                </div>
                {isAuthUser && (
                  <div className="flex-shrink-0 w-8 h-8 ml-2 overflow-hidden rounded-full">
                    <img
                      src={profilePic}
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <MessageInput />
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="relative bg-slate-300 rounded-lg p-3 shadow-xl max-w-[90%] max-h-[90%] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="rounded-md object-contain max-w-full max-h-[80vh]"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatContainer;
