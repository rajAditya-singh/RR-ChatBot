import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // You can also try "mistralai/mistral-7b-instruct"
        messages: [{ role: "user", content: userMessage }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong on the server." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);