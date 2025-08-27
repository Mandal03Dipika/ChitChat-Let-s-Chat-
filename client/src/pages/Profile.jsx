import { Camera, Mail, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

function Profile() {
  const { authUser, isUpdatingProfile, update } = useAuthStore();
  const { bgImage } = useThemeStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imgElement = new window.Image();
      imgElement.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 300;
        const scaleSize = maxWidth / imgElement.width;
        canvas.width = maxWidth;
        canvas.height = imgElement.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;
            const compressedReader = new FileReader();
            compressedReader.onloadend = async () => {
              const compressedBase64 = compressedReader.result;
              setSelectedImg(compressedBase64);
              await update({ profilePic: compressedBase64 });
            };
            compressedReader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.6
        );
      };
      imgElement.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="relative min-h-screen transition-all duration-500 bg-center bg-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative pt-20">
        <div className="max-w-2xl p-4 py-8 mx-auto">
          <div className="relative z-10 p-6 space-y-8 bg-base-300 rounded-xl">
            <div className="text-center">
              <h1 className="text-2xl font-semibold ">Profile</h1>
              <p className="mt-2">Your profile information</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/1.jpg"}
                  alt="Profile"
                  className="object-cover w-32 h-32 border-4 rounded-full"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer transition-all duration-200
                    ${
                      isUpdatingProfile
                        ? "animate-pulse pointer-events-none"
                        : ""
                    }
                  `}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Uploading..."
                  : "Click the camera icon to update your photo"}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <User className="w-4 h-4" /> Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.name}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4" /> Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.email}
                </p>
              </div>
            </div>
            <div className="p-6 mt-6 bg-base-300 rounded-xl">
              <h2 className="mb-4 text-lg font-medium">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
