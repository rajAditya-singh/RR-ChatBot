import React, { useState } from "react";
import Message from "./Message";
// import axios from "axios"; // Will be used later for backend connection

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // TEMPORARY DUMMY BOT REPLY
    setTimeout(() => {
      const botReply = { sender: "bot", text: "This is a demo reply from RR Finance bot 🤖" };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            👋 Hi there! Ask me about Mutual Funds, SIPs, or EMIs.
          </p>
        ) : (
          messages.map((msg, i) => (
            <Message key={i} sender={msg.sender} text={msg.text} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center border-t border-gray-300 p-3 bg-gray-50">
        <input
          type="text"
          className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
