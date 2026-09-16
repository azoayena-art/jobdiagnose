import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// ═══════════════════════════════════════════════════════
// CONFIGURATION APPWRITE
// ═══════════════════════════════════════════════════════
const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6aa30ee1002fdf9e18de'); // ⚠️ REMPLACE PAR TON PROJECT ID (ex: 67b8e4f8000a8b9c91d3)

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
export const DB_ID = 'jobdiagnose_db'; // ⚠️ REMPLACE PAR TON DATABASE ID (ex: 67b8e5a0003a6b3c7d4e)
export const BUCKET_ID = 'CVS'; // ⚠️ REMPLACE PAR TON BUCKET ID (celui où tu stockes les CV)

// ═══════════════════════════════════════════════════════
// NOMS DES COLLECTIONS
// ═══════════════════════════════════════════════════════
export const COLLECTIONS = {
    USERS: 'users',
    CVs: 'CVS',
    CODES: 'codes',
    PRICING: 'pricing' // ✅ Collection des tarifs (ajoutée pour l'admin)
};