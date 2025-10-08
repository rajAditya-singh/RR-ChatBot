import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = "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";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: userMessage,
      }),
    });

    const data = await response.json();
    console.log("OpenAI Response:", data);

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const botReply = data.output[0].content[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
