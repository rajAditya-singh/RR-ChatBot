import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import csv from "csv-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🌐 Global memory for RR Finance data
let rrContext = "";

// 🧠 Load PDF text with dynamic import and path check
async function loadPDF(path) {
  try {
    if (!fs.existsSync(path)) {
      console.error("❌ PDF not found at:", path);
      return "";
    }

    // ✅ Dynamic import ensures pdfParse works in ESM
    const pdfParse = (await import("pdf-parse")).default;

    const dataBuffer = fs.readFileSync(path);
    const pdfData = await pdfParse(dataBuffer);
    console.log("📘 PDF text extracted successfully!");
    return pdfData.text;
  } catch (error) {
    console.error("❌ Error reading PDF:", error);
    return "";
  }
}

// 🧠 Load CSV text with path check
async function loadCSV(path) {
  if (!fs.existsSync(path)) {
    console.error("❌ CSV not found at:", path);
    return "";
  }

  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => {
        const text = rows
          .map((r) => Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(", "))
          .join("\n")
          .slice(0, 4000);
        console.log("📊 CSV data extracted successfully!");
        resolve(text);
      })
      .on("error", (err) => {
        console.error("❌ Error reading CSV:", err);
        reject(err);
      });
  });
}

// 🧩 Initialize RR Finance context
async function initializeData() {
  console.log("📄 Loading RR Finance data...");
  try {
    const pdfText = await loadPDF("./uploads/data/RR Corporate Presentation (1).pdf");
    const csvText = await loadCSV("./uploads/data/scheme_info_details.csv");

    rrContext = `
You are RR Finance Assistant — a financial chatbot trained on RR Finance's internal data.

🏢 ---- RR Corporate Overview ----
${pdfText.slice(0, 7000)}

📊 ---- Scheme & Fund Details ----
${csvText.slice(0, 3000)}

When responding, always sound professional and factual.
If user asks about services, products, or company info, use the context above.
If unsure, politely guide them to visit https://www.rrfinance.com
    `;

    console.log("✅ RR Finance data loaded successfully!");
  } catch (error) {
    console.error("❌ Error initializing data:", error);
  }
}

// Initialize context at startup
initializeData();

// 🗣️ Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const prompt = `
Use the following RR Finance data to answer the user's question accurately.

${rrContext}

User: ${userMessage}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API error:", data);
      return res.status(500).json({ reply: "⚠️ OpenRouter API failed. Try again later." });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply right now.";
    res.json({ reply });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ reply: error.message || "Something went wrong." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
