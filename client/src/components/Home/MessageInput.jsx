import { Image, Video as VideoIcon, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

function MessageInput() {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const {
    sendMessages,
    sendGroupMessages,
    selectedGroup,
    selectedUser,
  } = useChatStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (
      !selectedFile.type.startsWith("image/") &&
      !selectedFile.type.startsWith("video/")
    ) {
      toast.error("Only images and videos are allowed");
      return;
    }
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    let fileData = null;
    if (file) {
      fileData = await fileToBase64(file);
    }
    const messageData = {
      text: text.trim(),
      file: fileData,
      fileType: file ? file.type : null,
    };
    try {
      if (selectedGroup) await sendGroupMessages(messageData);
      else if (selectedUser) await sendMessages(messageData);
      else {
        toast.error("No user or group selected");
        return;
      }
      setText("");
      removeFile();
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const renderFilePreview = () => {
    if (!filePreview) return null;
    if (file?.type.startsWith("image/")) {
      return (
        <img
          src={filePreview}
          alt="Preview"
          className="w-24 h-24 border rounded-lg"
        />
      );
    }
    if (file?.type.startsWith("video/")) {
      return (
        <video
          src={filePreview}
          controls
          className="w-32 h-24 border rounded-lg"
        />
      );
    }
  };

  return (
    <div className="w-full p-4">
      {filePreview && (
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            {renderFilePreview()}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="w-full rounded-lg input input-bordered input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={() => fileInputRef.current?.click()}
          >
            {file?.type?.startsWith("video/") ? (
              <VideoIcon size={20} />
            ) : (
              <Image size={20} />
            )}
          </button>
        </div>
        <button
          type="submit"
          className="p-2 btn btn-circle bg-primary"
          disabled={!text.trim() && !file}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
