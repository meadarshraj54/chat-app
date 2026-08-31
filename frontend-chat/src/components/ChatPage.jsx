import React, { useRef, useState, useEffect } from "react";
import { MdAttachFile, MdSend, MdLogout, MdLock, MdFiberManualRecord } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getMessages } from "../services/RoomService";

const ChatPage = () => {
  const { roomId, password, currentUser, connected, setConnected } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load old messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await getMessages(roomId, password);
        setMessages(msgs);
      } catch (error) {
        if (error?.response?.status === 401) {
          toast.error("Unauthorized: Invalid room password.");
          setConnected(false);
        } else {
          toast.error("Failed to load chat history.");
        }
      }
    }
    if (connected && roomId) {
      loadMessages();
    }
  }, [roomId, password, connected, setConnected]);

  // Smooth auto-scroll down on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Initialize STOMP web socket client
  useEffect(() => {
    let client = null;
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);

      client = new Client({
        webSocketFactory: () => sock,

        onConnect: () => {
          setStompClient(client);
          toast.success("Connected to chat room");

          client.subscribe(`/topic/room/${roomId}`, (message) => {
            try {
              const newMsg = JSON.parse(message.body);
              setMessages((prev) => [...prev, newMsg]);
            } catch (err) {
              console.error("Error parsing message body:", err);
            }
          });
        },

        onStompError: (frame) => {
          console.error("Broker error:", frame);
          toast.error("WebSocket Connection Error");
        },
      });

      client.activate();
    };

    if (connected && roomId) {
      connectWebSocket();
    }

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [roomId, connected]);

  // Send message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input.trim(),
        roomId: roomId,
      };

      stompClient.publish({
        destination: `/app/sendMessage/${roomId}`,
        body: JSON.stringify(message),
      });

      setInput("");
    }
  };

  function handleLogout() {
    if (stompClient) {
      stompClient.deactivate();
    }
    setConnected(false);
    toast.success("Left the room");
    navigate("/");
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    try {
      let date;
      if (typeof timestamp === "string") {
        let str = timestamp.trim();
        if (str.includes(" ") && !str.includes("T")) {
          str = str.replace(" ", "T");
        }
        date = new Date(str);
      } else if (Array.isArray(timestamp)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = timestamp;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) return "";

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        {/* Room Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-400 font-semibold text-xs sm:text-sm">
            <MdLock className="w-4 h-4 text-indigo-400" />
            <span>Room: {roomId}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            <MdFiberManualRecord className="w-3 h-3 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        {/* User Info & Leave Room */}
        <div className="flex items-center gap-3">
          <div className="text-xs sm:text-sm text-slate-300 font-medium hidden xs:block">
            User: <span className="text-white font-bold">{currentUser}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
            title="Leave Room"
          >
            <MdLogout className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Room</span>
          </button>
        </div>
      </header>

      {/* Main Message Stream */}
      <main
        ref={chatBoxRef}
        className="w-full max-w-4xl mx-auto h-screen pt-20 sm:pt-24 pb-28 sm:pb-32 px-3 sm:px-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
              <MdLock className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-300">
              Welcome to Room #{roomId}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-sm">
              This room is password-protected. Send a message to begin real-time conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSelf = message.sender === currentUser;
            const timeStr = formatTime(message.timeStamp || message.messageTime);

            return (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] sm:max-w-md ${
                  isSelf ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Sender Label */}
                <span
                  className={`text-[10px] sm:text-xs text-slate-400 font-semibold mb-1 ${
                    isSelf ? "pr-10 sm:pr-11 text-right" : "pl-10 sm:pl-11 text-left"
                  }`}
                >
                  {message.sender}
                </span>

                {/* Avatar + Chat Bubble Row */}
                <div
                  className={`flex items-start gap-2 sm:gap-2.5 ${
                    isSelf ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <img
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 shadow-sm ${
                      isSelf
                        ? "bg-indigo-900 border border-indigo-700"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      (isSelf ? currentUser : message.sender) || "User"
                    )}`}
                    alt={isSelf ? currentUser : message.sender}
                  />

                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl text-sm sm:text-base leading-relaxed break-words shadow-md ${
                      isSelf
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none"
                        : "bg-slate-850/90 border border-slate-700/70 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>

                {/* Timestamp */}
                {timeStr && (
                  <span
                    className={`text-[10px] text-slate-500 font-medium mt-1 ${
                      isSelf ? "pr-10 sm:pr-11 text-right" : "pl-10 sm:pl-11 text-left"
                    }`}
                  >
                    {timeStr}
                  </span>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Input Dock Footer */}
      <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-30 px-3 sm:px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-indigo-950/70 rounded-full px-3 py-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            type="text"
            placeholder="Type a message..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-400 text-sm sm:text-base px-3 outline-none"
          />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-2 sm:p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-all"
              title="Attach File"
              onClick={() => toast.success("Attachment feature coming soon!")}
            >
              <MdAttachFile className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={sendMessage}
              type="button"
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white p-2.5 sm:p-3 rounded-full transition-all shadow-md shadow-indigo-600/30 active:scale-95 flex items-center justify-center"
              title="Send Message"
            >
              <MdSend className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
