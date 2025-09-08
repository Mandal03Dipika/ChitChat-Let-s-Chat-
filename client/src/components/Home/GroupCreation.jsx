import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

function GroupCreation() {
  const { friends, setGroupCreation, newGroup } = useChatStore();

  const { authUser } = useAuthStore();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required!");
      return;
    }
    const groupData = {
      name: groupName,
      description,
      members: selectedMembers,
      admins: authUser._id,
      profilePic: groupImage,
    };
    setIsLoading(true);
    try {
      await newGroup(groupData);
      toast.success("Group created successfully!");
      setGroupCreation(false);
    } catch (err) {
      toast.error("Failed to create group");
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
        <h2 className="mb-4 text-xl font-semibold">Create a New Group</h2>
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
              {friends.map((user) => (
                <div key={user._id} className="form-control">
                  <label className="justify-start gap-3 cursor-pointer label">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                    />
                    <span>{user.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setGroupCreation(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default GroupCreation;
