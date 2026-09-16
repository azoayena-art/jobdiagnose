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
    console.log('🔧 Correction des permissions...\n');

    // Fix collection CODES
    console.log('1. Correction collection "codes"...');
    const resCodes = await fetch(`${BASE_URL}/collections/codes`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({
            name: 'Codes',
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ],
            documentSecurity: false
        })
    });
    const dataCodes = await resCodes.json();
    if (dataCodes.$id) {
        console.log('✅ Collection "codes" corrigée !');
    } else {
        console.error('❌ Erreur:', dataCodes.message);
    }

    // Fix collection PRICING
    console.log('2. Correction collection "pricing"...');
    const resPricing = await fetch(`${BASE_URL}/collections/pricing`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({
            name: 'Tarifs',
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ],
            documentSecurity: false
        })
    });
    const dataPricing = await resPricing.json();
    if (dataPricing.$id) {
        console.log('✅ Collection "pricing" corrigée !');
    } else {
        console.error('❌ Erreur:', dataPricing.message);
    }

    console.log('\n🎉 Permissions corrigées avec succès !');
}

fixPermissions();