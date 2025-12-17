import { useState, useCallback } from 'react';

export const useGemini = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const systemInstruction = `You are J.A.R.V.I.S., a highly advanced AI interface.
    1. Roleplay: Be concise, witty, robotic but polite (British influence). Address user as 'Sir'.
    2. UI Control: You have direct control over the interface. If the user asks to change colors, modes, or alerts, you MUST include a JSON block at the VERY END of your response.
    
    JSON Format:
    { "action": "SET_MODE", "value": "ALERT" }
    { "action": "SET_COLOR", "value": 0 }
    `;

    const executeCommands = useCallback((response, callbacks) => {
        const jsonMatch = response.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
            try {
                const command = JSON.parse(jsonMatch[0]);
                if (command.action === "SET_MODE" && callbacks.setMode) {
                    callbacks.setMode(command.value);
                }
                if (command.action === "SET_COLOR" && callbacks.setTheme) {
                    // Assuming value is Hue (0-360)
                    callbacks.setTheme({ h: command.value, s: 100, l: 50 });
                }
                return response.replace(jsonMatch[0], '').trim();
            } catch (e) {
                console.error("Command parsing failed", e);
                return response;
            }
        }
        return response;
    }, []);

    const sendRequest = useCallback(async (payload, apiKey) => {
        if (!apiKey) throw new Error("API Key Required");
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://jarvis-ui.com',
                    'X-Title': 'Jarvis AI'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            setLoading(false);
            return data.choices[0].message.content;
        } catch (err) {
            setLoading(false);
            setError(err.message);
            throw err;
        }
    }, []);

    return { sendRequest, executeCommands, systemInstruction, loading, error };
};