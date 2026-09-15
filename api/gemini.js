export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const { prompt } = req.body;
        const apiKey = process.env.MISTRAL_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Clé API Mistral manquante" });
        }

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'align': 'center'
                },
                body: JSON.stringify({
                    model: 'open-mistral-nemo',
                    messages: [
                        { 
                            role: 'system', 
                            content: 'Tu es une API strictement formatée. Tu dois répondre UNIQUEMENT avec un objet JSON valide. N\'écris ABSOLUMENT AUCUN texte avant ou après les accolades. N\'utilise PAS de balises markdown comme ```json. Structure OBLIGATOIRE : {"score": nombre, "forces": ["texte"], "faiblesses": ["texte"], "conseil_titre": "texte"}.' 
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                })
            });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        let rawContent = data.choices[0].message.content;
        
        // Nettoyage agressif des balises markdown en début et fin de chaîne
        rawContent = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        
        // Extraction du bloc JSON au cas où il y aurait du texte résiduel
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            rawContent = jsonMatch[0];
        }

        try {
            const parsed = JSON.parse(rawContent);
            return res.status(200).json({ result: parsed });
        } catch (parseError) {
            // 🕵️ LOG CRUCIAL : On affiche ce que Mistral a réellement envoyé
            console.error("⚠️ ERREUR PARSING JSON - CONTENU BRUT DE MISTRAL :", rawContent);
            
            return res.status(200).json({ 
                result: { 
                    score: 65, 
                    forces: ["Profil intéressant"], 
                    faiblesses: ["Détail brut: " + rawContent.substring(0, 150) + "..."], 
                    conseil_titre: "Erreur de format. Vérifiez les logs Vercel." 
                } 
            });
        }

    } catch (error) {
        console.error("Erreur serveur Mistral:", error);
        return res.status(500).json({ error: error.message });
    }
}