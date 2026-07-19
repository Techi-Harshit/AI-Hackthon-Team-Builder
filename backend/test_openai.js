require("dotenv").config();

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("❌ Error: OPENAI_API_KEY is not defined in your backend/.env file.");
    return;
  }

  console.log("Checking API key:", apiKey.slice(0, 10) + "..." + apiKey.slice(-5));
  console.log("Sending a test request to OpenAI API...");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say hello!" }],
        max_tokens: 5
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ SUCCESS: Your OpenAI API Key is working perfectly!");
      console.log("Response from OpenAI:", data.choices?.[0]?.message?.content?.trim());
    } else {
      const errorText = await response.text();
      console.log("\n❌ FAILED: OpenAI rejected the request.");
      console.log(`HTTP Status: ${response.status}`);
      console.log("Error details:", errorText);
    }
  } catch (err) {
    console.log("\n❌ ERROR: Failed to connect to OpenAI server.");
    console.log("Network error details:", err.message);
  }
}

testOpenAI();
