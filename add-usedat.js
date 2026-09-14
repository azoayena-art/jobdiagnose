import { Client, Databases } from 'node-appwrite';

// ⚠️ REMPLACEZ CES 3 VALEURS PAR VOS VRAIS IDs
const PROJECT_ID = '6aa30ee1002fdf9e18de'; 
const API_KEY = 'standard_235ba42304c414ce65b741f30965648571697cef0dbde52aa8ab6050e88d572dcef65653b48f66f972dfa6981c5f1cd05f03a004336d41f87a8b372f6a818ee46dbc51afa506a56d2a3c2b56e9a411b5d148d2230fe188f0aa986aa4b07dac4d292fb208c4b8dbb359f2763756b149c1dca4ef273dbed4cc2f8129f08117a90f'; 
const DATABASE_ID = 'jobdiagnose_db'; 

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject(PROJECT_ID);
client.setKey(API_KEY);

const databases = new Databases(client);

async function addUsedAtAttribute() {
    try {
        console.log('⏳ Ajout de l\'attribut "usedAt" à la collection "codes"...');
        
        await databases.createStringAttribute(DATABASE_ID, 'codes', 'usedAt', 255, false);
        
        console.log('✅ Attribut "usedAt" ajouté avec succès !');
        console.log('🎉 Vous pouvez maintenant supprimer ce fichier.');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

addUsedAtAttribute();