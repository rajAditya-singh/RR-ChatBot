// Elements
const chatToggle = document.querySelector(".chat-toggle");
const chatbot = document.querySelector(".chatbot-container");
const chatBody = document.querySelector(".chat-body");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatForm = document.querySelector(".chat-input-form");

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
  const msg = document.createElement("div");
  msg.className = sender === "bot" ? "bot-message" : "user-message";
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Scroll to bottom helper
function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Quick replies
const quickReplies = ["SIP Plans", "Mutual Funds", "EMI Calculator", "Account Status"];
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

// Toggle chat
chatToggle.addEventListener("click", () => {
  chatbot.classList.toggle("open");

  if (chatbot.classList.contains("open")) {
    if (!hasUserMessages()) {
      setTimeout(showQuickReplies, 500);
    }
  } else {
    removeQuickReplies();
  }
});

// Send input message via button
sendBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";
  removeQuickReplies();
  showTyping();
  const botReply = await getBotReply(text);
  removeTyping();
  addMessage(botReply, "bot");
  scrollToBottom();
});

// Send input message via Enter key
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Backend GPT API call
async function getBotReply(message) {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.reply;
  } catch (err) {
    console.error("Fetch error:", err);
    return "Sorry, something went wrong!";
  }
}

// Form submission
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
