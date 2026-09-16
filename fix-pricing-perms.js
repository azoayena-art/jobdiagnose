const PROJECT_ID = '6aa30ee1002fdf9e18de'; 
const DATABASE_ID = 'jobdiagnose_db'; 
const API_KEY = 'standard_235ba42304c414ce65b741f30965648571697cef0dbde52aa8ab6050e88d572dcef65653b48f66f972dfa6981c5f1cd05f03a004336d41f87a8b372f6a818ee46dbc51afa506a56d2a3c2b56e9a411b5d148d2230fe188f0aa986aa4b07dac4d292fb208c4b8dbb359f2763756b149c1dca4ef273dbed4cc2f8129f08117a90f'; // Clé API avec TOUTES les permissions cochées

const BASE_URL = `https://cloud.appwrite.io/v1/databases/${DATABASE_ID}`;
const HEADERS = {
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
    'Content-Type': 'application/json'
};

async function fixPermissions() {
    console.log('🔧 Correction des permissions des documents pricing...\n');

    // Lister tous les documents
    const res = await fetch(`${BASE_URL}/collections/pricing/documents`, {
        method: 'GET',
        headers: HEADERS
    });
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) {
        console.log('❌ Aucun document trouvé. Exécute d\'abord check-pricing.js');
        return;
    }

    // Mettre à jour les permissions de chaque document
    for (const doc of data.documents) {
        const updateRes = await fetch(`${BASE_URL}/collections/pricing/documents/${doc.$id}`, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify({
                data: doc,
                permissions: ['read("any")', 'update("any")', 'delete("any")']
            })
        });
        const result = await updateRes.json();
        
        if (result.$id) {
            console.log(`✅ Permissions corrigées pour "${doc.name}"`);
        } else {
            console.error(`❌ Erreur pour "${doc.name}":`, result.message);
        }
    }

    console.log('\n🎉 Permissions corrigées !');
}

fixPermissions();