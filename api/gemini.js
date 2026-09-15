export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    try {
        const { prompt } = req.body;
        const apiKey = process.env.MISTRAL_API_KEY; // <-- DOIT ÊTRE MISTRAL

        if (!apiKey) return res.status(500).json({ error: "Clé API Mistral manquante" });

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', { // <-- DOIT ÊTRE MISTRAL.AI
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'open-mistral-nemo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });

        let rawContent = data.choices[0].message.content;
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return res.status(200).json({ result: JSON.parse(rawContent) });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}