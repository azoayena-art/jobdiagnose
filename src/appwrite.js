import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6aa30ee1002fdf9e18de'); // ⚠️ REMPLACE PAR TON PROJECT ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query, Permission, Role };

export const DB_ID = 'jobdiagnose_db'; // ⚠️ REMPLACE PAR TON DATABASE ID
export const BUCKET_ID = 'cvs'; // ⚠️ REMPLACE PAR TON BUCKET ID

export const COLLECTIONS = {
    USERS: 'users',
    CVs: 'cvs',
    CODES: 'codes',
    PRICING: 'pricing'
};