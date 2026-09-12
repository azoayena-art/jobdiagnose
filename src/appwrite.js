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
    USERS: 'users_profiles',
    CVS: 'cvs',
    OFFERS: 'job_offers',
    APPLICATIONS: 'applications'
};
export const BUCKET_ID = 'cvs';