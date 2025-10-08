import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 100,
    });
    console.log("GPT reply:", response.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI Error:", err);
  }
}

test();
