import React, { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import {
  MdPerson,
  MdMeetingRoom,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdChat,
  MdLogin,
  MdAddCircleOutline,
} from "react-icons/md";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setRoomId, setPassword, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (
      detail.userName.trim() === "" ||
      detail.roomId.trim() === "" ||
      detail.password.trim() === ""
    ) {
      toast.error("Please fill in all fields (Name, Room ID, and Password).");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;
    setLoading(true);

    try {
      await joinChatApi({
        roomId: detail.roomId.trim(),
        password: detail.password.trim(),
      });
      toast.success("Joined Room Successfully!");
      setCurrentUser(detail.userName.trim());
      setRoomId(detail.roomId.trim());
      setPassword(detail.password.trim());
      setConnected(true);

      navigate("/chat");
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error(error.response.data || "Invalid room password.");
      } else if (error?.response?.status === 400) {
        toast.error(error.response.data || "Room not found.");
      } else {
        toast.error("Error connecting to room.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function createRoom() {
    if (!validateForm()) return;
    setLoading(true);

    try {
      await createRoomApi({
        roomId: detail.roomId.trim(),
        password: detail.password.trim(),
      });
      toast.success("Room Created & Joined!");

      setCurrentUser(detail.userName.trim());
      setRoomId(detail.roomId.trim());
      setPassword(detail.password.trim());
      setConnected(true);

      navigate("/chat");
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error(error.response.data || "Room ID already exists.");
      } else {
        toast.error("Error creating room.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 overflow-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/30 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/30 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-indigo-950/50 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 mb-1">
            <MdChat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ChatSphere
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Secure, password-protected real-time rooms
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* User Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="userName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Your Display Name
            </label>
            <div className="relative flex items-center">
              <MdPerson className="absolute left-3.5 text-slate-400 w-5 h-5" />
              <input
                id="userName"
                name="userName"
                type="text"
                value={detail.userName}
                onChange={handleFormInputChange}
                placeholder="e.g. Alex"
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 text-sm sm:text-base rounded-xl pl-11 pr-4 py-2.5 sm:py-3 outline-none transition-all"
              />
            </div>
          </div>

          {/* Room ID Input */}
          <div className="space-y-1.5">
            <label htmlFor="roomId" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Room Identifier
            </label>
            <div className="relative flex items-center">
              <MdMeetingRoom className="absolute left-3.5 text-slate-400 w-5 h-5" />
              <input
                id="roomId"
                name="roomId"
                type="text"
                value={detail.roomId}
                onChange={handleFormInputChange}
                placeholder="e.g. dev-team-room"
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 text-sm sm:text-base rounded-xl pl-11 pr-4 py-2.5 sm:py-3 outline-none transition-all"
              />
            </div>
          </div>

          {/* Room Password Input */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Room Password
            </label>
            <div className="relative flex items-center">
              <MdLock className="absolute left-3.5 text-slate-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={detail.password}
                onChange={handleFormInputChange}
                placeholder="Enter room password"
                className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 text-sm sm:text-base rounded-xl pl-11 pr-11 py-2.5 sm:py-3 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <MdVisibilityOff className="w-5 h-5" />
                ) : (
                  <MdVisibility className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={joinChat}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm sm:text-base py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98]"
            >
              <MdLogin className="w-5 h-5" />
              <span>Join Room</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={createRoom}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 disabled:opacity-50 text-slate-200 hover:text-white font-semibold text-sm sm:text-base py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              <MdAddCircleOutline className="w-5 h-5 text-indigo-400" />
              <span>Create Room</span>
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Rooms are protected with room-level authentication.
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
