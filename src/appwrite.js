import { Client, Account, Databases, Storage, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6aa30ee1002fdf9e18de'); 

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

export const DB_ID = 'jobdiagnose_db';
export const COLLECTIONS = {
    USERS: import.meta.env.VITE_APPWRITE_COLLECTIONS_USERS,
    CVS: import.meta.env.VITE_APPWRITE_COLLECTIONS_CVS,
    CODES: 'codes' // ️ CETTE LIGNE DOIT ÊTRE PRÉSENTE
};
export const BUCKET_ID = 'cvs';