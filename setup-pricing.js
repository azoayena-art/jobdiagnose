import { Client, Databases, ID, Permission, Role } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6aa30ee1002fdf9e18de')  // Remplace par ton Project ID
    .setKey('standard_235ba42304c414ce65b741f30965648571697cef0dbde52aa8ab6050e88d572dcef65653b48f66f972dfa6981c5f1cd05f03a004336d41f87a8b372f6a818ee46dbc51afa506a56d2a3c2b56e9a411b5d148d2230fe188f0aa986aa4b07dac4d292fb208c4b8dbb359f2763756b149c1dca4ef273dbed4cc2f8129f08117a90f');  // Remplace par ta clé API avec permissions

const databases = new Databases(client);

const DB_ID = 'jobdiagnose_db';  // Remplace par ton Database ID

async function setupPricing() {
    try {
        console.log('🚀 Création de la collection pricing...');
        
        await databases.createCollection(
            DB_ID,
            'pricing',
            'Tarifs',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ],
            [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );

        console.log('✅ Collection pricing créée');

        // Créer les attributs
        console.log('📝 Création des attributs...');
        
        await databases.createStringAttribute(DB_ID, 'pricing', 'plan', 50, true);
        await databases.createStringAttribute(DB_ID, 'pricing', 'name', 100, true);
        await databases.createFloatAttribute(DB_ID, 'pricing', 'price', true);
        await databases.createIntegerAttribute(DB_ID, 'pricing', 'analyses', true);
        await databases.createStringAttribute(DB_ID, 'pricing', 'description', 500, true);
        await databases.createBooleanAttribute(DB_ID, 'pricing', 'popular', false, false);
        await databases.createIntegerAttribute(DB_ID, 'pricing', 'order', true);

        console.log('✅ Attributs créés');

        // Créer les documents initiaux
        console.log('💰 Création des tarifs initiaux...');

        await databases.createDocument(DB_ID, 'pricing', ID.unique(), {
            plan: 'decouverte',
            name: 'Découverte',
            price: 0,
            analyses: 3,
            description: 'Pour tester le service',
            features: ['3 analyses de CV', 'Rapport PDF basique', 'Score et conseils IA'],
            popular: false,
            order: 1
        });

        await databases.createDocument(DB_ID, 'pricing', ID.unique(), {
            plan: 'essentiel',
            name: 'Essentiel',
            price: 5.99,
            analyses: 10,
            description: 'Pour les chercheurs d\'emploi actifs',
            features: ['10 analyses de CV', 'Rapport PDF professionnel 3 pages', 'Matching offre d\'emploi', 'Support email'],
            popular: true,
            order: 2
        });

        await databases.createDocument(DB_ID, 'pricing', ID.unique(), {
            plan: 'premium',
            name: 'Premium',
            price: 49.99,
            analyses: 30,
            description: 'Pour les professionnels exigeants',
            features: ['30 analyses de CV', 'Rapport PDF avancé', 'Matching offre illimité', 'Rédaction CV par expert humain', 'Support prioritaire 24/7'],
            popular: false,
            order: 3
        });

        console.log('✅ Tarifs initiaux créés');
        console.log('🎉 Setup pricing terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

setupPricing();