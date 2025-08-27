import { Users, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
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
    setGroupCreation,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [selectedTab, setSelectedTab] = useState("chats");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredUsers = showOnlineOnly
    ? friends.filter((user) => onlineUsers.includes(user._id))
    : friends;

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  if (isUsersLoading) return <SidebarSkeleton />;

  if (isGroupLoading) return <SidebarSkeleton />;

  return (
    <>
      <div className="fixed z-50 lg:hidden top-4 left-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 text-white rounded-md shadow bg-primary"
        >
          ☰
        </button>
      </div>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={`fixed z-50 top-0 left-0 h-full bg-base-100 border-r border-base-300 transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0 lg:static lg:flex lg:flex-col w-64`}
      >
        <div className="flex items-center justify-between p-3 border-b border-base-300">
          <button
            onClick={() => setSelectedTab("chats")}
            className={`flex-1 py-2 text-sm font-medium rounded-md ${
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
        <div className="w-full p-5 border-b border-base-300">
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
                ({onlineUsers.length - 1} online)
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full py-3 overflow-y-auto">
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
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 bg-green-500 rounded-full size-3 ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-medium truncate sm:text-base">
                      {user.name}
                    </div>
                    <div className="text-xs text-zinc-400 sm:text-sm">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-zinc-500">
                No online users
              </div>
            ))}
          {selectedTab === "groups" && (
            <>
              {groups.length > 0 ? (
                <>
                  {groups.map((group) => (
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
                      <div className="min-w-0 text-left">
                        <div className="text-sm font-medium truncate sm:text-base">
                          {group.name}
                        </div>
                        <div className="text-xs text-zinc-400 sm:text-sm">
                          Group Chat
                        </div>
                      </div>
                    </button>
                  ))}
                </>
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
