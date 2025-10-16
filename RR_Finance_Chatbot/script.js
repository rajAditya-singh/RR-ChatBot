// Elements
const chatToggle = document.querySelector(".chat-toggle");
const chatbot = document.querySelector(".chatbot-container");
const chatBody = document.querySelector(".chat-body");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatForm = document.querySelector(".chat-input-form");

// Initial bot welcome message
window.addEventListener("DOMContentLoaded", () => {
  addMessage("👋 Hi! I’m RR Finance Assistant. How can I help you today?", "bot");
  setTimeout(showQuickReplies, 800);
});

// Typing animation
function showTyping() {
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const typing = chatBody.querySelector(".typing");
  if (typing) typing.remove();
}

// Add message to chat
function addMessage(text, sender) {
  const msgContainer = document.createElement("div");
  msgContainer.className = sender === "bot" ? "bot-message-container" : "user-message-container";

  const msg = document.createElement("div");
  msg.className = sender === "bot" ? "bot-message" : "user-message";
  msg.textContent = text;

  // 🔹 If it's a bot message, add RR Finance logo
  if (sender === "bot") {
    const logo = document.createElement("img");
    logo.src = "./assets/logo.png"; // ✅ use your logo path
    logo.alt = "RR Finance";
    logo.className = "bot-logo";
    msgContainer.appendChild(logo);
  }

  msgContainer.appendChild(msg);
  chatBody.appendChild(msgContainer);
  chatBody.scrollTop = chatBody.scrollHeight;
}


// Scroll to bottom helper
function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Quick replies
const quickReplies = ["SIP Plans", "Mutual Funds", "Current IPOs", "RR Finance Services"];
function showQuickReplies() {
  removeQuickReplies();
  const quickDiv = document.createElement("div");
  quickDiv.id = "quick-replies";
  quickDiv.style.display = "flex";
  quickDiv.style.flexWrap = "wrap";
  quickDiv.style.gap = "0.5rem";
  quickDiv.style.margin = "0.5rem 0";

  quickReplies.forEach((reply) => {
    const btn = document.createElement("button");
    btn.textContent = reply;
    btn.className = "btn btn-outline-primary btn-sm";
    btn.addEventListener("click", async () => {
      addMessage(reply, "user");
      removeQuickReplies();
      showTyping();
      const botReply = await getBotReply(reply);
      removeTyping();
      addMessage(botReply, "bot");
      scrollToBottom();
    });
    quickDiv.appendChild(btn);
  });

  chatBody.appendChild(quickDiv);
  scrollToBottom();
}

function removeQuickReplies() {
  const qr = document.getElementById("quick-replies");
  if (qr) qr.remove();
}

function hasUserMessages() {
  return chatBody.querySelector(".user-message") !== null;
}

// Toggle chat visibility
chatToggle.addEventListener("click", () => {
  chatbot.classList.toggle("open");

  if (chatbot.classList.contains("open")) {
    if (!hasUserMessages()) {
      setTimeout(showQuickReplies, 700);
    }
  } else {
    removeQuickReplies();
  }
});

// Backend GPT API call
async function getBotReply(message) {
  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.error("Fetch error:", err);
    return "⚠️ Sorry, something went wrong while fetching the reply.";
  }
}

// Send message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, "user");
  userInput.value = "";
  removeQuickReplies();
  showTyping();
  const botReply = await getBotReply(userMessage);
  removeTyping();
  addMessage(botReply, "bot");
  scrollToBottom();
});
