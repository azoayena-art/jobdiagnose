// Tes identifiants (les mêmes que dans setup-appwrite.js)
const PROJECT_ID = '6aa30ee1002fdf9e18de'; 
const DATABASE_ID = 'jobdiagnose_db'; 
const API_KEY = 'standard_235ba42304c414ce65b741f30965648571697cef0dbde52aa8ab6050e88d572dcef65653b48f66f972dfa6981c5f1cd05f03a004336d41f87a8b372f6a818ee46dbc51afa506a56d2a3c2b56e9a411b5d148d2230fe188f0aa986aa4b07dac4d292fb208c4b8dbb359f2763756b149c1dca4ef273dbed4cc2f8129f08117a90f'; // Clé API avec TOUTES les permissions cochées

const BASE_URL = `https://cloud.appwrite.io/v1/databases/${DATABASE_ID}`;
const HEADERS = {
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
    'Content-Type': 'application/json'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fixPopularAttribute() {
    console.log('1. Correction de l\'attribut "popular"...');
    
    // Supprimer l'ancien attribut popular
    await fetch(`${BASE_URL}/collections/pricing/attributes/popular`, {
        method: 'DELETE',
        headers: HEADERS
    });
    console.log('  🗑️ Ancien attribut "popular" supprimé.');
    await delay(1500);
    
    // Recréer avec required: false (pour pouvoir avoir un default)
    const res = await fetch(`${BASE_URL}/collections/pricing/attributes/boolean`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
            key: 'popular',
            required: false,
            default: false
        })
    });
    const data = await res.json();
    if (data.key) {
        console.log('  ✅ Attribut "popular" recréé correctement !');
    } else {
        console.error('  ❌ Erreur:', data.message);
    }
}

async function createDocuments() {
    console.log('2. Création des documents (tarifs)...');
    const plans = [
        {
            documentId: 'decouverte', plan: 'decouverte', name: 'Découverte', price: 0, analyses: 3,
            description: 'Pour tester le service',
            features: ['3 analyses de CV', 'Rapport PDF basique', 'Score et conseils IA'],
            popular: false, order: 1
        },
        {
            documentId: 'essentiel', plan: 'essentiel', name: 'Essentiel', price: 5.99, analyses: 10,
            description: 'Pour les chercheurs d\'emploi actifs',
            features: ['10 analyses de CV', 'Rapport PDF professionnel 3 pages', 'Matching offre d\'emploi', 'Support email'],
            popular: true, order: 2
        },
        {
            documentId: 'premium', plan: 'premium', name: 'Premium', price: 49.99, analyses: 30,
            description: 'Pour les professionnels exigeants',
            features: ['30 analyses de CV', 'Rapport PDF avancé', 'Matching offre illimité', 'Rédaction CV par expert humain', 'Support prioritaire 24/7'],
            popular: false, order: 3
        }
    ];

    for (const p of plans) {
        // ⚠️ CORRECTION : documentId doit être AU NIVEAU RACINE, pas dans data
        const { documentId, ...dataContent } = p;
        
        const res = await fetch(`${BASE_URL}/collections/pricing/documents`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                documentId: documentId,
                data: dataContent,
                permissions: ['read("any")', 'update("any")', 'delete("any")']
            })
        });
        const data = await res.json();
        if (data.$id || data.message?.includes('already exists')) {
            console.log(`  ✅ Tarif "${p.name}" créé.`);
        } else {
            console.error(`  ❌ Erreur tarif "${p.name}":`, data.message);
        }
        await delay(600);
    }
    console.log('✅ Tous les tarifs sont en ligne !');
}

async function main() {
    if (PROJECT_ID === 'TON_PROJECT_ID') {
        console.log('⚠️ ERREUR : Remplace les 3 identifiants en haut du fichier !');
        return;
    }
    await fixPopularAttribute();
    await delay(1500);
    await createDocuments();
    console.log('\n🎉 Correction terminée avec succès !');
}

main();