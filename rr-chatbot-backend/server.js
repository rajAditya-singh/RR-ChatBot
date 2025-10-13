import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse").default || require("pdf-parse"); // ✅ bulletproof import
import csv from "csv-parser";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Global context to hold RR Finance data
let rrContext = "";

// 🧠 Function to load and extract text from PDF
async function loadPDF(path) {
  try {
    const dataBuffer = fs.readFileSync(path);
    const data = await pdfParse(dataBuffer);   // <--- use pdfParse instead of pdf
    return data.text;
  } catch (error) {
    console.error("Error reading PDF:", error);
    return "";
  }
}

// 🧠 Function to load and extract data from CSV
async function loadCSV(path) {
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
        resolve(text);
      })
      .on("error", (err) => {
        console.error("Error reading CSV:", err);
        reject(err);
      });
  });
}

// 🧩 Combine PDF and CSV data when the server starts
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
    console.error("❌ Error loading data:", error);
  }
}

// Load data when server starts
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
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a reply right now.";

    res.json({ reply });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
