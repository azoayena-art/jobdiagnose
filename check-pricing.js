const PROJECT_ID = '6aa30ee1002fdf9e18de'; 
const DATABASE_ID = 'jobdiagnose_db'; 
const API_KEY = 'standard_235ba42304c414ce65b741f30965648571697cef0dbde52aa8ab6050e88d572dcef65653b48f66f972dfa6981c5f1cd05f03a004336d41f87a8b372f6a818ee46dbc51afa506a56d2a3c2b56e9a411b5d148d2230fe188f0aa986aa4b07dac4d292fb208c4b8dbb359f2763756b149c1dca4ef273dbed4cc2f8129f08117a90f'; // Clé API avec TOUTES les permissions cochées

const BASE_URL = `https://cloud.appwrite.io/v1/databases/${DATABASE_ID}`;
const HEADERS = {
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
    'Content-Type': 'application/json'
};

async function checkAndFix() {
    console.log('🔍 Diagnostic de la collection pricing...\n');

    // 1. Lister les documents existants
    const res = await fetch(`${BASE_URL}/collections/pricing/documents`, {
        method: 'GET',
        headers: HEADERS
    });
    const data = await res.json();

    if (data.documents && data.documents.length > 0) {
        console.log(`✅ ${data.documents.length} document(s) trouvé(s) :\n`);
        data.documents.forEach(d => {
            console.log(`  - ${d.name} (${d.price}€) | ID: ${d.$id}`);
        });
        console.log('\n🎉 Les tarifs existent déjà ! Le problème vient d\'ailleurs.');
        return;
    } else {
        console.log('⚠️ Aucun document trouvé. Création en cours...\n');
    }

    // 2. Créer les documents correctement
    const plans = [
        {
            documentId: 'decouverte',
            data: {
                plan: 'decouverte', name: 'Découverte', price: 0, analyses: 3,
                description: 'Pour tester le service',
                features: ['3 analyses de CV', 'Rapport PDF basique', 'Score et conseils IA'],
                popular: false, order: 1
            }
        },
        {
            documentId: 'essentiel',
            data: {
                plan: 'essentiel', name: 'Essentiel', price: 5.99, analyses: 10,
                description: 'Pour les chercheurs d\'emploi actifs',
                features: ['10 analyses de CV', 'Rapport PDF professionnel 3 pages', 'Matching offre d\'emploi', 'Support email'],
                popular: true, order: 2
            }
        },
        {
            documentId: 'premium',
            data: {
                plan: 'premium', name: 'Premium', price: 49.99, analyses: 30,
                description: 'Pour les professionnels exigeants',
                features: ['30 analyses de CV', 'Rapport PDF avancé', 'Matching offre illimité', 'Rédaction CV par expert humain', 'Support prioritaire 24/7'],
                popular: false, order: 3
            }
        }
    ];

    for (const p of plans) {
        const res = await fetch(`${BASE_URL}/collections/pricing/documents`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                documentId: p.documentId,
                data: p.data,
                permissions: ['read("any")', 'update("any")', 'delete("any")']
            })
        });
        const result = await res.json();
        
        if (result.$id) {
            console.log(`✅ Tarif "${p.data.name}" créé avec succès !`);
        } else if (result.message?.includes('already exists')) {
            console.log(`ℹ️ Tarif "${p.data.name}" existe déjà.`);
        } else {
            console.error(`❌ Erreur pour "${p.data.name}":`, result.message);
        }
    }

    console.log('\n🎉 Diagnostic terminé !');
}

checkAndFix();