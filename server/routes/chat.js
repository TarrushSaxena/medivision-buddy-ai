const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const XRayAnalysis = require('../models/XRayAnalysis');
const SymptomCheck = require('../models/SymptomCheck');
const auth = require('../middleware/auth');

const router = express.Router();

// Smart parameter optimization based on question complexity
function getOptimalParams(message) {
    const msgLower = message.toLowerCase().trim();
    const wordCount = message.split(/\s+/).length;

    // Quick greetings and simple questions
    const quickPatterns = [
        /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye)$/i,
        /^(yes|no|sure|got it|understood)$/i,
        /^what('s| is) your name/i,
        /^how are you/i
    ];

    // Medium complexity - factual questions
    const mediumPatterns = [
        /what (is|are|does|do)/i,
        /tell me about/i,
        /can you (help|tell|explain)/i,
        /^(define|meaning of)/i
    ];

    // High complexity - detailed explanations
    const complexPatterns = [
        /explain (in detail|thoroughly|completely)/i,
        /compare (and contrast)?/i,
        /analyze|analysis/i,
        /summarize (all|my|every)/i,
        /list all|give me all/i,
        /step by step/i,
        /why (does|do|is|are|should)/i
    ];

    // Check for quick responses
    if (quickPatterns.some(p => p.test(msgLower)) || wordCount <= 3) {
        return { max_tokens: 150, temperature: 0.5, complexity: 'quick' };
    }

    // Check for complex queries
    if (complexPatterns.some(p => p.test(msgLower)) || wordCount > 20) {
        return { max_tokens: 2048, temperature: 0.7, complexity: 'detailed' };
    }

    // Check for medium complexity
    if (mediumPatterns.some(p => p.test(msgLower)) || wordCount > 8) {
        return { max_tokens: 512, temperature: 0.6, complexity: 'standard' };
    }

    // Default: balanced params
    return { max_tokens: 384, temperature: 0.6, complexity: 'balanced' };
}

// Get messages for a conversation
router.get('/messages/:conversationId', auth, async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            user_id: req.user._id,
            conversation_id: req.params.conversationId
        }).sort({ created_at: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get user context (xrays and symptoms for AI)
router.get('/context', auth, async (req, res) => {
    try {
        const xrays = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('prediction confidence created_at');

        const symptoms = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('symptoms risk_level created_at');

        res.json({ xrays, symptoms });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

// Create a new message
router.post('/messages', auth, async (req, res) => {
    try {
        const { conversation_id, role, content, metadata } = req.body;

        const message = new ChatMessage({
            user_id: req.user._id,
            conversation_id,
            role,
            content,
            metadata
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Chat with AI (simple response for now - can be enhanced with actual AI)
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        // Save user message
        const userMessage = new ChatMessage({
            user_id: req.user._id,
            conversation_id: conversationId,
            role: 'user',
            content: message
        });
        await userMessage.save();

        // Get user context for AI response
        const xrays = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(3);

        const symptoms = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(3);

        // Generate contextual response using Perplexity AI
        let aiResponse = "";

        const apiKey = process.env.PERPLEXITY_API_KEY;

        if (!apiKey) {
            // Fallback to local logic if no API key
            console.warn('No PERPLEXITY_API_KEY found, using fallback logic');
            if (message.toLowerCase().includes('xray') || message.toLowerCase().includes('x-ray')) {
                if (xrays.length > 0) {
                    const latest = xrays[0];
                    aiResponse = `Based on your recent X-ray analysis, the prediction was "${latest.prediction}" with ${latest.confidence}% confidence.`;
                } else {
                    aiResponse = "You haven't uploaded any X-ray scans yet. Would you like me to guide you through the analysis process?";
                }
            } else if (message.toLowerCase().includes('symptom')) {
                if (symptoms.length > 0) {
                    const latest = symptoms[0];
                    aiResponse = `Your most recent symptom check showed a "${latest.risk_level}" risk level.`;
                } else {
                    aiResponse = "You haven't done any symptom checks yet. Would you like to start one?";
                }
            } else {
                aiResponse = "I can help you understand your X-ray results, symptom assessments, and provide general medical information. Please add your PERPLEXITY_API_KEY to server/.env to enable full AI capabilities.";
            }
        } else {
            // Call Perplexity AI API
            try {
                const axios = require('axios');

                // Construct system prompt with context
                const hasXrays = xrays.length > 0;
                const hasSymptoms = symptoms.length > 0;

                let contextInfo = "";
                if (hasXrays) {
                    contextInfo += `\n\nUSER'S X-RAY HISTORY:\n${xrays.map(x => `- ${x.prediction} (${x.confidence}% confidence) on ${new Date(x.created_at).toLocaleDateString()}`).join('\n')}`;
                }
                if (hasSymptoms) {
                    contextInfo += `\n\nUSER'S SYMPTOM CHECKS:\n${symptoms.map(s => `- Risk Level: ${s.risk_level}, Symptoms: ${s.symptoms?.join(', ') || 'N/A'}`).join('\n')}`;
                }

                const systemPrompt = `You are MediVision AI, a friendly and helpful medical information assistant.

YOUR ROLE:
- Help users understand their health data from MediVision
- Answer medical questions in simple, clear language
- Provide educational information about conditions, symptoms, and treatments
- Be warm, empathetic, and conversational

IMPORTANT: You DO have access to this user's MediVision data:${contextInfo || '\n- No X-rays or symptom checks recorded yet'}

When the user asks about their data, reference their ACTUAL results above. Be specific and helpful.
Keep responses concise but friendly. Don't repeat the same disclaimer every message.`;

                console.log('[Perplexity] Sending request...');

                const response = await axios.post('https://api.perplexity.ai/chat/completions', {
                    model: "sonar",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ],
                    max_tokens: 500,
                    temperature: 0.5
                }, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 second timeout
                });

                console.log('[Perplexity] Response received');

                if (response.data?.choices?.[0]?.message?.content) {
                    aiResponse = response.data.choices[0].message.content;
                } else {
                    aiResponse = "I apologize, but I couldn't generate a response. Please try again.";
                }
            } catch (aiError) {
                console.error('Perplexity API Error:', aiError.response?.data || aiError.message);
                aiResponse = "I'm experiencing technical difficulties. Please try again.";
            }
        }

        // Ensure aiResponse is never null or empty
        if (!aiResponse || aiResponse.trim() === '') {
            aiResponse = "I understand you're asking about \"" + message.substring(0, 30) + "\". I'm experiencing technical difficulties. Please try again or consult a healthcare professional for medical concerns.";
        }

        // Save AI response
        const assistantMessage = new ChatMessage({
            user_id: req.user._id,
            conversation_id: conversationId,
            role: 'assistant',
            content: aiResponse
        });
        await assistantMessage.save();

        res.json({
            response: aiResponse,
            messageId: assistantMessage._id
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

module.exports = router;
