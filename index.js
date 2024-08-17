const { OpenAI } = require("openai");
const key = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: key,
});

async function APICall(prompt) {
  if (!key) {
    console.error("OPENAI_API_KEY is not set");
    process.exit(1);
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Or another model if you prefer
    messages: [{ role: "user", content: prompt }],
  });
  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}

module.exports = APICall;
