import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { UserPlus, Check, X } from "lucide-react";
import SidebarSkeleton from "../components/Skeletons/SidebarSkeleton";

function Contacts() {
  const { bgImage } = useThemeStore();
  const {
    getUsers,
    users,
    isUsersLoading,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    toggleFriendRequest,
    sentRequests,
    receivedRequests,
  } = useChatStore();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  if (isUsersLoading) return <SidebarSkeleton />;

  const isRequestSent = (userId) => sentRequests.some((u) => u._id === userId);
  const isRequestReceived = (userId) =>
    receivedRequests.some((u) => u._id === userId);

  return (
    <div
      className="relative h-screen transition-all duration-500 bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative flex items-center justify-center h-full px-4 pt-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-3xl h-[calc(100vh-8rem)] relative z-10 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 text-center text-sm font-medium rounded-md ${
                activeTab === "all" ? "bg-base-300" : "hover:bg-base-200"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 text-center text-sm font-medium rounded-md ${
                activeTab === "requests" ? "bg-base-300" : "hover:bg-base-200"
              }`}
            >
              Requests Received
            </button>
          </div>
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
            {activeTab === "all" &&
              users.map((user) => {
                const sent = isRequestSent(user._id);
                const received = isRequestReceived(user._id);

                return (
                  <div
                    key={user._id}
                    className="flex justify-between w-full gap-3 p-3 transition-colors hover:bg-base-300"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/1.jpg"}
                        alt={user.name}
                        className="object-cover rounded-full size-12"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-sm font-medium truncate sm:text-base">
                          {user.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFriendRequest(user._id)}
                      disabled={received}
                      className={`relative flex items-center justify-center p-4 rounded-full size-12 transition-all duration-300 transform ${
                        sent
                          ? "bg-yellow-500 hover:bg-yellow-600 scale-105 animate-pulse"
                          : received
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
                      }`}
                    >
                      <UserPlus className="w-5 h-5 text-white" />
                      {sent && (
                        <span className="absolute top-0 right-0 px-1 text-xs font-semibold text-white bg-yellow-700 rounded-full translate-x-1/4 -translate-y-1/4">
                          Sent
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}

            {activeTab === "requests" &&
              (receivedRequests.length > 0 ? (
                receivedRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex justify-between w-full gap-3 p-3 transition-colors hover:bg-base-300"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.profilePic || "/1.jpg"}
                        alt={req.name}
                        className="object-cover rounded-full size-12"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-sm font-medium truncate sm:text-base">
                          {req.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(req._id)}
                        className="items-center p-3 bg-green-500 rounded-full size-12 hover:bg-green-600"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(req._id)}
                        className="items-center p-3 bg-red-500 rounded-full size-12 hover:bg-red-600"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-zinc-500">
                  No pending requests
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
