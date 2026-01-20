import knowledgeBase from "./knowledge.js";

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ reply: "Message is required." })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API key");

    const prompt = `
${knowledgeBase}

[USER QUESTION]
${message}

[INSTRUCTIONS]
- Answer only using the SwadeshIntern information above
- Be polite and professional
- Keep the answer short (2–4 sentences)
- If the question is unrelated, politely decline
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 256
          }
        })
      }
    );

    const data = await response.json();

    let reply = "No response from model.";

    if (data.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts?.length > 0) {
        reply = parts.map(p => p.text).join("").trim();
      }
    } else if (data.error) {
      reply = data.error.message;
    } else if (data.promptFeedback?.blockReason) {
      reply = "I can only help with SwadeshIntern-related queries.";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("❌ Backend error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        reply: "Something went wrong. Please try again."
      })
    };
  }
};
