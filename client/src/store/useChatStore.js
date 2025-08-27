import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  blockedUsers: [],
  selectedUser: null,
  isUsersLoading: false,
  isUserLoading: false,
  isMessagesLoading: false,
  selectedGroup: null,
  groups: [],
  showChatInfo: false,
  isGroupsLoading: false,
  groupCreation: false,
  groupEdit: false,
  friendRequests: [],
  friends: [],
  sentRequests: [],
  receivedRequests: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    const socket = useAuthStore.getState().socket;
    socket.emit("getUsersForSidebar", {}, (response) => {
      if (response.success) {
        set({ users: response.users });
      } else {
        toast.error(response.error || "Failed to fetch users");
      }
      set({ isUsersLoading: false });
    });
  },

  getUser: async (userId) => {
    set({ isUserLoading: true });
    const socket = useAuthStore.getState().socket;
    return new Promise((resolve, reject) => {
      socket.emit("getUser", { userId }, (response) => {
        set({ isUserLoading: false });
        if (response.success) {
          resolve(response.user);
        } else {
          toast.error(response.error || "Failed to fetch user");
          reject(response);
        }
      });
    });
  },

  getMessages: async (receiverId) => {
    set({ isMessagesLoading: true });
    const { socket, authUser } = useAuthStore.getState();
    if (!socket || !authUser?._id) {
      toast.error("User not authenticated");
      set({ isMessagesLoading: false });
      return;
    }
    socket.emit(
      "getMessages",
      {
        senderId: authUser._id,
        receiverId: receiverId,
      },
      (response) => {
        if (response.success) {
          set({ messages: response.messages });
        } else {
          toast.error(response.error || "Failed to get messages");
        }
        set({ isMessagesLoading: false });
      }
    );
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !selectedUser || !authUser) {
      return toast.error("Missing socket, user, or auth data");
    }
    const { text, file } = messageData;
    if (!text && !file) {
      return toast.error("Message must have text or an image");
    }
    const payload = {
      ...messageData,
      senderId: authUser._id,
      receiverId: selectedUser._id,
    };
    socket.emit("sendMessage", payload, (response) => {
      if (response.success) {
        set({ messages: [...messages, response.message] });
      } else {
        toast.error(response.error || "Failed to send message");
      }
    });
  },

  deleteAllChats: async (otherUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) {
      toast.error("User not authenticated");
      return;
    }
    socket.emit(
      "deleteAllChats",
      { userId: authUser._id, otherUserId },
      (response) => {
        if (response.success) {
          toast.success("All chats deleted");
          set({ messages: [] });
        } else {
          toast.error(response.error || "Failed to delete chats");
        }
      }
    );
  },

  blockUser: async (blockUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) {
      toast.error("User not authenticated");
      return;
    }
    socket.emit(
      "blockUser",
      { userId: authUser._id, blockUserId },
      (response) => {
        if (response.success) {
          toast.success("User blocked");
          set((state) => ({
            blockedUsers: [...state.blockedUsers, blockUserId],
          }));
        } else {
          toast.error(response.error || "Failed to block user");
        }
      }
    );
  },

  unblockUser: async (unblockUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) {
      toast.error("User not authenticated");
      return;
    }
    socket.emit(
      "unblockUser",
      { userId: authUser._id, unblockUserId },
      (response) => {
        if (response.success) {
          toast.success("User unblocked");
          set((state) => ({
            blockedUsers: state.blockedUsers.filter(
              (id) => id !== unblockUserId
            ),
          }));
        } else {
          toast.error(response.error || "Failed to unblock user");
        }
      }
    );
  },

  subscribeToBlockedUsers: () => {
    const socket = useAuthStore.getState().socket;
    socket.on("userBlocked", ({ blockUserId }) => {
      const { selectedUser } = get();
      if (selectedUser && selectedUser._id === blockUserId) {
        set({ messages: [] });
        toast("This user has been blocked");
      }
    });
  },

  unSubscribeFromBlockedUsers: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("userBlocked");
  },

  subscribeToDeletedChats: () => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    const socket = useAuthStore.getState().socket;
    socket.on("chatsDeleted", ({ userId, otherUserId }) => {
      if (
        selectedUser &&
        ((authUser._id === userId && selectedUser._id === otherUserId) ||
          (authUser._id === otherUserId && selectedUser._id === userId))
      ) {
        set({ messages: [] });
        toast("Chats were cleared by the other user");
      }
    });
  },

  unSubscribeFromDeletedChats: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("chatsDeleted");
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  getGroups: async () => {
    const { authUser, socket } = useAuthStore.getState();
    if (!authUser || !socket) {
      return toast.error("Socket or user not found");
    }
    socket.emit("getGroupsForSidebar", { userId: authUser._id }, (response) => {
      if (response.success) {
        set({ groups: response.groups });
      } else {
        toast.error(response.error || "Failed to fetch groups");
      }
    });
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    const socket = useAuthStore.getState().socket;
    socket.emit("getGroupMessages", { groupId }, (response) => {
      if (response.success) {
        set({ messages: response.messages });
      } else {
        toast.error(response.error || "Failed to get group messages");
      }
      set({ isMessagesLoading: false });
    });
  },

  sendGroupMessages: async (messageData) => {
    const { selectedGroup, messages } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser || !selectedGroup) {
      toast.error("Missing required information to send message");
      return;
    }
    const payload = {
      ...messageData,
      groupId: selectedGroup._id,
      senderId: authUser._id,
    };
    socket.emit("sendGroupMessage", payload, (response) => {
      if (response.success) {
        set({ messages: [...messages, response.message] });
      } else {
        toast.error(response.error || "Failed to send group message");
      }
    });
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId !== selectedGroup._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unSubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
  },

  newGroup: async (groupData) => {
    const socket = useAuthStore.getState().socket;
    const getGroups = useChatStore.getState().getGroups;
    return new Promise((resolve, reject) => {
      socket.emit("createGroup", groupData, (response) => {
        if (response.success) {
          getGroups();
          set({ selectedGroup: null });
          resolve(response.group);
        } else {
          toast.error(response.error || "Failed to create group");
          reject(response);
        }
      });
    });
  },

  editGroup: async (groupData, groupId) => {
    const socket = useAuthStore.getState().socket;
    const getGroups = useChatStore.getState().getGroups;
    return new Promise((resolve, reject) => {
      socket.emit("updateGroup", { ...groupData, groupId }, (response) => {
        if (response.success) {
          set({ groupEdit: false, selectedGroup: null });
          getGroups();
          resolve(response.group);
        } else {
          toast.error(response.error || "Failed to update group");
          reject(response);
        }
      });
    });
  },

  leaveGroup: async (groupId, userId) => {
    const socket = useAuthStore.getState().socket;
    const getGroups = useChatStore.getState().getGroups;
    return new Promise((resolve, reject) => {
      socket.emit("leaveGroup", { groupId, userId }, (response) => {
        if (response.success) {
          getGroups();
          set({ selectedGroup: null });
          resolve(response.data);
        } else {
          toast.error(response.error || "Failed to leave group");
          reject(response);
        }
      });
    });
  },

  getFriendRequests: async () => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "getFriendRequests",
      { userId: authUser._id },
      async (response) => {
        if (response.success) {
          const sent = [];
          const received = [];
          for (const req of response.requests.outgoing) {
            const user = await get()
              .getUser(req._id)
              .catch(() => null);
            if (user) sent.push(user);
          }
          for (const req of response.requests.incoming) {
            const user = await get()
              .getUser(req._id)
              .catch(() => null);
            if (user) received.push(user);
          }
          set({ sentRequests: sent, receivedRequests: received });
        } else {
          toast.error(response.error || "Failed to fetch friend requests");
        }
      }
    );
  },

  sendFriendRequest: async (toUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "sendFriendRequest",
      { fromUserId: authUser._id, toUserId },
      async (response) => {
        if (response.success) {
          const user = await get()
            .getUser(toUserId)
            .catch(() => null);
          if (user)
            set((state) => ({
              sentRequests: [...(state.sentRequests || []), user],
            }));
          toast.success("Friend request sent");
        } else toast.error(response.error || "Failed to send friend request");
      }
    );
  },

  acceptFriendRequest: async (requesterId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "acceptFriendRequest",
      { userId: authUser._id, requesterId },
      async (response) => {
        if (response.success) {
          const user = await get()
            .getUser(requesterId)
            .catch(() => null);
          if (user) {
            set((state) => ({
              friends: [...state.friends, user],
              receivedRequests: state.receivedRequests.filter(
                (r) => r._id !== requesterId
              ),
              sentRequests: state.sentRequests.filter(
                (r) => r._id !== requesterId
              ),
            }));
          }
          toast.success("Friend request accepted");
        } else {
          toast.error(response.error || "Failed to accept friend request");
        }
      }
    );
  },

  rejectFriendRequest: async (requesterId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "rejectFriendRequest",
      { userId: authUser._id, requesterId },
      (response) => {
        if (response.success) {
          set((state) => ({
            receivedRequests: state.receivedRequests.filter(
              (r) => r._id !== requesterId
            ),
          }));
          toast.success("Friend request rejected");
        } else toast.error(response.error || "Failed to reject friend request");
      }
    );
  },

  cancelFriendRequest: async (toUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "cancelFriendRequest",
      { fromUserId: authUser._id, toUserId },
      (response) => {
        if (response.success) {
          set((state) => ({
            sentRequests: state.sentRequests.filter((r) => r._id !== toUserId),
          }));
          toast.success("Friend request cancelled");
        } else toast.error(response.error || "Failed to cancel friend request");
      }
    );
  },

  unfriendUser: async (friendId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) return toast.error("User not authenticated");
    socket.emit(
      "unfriendUser",
      { userId: authUser._id, friendId },
      (response) => {
        if (response.success) {
          set((state) => ({
            friends: state.friends.filter((f) => f._id !== friendId),
          }));
          toast.success("Unfriended successfully");
        } else toast.error(response.error || "Failed to unfriend user");
      }
    );
  },

  getFriends: async () => {
    set({ isUsersLoading: true });
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) {
      toast.error("User not authenticated");
      set({ isUsersLoading: false });
      return;
    }
    socket.emit("getFriends", { userId: authUser._id }, async (response) => {
      if (response.success) {
        const friend = [];
        for (const req of response.friends) {
          const user = await get()
            .getUser(req._id)
            .catch(() => null);
          if (user) friend.push(user);
        }
        set({ friends: friend });
      } else {
        toast.error(response.error || "Failed to fetch friends");
      }
      set({ isUsersLoading: false });
    });
  },

  toggleFriendRequest: async (toUserId) => {
    const { authUser, socket } = useAuthStore.getState();
    if (!socket || !authUser) {
      toast.error("User not authenticated");
      return;
    }
    const payload = {
      fromUserId: authUser._id,
      toUserId,
    };
    socket.emit("toggleFriendRequest", payload, (response) => {
      if (response.success) {
        if (response.sent) {
          toast.success("Friend request sent");
        } else if (response.cancelled) {
          toast.error("Friend request cancelled");
          set((state) => ({
            friendRequests: state.friendRequests.filter(
              (req) => req._id !== toUserId
            ),
          }));
        }
      } else {
        toast.error(response.error || "Failed to toggle friend request");
      }
    });
  },

  subscribeToFriendRequest: () => {
    const socket = useAuthStore.getState().socket;
    socket.on("friendRequestRejected", ({ userId }) => {
      toast("Your friend request was rejected");
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (req) => req._id !== userId
        ),
      }));
    });
  },

  unSubscribeFromFriendRequest: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("friendRequestRejected");
  },

  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      selectedGroup: null,
      showChatInfo: false,
      groupCreation: false,
    }),

  setSelectedGroup: (selectedGroup) =>
    set({
      selectedGroup,
      selectedUser: null,
      showChatInfo: false,
      groupCreation: false,
    }),

  setShowChatInfo: (value) => set({ showChatInfo: value }),

  setGroupCreation: (value) => set({ groupCreation: value }),

  setGroupEdit: (value) => set({ groupEdit: value }),
}));
