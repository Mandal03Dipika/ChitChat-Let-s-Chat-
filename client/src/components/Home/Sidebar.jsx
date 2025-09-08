import { Users } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";
import SidebarSkeleton from "../Skeletons/SidebarSkeleton";
import { useAuthStore } from "../../store/useAuthStore";

function Sidebar() {
  const {
    getFriends,
    friends,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    groups,
    getGroups,
    selectedGroup,
    setSelectedGroup,
    isGroupLoading,
    setSidebarOpen,
    sidebarOpen,
    setGroupCreation,
  } = useChatStore();

  const { onlineFriends, getOnlineFriends } = useAuthStore();

  const [selectedTab, setSelectedTab] = useState("chats");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredUsers = useMemo(() => {
    let list = showOnlineOnly
      ? friends.filter((user) => onlineFriends.some((f) => f._id === user._id))
      : friends;
    return [...list].sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );
  }, [friends, showOnlineOnly, onlineFriends]);

  const sortedGroups = useMemo(() => {
    return [...groups].sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );
  }, [groups]);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  useEffect(() => {
    if (friends.length > 0) {
      getOnlineFriends();
    }
  }, [friends, getOnlineFriends]);

  if (isUsersLoading || isGroupLoading) return <SidebarSkeleton />;

  const isOnline = (id) => onlineFriends.some((f) => f._id === id);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={`fixed z-50 top-16 left-0 w-64 bg-base-100 border-r border-base-300 transition-transform duration-300 ease-in-out transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static flex flex-col h-[calc(100vh-4rem)]`}
      >
        <div className="flex items-center justify-between flex-none p-3 border-b border-base-300">
          <button
            onClick={() => setSelectedTab("chats")}
            className={`flex-1 py-2 text-sm font-medium rounded-md mr-2 ${
              selectedTab === "chats" ? "bg-base-300" : "hover:bg-base-200"
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setSelectedTab("groups")}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
              selectedTab === "groups" ? "bg-base-300" : "hover:bg-base-200"
            }`}
          >
            Groups
          </button>
        </div>
        <div className="flex-none w-full p-5 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium lg:block">
              {selectedTab === "chats" ? "Contacts" : "My Groups"}
            </span>
          </div>
          {selectedTab === "chats" && (
            <div className="items-center gap-2 mt-3 lg:flex">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Show online only</span>
              </label>
              <span className="text-xs text-zinc-500">
                ({onlineFriends.length} online)
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-900/10">
          {selectedTab === "chats" &&
            (filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.profilePic || "/1.jpg"}
                      alt={user.name}
                      className="object-cover rounded-full size-12"
                    />
                    {isOnline(user._id) && (
                      <span className="absolute bottom-0 right-0 bg-green-500 rounded-full size-3 ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate sm:text-base">
                        {user.name}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {formatTime(user.lastMessageAt)}
                      </span>
                    </div>
                    <div className="text-xs truncate text-zinc-400 sm:text-sm">
                      {user.lastMessage
                        ? user.lastMessage
                        : isOnline(user._id)
                        ? "Online"
                        : "Offline"}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-zinc-500">
                {showOnlineOnly ? "No online users" : "No friends yet"}
              </div>
            ))}
          {selectedTab === "groups" && (
            <>
              {sortedGroups.length > 0 ? (
                sortedGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSidebarOpen(false);
                    }}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                      selectedGroup?._id === group._id
                        ? "bg-base-300 ring-1 ring-base-300"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={group.profilePic || "/1.jpg"}
                        alt={group.name}
                        className="object-cover rounded-full size-12"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium truncate sm:text-base">
                          {group.name}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {formatTime(group.lastMessageAt)}
                        </span>
                      </div>
                      <div className="text-xs truncate text-zinc-400 sm:text-sm">
                        {group.lastMessage
                          ? group.lastMessage
                          : "No messages yet"}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-zinc-500">
                  No groups yet
                </div>
              )}
              <div className="flex justify-center px-4 mt-4">
                <button
                  onClick={() => {
                    setGroupCreation(true);
                    setSidebarOpen(false);
                  }}
                  className="btn btn-outline btn-primary w-full max-w-[200px]"
                >
                  + Create New Group
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
