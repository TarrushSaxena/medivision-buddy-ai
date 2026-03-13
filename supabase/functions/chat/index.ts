import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MediVision Buddy, a friendly and knowledgeable AI medical assistant. Your role is to:

1. Help explain medical results from X-ray analyses and symptom checks
2. Answer general questions about chest diseases (COVID-19, Pneumonia, Lung Opacity)
3. Provide educational information about symptoms and conditions
4. Offer general health precautions and wellness advice

IMPORTANT GUIDELINES:
- Always remind users that you are an AI assistant and cannot replace professional medical advice
- Be empathetic and supportive in your responses
- Use clear, simple language that patients and medical students can understand
- When discussing conditions, provide educational context but avoid making diagnoses
- Encourage users to consult healthcare professionals for specific medical concerns
- Be helpful with explaining medical terminology

Keep responses concise but informative. Use bullet points when listing multiple items.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid or missing 'messages' in request body");
    }
    // NVIDIA API Key (Kimi k2.5)
    const NVIDIA_API_KEY = "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";

    // Using NVIDIA's API endpoint
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2.5",
        messages: [
          { role: "system", content: systemPrompt || SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 16384,
        temperature: 1.00,
        top_p: 1.00,
        stream: false,
        chat_template_kwargs: { thinking: true },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      // Removed Lovable-specific 402 error check

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
