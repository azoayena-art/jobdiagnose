import { Client, Account, Databases, Storage, ID } from 'appwrite';

const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

// Ces variables sont lues depuis votre fichier .env et Vercel
export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const COLLECTIONS = {
    USERS: import.meta.env.VITE_APPWRITE_COLLECTIONS_USERS,
    CVS: import.meta.env.VITE_APPWRITE_COLLECTIONS_CVS,
    CODES: 'codes' // Assurez-vous que l'ID de votre collection dans Appwrite est bien 'codes'
};