import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

function EditGroupInfo() {
  const { users, setGroupEdit, selectedGroup, editGroup } = useChatStore();

  const { authUser } = useAuthStore();

  const [groupName, setGroupName] = useState(selectedGroup.name);
  const [description, setDescription] = useState(selectedGroup.description);
  const [groupImage, setGroupImage] = useState(selectedGroup.profilePic);
  const [isLoading, setIsLoading] = useState(false);

  const initialRoles = {};

  selectedGroup.members.forEach((id) => (initialRoles[id] = "member"));
  selectedGroup.admins?.forEach((id) => (initialRoles[id] = "admin"));

  const [userRoles, setUserRoles] = useState(initialRoles);

  const cycleRole = (userId) => {
    setUserRoles((prev) => {
      const current = prev[userId];
      let next = null;
      if (current === null || current === undefined) next = "member";
      else if (current === "member") next = "admin";
      else if (current === "admin") next = null;
      return { ...prev, [userId]: next };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setGroupImage(reader.result);
    };
  };

  const members = Object.entries(userRoles)
    .filter(([_, role]) => role === "member")
    .map(([id]) => id);

  const admins = Object.entries(userRoles)
    .filter(([_, role]) => role === "admin")
    .map(([id]) => id);

  if (!admins.includes(authUser._id)) admins.push(authUser._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required!");
      return;
    }
    const groupData = {
      name: groupName,
      description: description,
      members: members,
      admins: admins,
      profilePic: groupImage,
    };
    setIsLoading(true);
    try {
      const res = await editGroup(groupData, selectedGroup._id);
      toast.success("Group updated successfully!");
    } catch (err) {
      toast.error("Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full p-6 overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-base-100 bg-opacity-80">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
        <h2 className="mb-4 text-xl font-semibold">Update Your Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={groupImage || "/default-group.jpg"}
                alt="Group"
                className="object-cover border-4 rounded-full size-32"
              />
              <label
                htmlFor="group-image"
                className="absolute bottom-0 right-0 p-2 transition-all duration-200 rounded-full cursor-pointer bg-base-content hover:scale-105"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="group-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to upload a group photo
            </p>
          </div>
          <div>
            <label className="label">Group Name*</label>
            <input
              type="text"
              className="w-full input input-bordered"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="w-full textarea textarea-bordered"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Select Members</label>
            <div className="p-3 overflow-y-auto rounded-lg h-60 bg-base-200">
              <div>
                <label className="label">Assign Roles</label>
                <div className="p-3 overflow-y-auto rounded-lg h-60 bg-base-200">
                  {users.map((user) => {
                    const role = userRoles[user._id];
                    let buttonStyle = "bg-gray-300 text-gray-800";
                    if (role === "member")
                      buttonStyle = "bg-blue-500 text-white";
                    else if (role === "admin")
                      buttonStyle = "bg-purple-600 text-white";
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <span>{user.name}</span>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded text-sm transition-all duration-150 ${buttonStyle}`}
                          onClick={() => cycleRole(user._id)}
                        >
                          {role === "admin"
                            ? "Admin"
                            : role === "member"
                            ? "Member"
                            : "None"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setGroupEdit(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              Edit Group
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditGroupInfo;
