import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// ═══════════════════════════════════════════════════════
// CONFIGURATION APPWRITE
// ═══════════════════════════════════════════════════════
const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('TON_PROJECT_ID'); // ⚠️ REMPLACE PAR TON PROJECT ID

// ═══════════════════════════════════════════════════════
// EXPORTS DES SERVICES
// ═══════════════════════════════════════════════════════
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Ré-exportation des utilitaires Appwrite
export { ID, Query, Permission, Role };

// ═══════════════════════════════════════════════════════
// IDENTIFIANTS DES RESSOURCES
// ═══════════════════════════════════════════════════════
export const DB_ID = 'jobdiagnose_db'; // ⚠️ REMPLACE PAR TON DATABASE ID
export const BUCKET_ID = 'cvs'; // ⚠️ REMPLACE PAR TON BUCKET ID

// ═══════════════════════════════════════════════════════
// NOMS DES COLLECTIONS (TOUT EN MAJUSCULES)
// ═══════════════════════════════════════════════════════
export const COLLECTIONS = {
    USERS: 'users',
    CVS: 'cvs',        // ✅ CORRIGÉ : CVS tout en majuscules
    CODES: 'codes',
    PRICING: 'pricing'
};