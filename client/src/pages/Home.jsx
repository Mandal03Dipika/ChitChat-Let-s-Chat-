import React from "react";
import Sidebar from "../components/Home/Sidebar";
import NoChatSelected from "../components/Home/NoChatSelected";
import ChatContainer from "../components/Home/ChatContainer";
import { useChatStore } from "../store/useChatStore";

function Home() {
  const { selectedUser } = useChatStore();

  return (
    <>
      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center px-4 pt-20">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full overflow-hidden rounded-lg">
              <Sidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
