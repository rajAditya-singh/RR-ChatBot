import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
// import cheerio from "cheerio"; // npm i cheerio
import * as cheerio from "cheerio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Function to fetch live IPOs from RR Finance website
async function getLiveIPOs() {
  try {
    const res = await fetch("https://www.rrfinance.com/OurProducts/Mainline_IPO.aspx");
    const html = await res.text();
    const $ = cheerio.load(html);

    const ipoList = [];
    $("#ctl00_ContentPlaceHolder1_GridView1 tr").each((i, row) => {
      if (i === 0) return; // skip header row
      const cols = $(row).find("td");
      ipoList.push({
        name: $(cols[0]).text().trim(),
        issueSize: $(cols[1]).text().trim(),
        priceBand: $(cols[2]).text().trim(),
        openDate: $(cols[3]).text().trim(),
        closeDate: $(cols[4]).text().trim(),
      });
    });
    return ipoList;
  } catch (err) {
    console.error("Error fetching IPOs:", err);
    return [];
  }
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Level 2 system message for general RR Finance knowledge
    const companyContext = `
You are "RR Finance Assistant," a knowledgeable and professional AI advisor representing RR Finance.

RR Finance (RR Investors Capital Services Pvt. Ltd.) is an AMFI‑registered mutual fund distributor (ARN‑0032, valid till 14‑Mar‑2027).  
Head Office: Indraprakash Building, 21 Barakhamba Road, New Delhi, 110001.  
Contact: +91 11‑4444‑1111 / +91 9350316010.

Key services offered:
- Mutual Funds  
- SIP (Systematic Investment Plans)  
- Public Issues / IPO / NCD  
- Capital Gain Bonds  
- National Pension System (NPS)  
- Portfolio Management Services / AIF  
- Fixed Deposits  
- Floating Rate Bonds  
- Gold Bonds  
- Stocks (via rrstock.in)  
- Insurance (via rrpolicy.com)

RR Finance is known for "36+ Years of Trusted Financial Solutions."  
It emphasizes transparency and a customer-first approach.  
Disclaimers: Mutual fund investments carry market risk; users must read scheme documents before investing.

Behavior instructions:
- Use live IPO data to answer customer questions accurately.
- For other topics, answer using RR Finance general knowledge.
- Always maintain a professional and friendly tone.
- If a question is outside RR Finance services, reply politely: "I'm sorry, I don't have that information. Please contact RR Finance support."
`;

    // Fetch live IPOs
    const liveIPOs = await getLiveIPOs();

    // Format IPO data as plain text for AI
    let liveIPOsText = "Currently available IPOs / NCDs:\n";
    if (liveIPOs.length === 0) {
      liveIPOsText += "No IPOs are currently listed.\n";
    } else {
      liveIPOs.forEach((ipo, idx) => {
        liveIPOsText += `${idx + 1}. ${ipo.name} | Issue Size: ${ipo.issueSize} | Price Band: ${ipo.priceBand} | Open: ${ipo.openDate} | Close: ${ipo.closeDate}\n`;
      });
    }

    // Construct user prompt including live IPO data
    const userPrompt = `
User asked: "${userMessage}"

Use the information below to answer IPO/NCD questions accurately:
${liveIPOsText}

For other questions, respond using your RR Finance knowledge.
`;

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: companyContext },
          { role: "user", content: userPrompt }
        ]
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
