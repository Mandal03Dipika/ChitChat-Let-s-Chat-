import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import Sidebar from "../components/Home/Sidebar";
import NoChatSelected from "../components/Home/NoChatSelected";
import ChatContainer from "../components/Home/ChatContainer";
import ChatInformation from "../components/Home/ChatInformation";
import GroupCreation from "../components/Home/GroupCreation";
import EditGroupInfo from "../components/Home/EditGroupInfo";

function Home() {
  const {
    selectedUser,
    selectedGroup,
    showChatInfo,
    groupCreation,
    groupEdit,
  } = useChatStore();

  const { bgImage } = useThemeStore();

  const isChatSelected = selectedUser || selectedGroup;

  return (
    <div
      className="relative h-screen transition-all duration-500 bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative flex items-center justify-center h-full px-4 pt-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)] relative z-10">
          <div className="flex h-full overflow-hidden rounded-lg">
            <Sidebar />
            {groupCreation ? (
              <GroupCreation />
            ) : groupEdit ? (
              <EditGroupInfo />
            ) : isChatSelected ? (
              showChatInfo ? (
                <ChatInformation />
              ) : (
                <ChatContainer />
              )
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
