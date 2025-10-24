import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000"); // backend URL

function ChatRoom() {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("product");

  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [text, setText] = useState("");

  const audioRef = useRef(new Audio("/notification.mp3")); // make sure you have /public/notification.mp3

  useEffect(() => {
    // join room
    socket.emit("joinChat", chatId);

    // fetch chat list
    axios.get("/api/chats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      if (res.data) setChats(res.data);
    });

    // fetch old messages
    axios.get(`/api/chats/product/${productId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      if (res.data?.messages) setMessages(res.data.messages);
    });

    // listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages(prev => [...prev, message]);

      // Play notification sound
      audioRef.current.play().catch(() => {});

      // Show toast popup
      toast.info(`New message from ${message.sender?.fullName || "someone"}`, {
        position: "bottom-right",
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatId, productId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await axios.post(`/api/chats/${chatId}/message`, { text }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    socket.emit("sendMessage", { chatId, message: res.data });
    setText("");
  };

  const handleChatSelect = (id, product) => {
    navigate(`/chat/${id}?product=${product}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/4 bg-white border-r overflow-y-auto p-3">
        <h2 className="text-xl font-semibold mb-3">💬 Chats</h2>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatSelect(chat._id, chat.product?._id)}
            className={`p-2 mb-2 rounded cursor-pointer hover:bg-blue-100 ${
              chat._id === chatId ? "bg-blue-200" : ""
            }`}
          >
            <p className="font-medium">
              {chat.participants
                ?.filter((p) => p._id !== localStorage.getItem("userId"))
                ?.map((p) => p.fullName)
                ?.join(", ") || "Chat"}
            </p>
            {chat.product && (
              <p className="text-xs text-gray-600">
                🛒 {chat.product.name || "Product"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col p-4">
        <button
          onClick={() => navigate(`/product/${productId}`)}
          className="mb-3 text-blue-500 underline"
        >
          ⬅ Back to Product
        </button>

        <div className="border rounded-lg p-3 flex-1 overflow-y-auto bg-white">
          {messages.length > 0 ? (
            messages.map((m, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold">
                  {m.sender?.fullName || "You"}:
                </span>{" "}
                {m.text}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-20">No messages yet</p>
          )}
        </div>

        <div className="mt-3 flex">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 ml-2 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default ChatRoom;
