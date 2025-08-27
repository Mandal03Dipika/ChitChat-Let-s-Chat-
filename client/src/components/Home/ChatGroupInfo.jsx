import { Edit, LogOut } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

function ChatGroupInfo() {
  const { selectedGroup, getUser, setGroupEdit, leaveGroup } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [adminNames, setAdminNames] = useState({});
  const [memberNames, setMemberNames] = useState({});

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!selectedGroup) return;
      try {
        const adminEntries = await Promise.all(
          selectedGroup.admins.map(async (adminId) => {
            const user = await getUser(adminId);
            return [
              adminId,
              {
                id: adminId,
                name: user?.name || "Unknown",
                profilePic: user?.profilePic || null,
              },
            ];
          })
        );
        setAdminNames(Object.fromEntries(adminEntries));
        const memberEntries = await Promise.all(
          selectedGroup.members.map(async (memberId) => {
            const user = await getUser(memberId);
            return [
              memberId,
              {
                id: memberId,
                name: user?.name || "Unknown",
                profilePic: user?.profilePic || null,
              },
            ];
          })
        );
        setMemberNames(Object.fromEntries(memberEntries));
      } catch (error) {
        console.error("Failed to fetch group users:", error.message);
      }
    };
    fetchUserNames();
  }, [selectedGroup]);

  const isGroupAdmin = selectedGroup?.admins?.some(
    (adminId) => adminId === authUser?._id
  );

  const handleLeaveGroup = () => {
    const res = leaveGroup(selectedGroup._id, authUser._id);
    toast.success("Group left successfully!");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={selectedGroup?.profilePic || "/group-default.jpg"}
                alt={selectedGroup?.name}
              />
            </div>
          </div>
          <h2 className="text-xl font-bold">{selectedGroup?.name}</h2>
          <p className="text-sm text-base-content/70">
            {selectedGroup?.description}
          </p>
        </div>
        <div className="divider">Group Details</div>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">Admins:</p>
            {selectedGroup?.admins?.length ? (
              <ul className="list-disc list-inside">
                {selectedGroup.admins.map((admin) => {
                  const user = adminNames[admin];
                  return (
                    <li
                      key={admin}
                      className="flex items-center justify-between p-1 rounded hover:bg-base-200"
                    >
                      <div className="flex gap-2">
                        <div className="relative w-8 h-8">
                          <img
                            src={user?.profilePic || "/group-default.jpg"}
                            alt={user?.name || "User"}
                            className="object-cover w-8 h-8 rounded-full"
                          />
                          {onlineUsers.includes(admin) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <span>{user?.name || "Loading..."}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-base-content/70">
                No admins in this group.
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold">Members:</p>
            {selectedGroup?.members?.length ? (
              <ul className="space-y-1 list-disc list-inside">
                {selectedGroup.members.map((member) => {
                  const user = memberNames[member];
                  return (
                    <li
                      key={member}
                      className="flex items-center justify-between p-1 rounded hover:bg-base-200"
                    >
                      <div className="flex gap-2">
                        <div className="relative w-8 h-8">
                          <img
                            src={user?.profilePic || "/group-default.jpg"}
                            alt={user?.name || "User"}
                            className="object-cover w-8 h-8 rounded-full"
                          />
                          {onlineUsers.includes(member) && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <span>{user?.name || "Loading..."}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-base-content/70">
                No members in this group.
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold">Created At:</p>
            <p>{new Date(selectedGroup?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="divider">Actions</div>
        <div className="flex flex-wrap gap-3">
          <button
            className="flex-1 btn btn-outline btn-error"
            onClick={() => handleLeaveGroup()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Group
          </button>
          {isGroupAdmin && (
            <button
              className="flex-1 btn btn-outline btn-primary"
              onClick={() => setGroupEdit(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Group
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatGroupInfo;
