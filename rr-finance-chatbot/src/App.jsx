import ChatBox from "./components/ChatBox";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        RR Finance Chatbot 💬
      </h1>
      <ChatBox />
    </div>
  );
}

export default App;
