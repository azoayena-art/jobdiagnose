import { Link } from 'react-router-dom';

export default function Legal() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-4 text-sm font-medium">
                        ← Retour à l'accueil
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Mentions Légales & Conditions</h1>
                    <p className="text-blue-100 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
                </div>

                <div className="p-8 space-y-12">
                    {/* 1. MENTIONS LÉGALES */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">1</span>
                            Mentions Légales
                        </h2>
                        <div className="prose prose-blue text-gray-600 space-y-4">
                            <p><strong>Éditeur du site :</strong><br />
                            COMREDACTION<br />
                            Cotonou — République du Bénin<br />
                            RCCM : RB/COT/22 A 77165<br />
                            Téléphone : +229 01 97 18 11 23<br />
                            E-mail : contact@coachemploipro.com</p>
                            
                            <p><strong>Directeur de la publication :</strong><br />
                            Le représentant légal de COMREDACTION.</p>

                            <p><strong>Hébergement web :</strong><br />
                            Vercel Inc.<br />
                            340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.</p>

                            <p><strong>Infrastructure de base de données et stockage :</strong><br />
                            Appwrite (Open Source Backend), hébergé sur des serveurs cloud sécurisés.</p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* 2. CONDITIONS GÉNÉRALES D'UTILISATION (CGU) */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">2</span>
                            Conditions Générales d'Utilisation (CGU)
                        </h2>
                        <div className="prose prose-blue text-gray-600 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">2.1. Objet</h3>
                            <p>Les présentes CGU régissent l'utilisation de l'application web <strong>JobDiagnose</strong> (accessible via app.coachemploipro.com), éditée par COMREDACTION. L'accès et l'utilisation du service impliquent l'acceptation sans réserve de ces conditions.</p>

                            <h3 className="text-lg font-semibold text-gray-800">2.2. Description du service</h3>
                            <p>JobDiagnose est un outil d'aide à la rédaction de CV utilisant l'intelligence artificielle (IA) pour analyser le contenu d'un curriculum vitae, le comparer à une offre d'emploi et fournir un score ainsi que des conseils d'amélioration.</p>
                            <p className="bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800 text-sm">
                                <strong>Disclaimer IA :</strong> Les analyses fournies par l'IA sont des recommandations à titre indicatif. COMREDACTION ne garantit pas l'obtention d'un entretien ou d'un emploi sur la base de ces recommandations. L'utilisateur reste seul responsable du contenu final de son CV.
                            </p>

                            <h3 className="text-lg font-semibold text-gray-800">2.3. Tarifs et Paiement</h3>
                            <p>Le service propose un plan gratuit limité et des plans payants (Essentiel, Premium). Les paiements sont sécurisés et traités via des prestataires de confiance (ex: ComeUp). Les services numériques fournis ne sont pas susceptibles de droit de rétractation une fois l'analyse générée, sauf garantie satisfait ou remboursé explicitement mentionnée.</p>

                            <h3 className="text-lg font-semibold text-gray-800">2.4. Propriété intellectuelle</h3>
                            <p>L'application, son code source, son design et ses algorithmes sont la propriété exclusive de COMREDACTION. L'utilisateur conserve l'entière propriété des données de son CV qu'il télécharge.</p>

                            <h3 className="text-lg font-semibold text-gray-800">2.5. Limitation de responsabilité</h3>
                            <p>COMREDACTION s'efforce d'assurer l'exactitude des informations, mais ne saurait être tenu responsable des erreurs, omissions ou des indisponibilités temporaires du service.</p>
                        </div>
                    </section>

                    <hr className="border-gray-200" />

                    {/* 3. POLITIQUE DE CONFIDENTIALITÉ */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">3</span>
                            Politique de Confidentialité
                        </h2>
                        <div className="prose prose-blue text-gray-600 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">3.1. Engagement de protection</h3>
                            <p>COMREDACTION s'engage à protéger vos données personnelles conformément à la législation en vigueur en République du Bénin (Loi n° 2009-09 relative à la protection des données à caractère personnel) et au RGPD pour les utilisateurs européens.</p>

                            <h3 className="text-lg font-semibold text-gray-800">3.2. Données collectées</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Données de compte :</strong> Nom, adresse e-mail.</li>
                                <li><strong>Données d'analyse :</strong> Fichier CV (PDF/DOCX), texte extrait du CV, texte de l'offre d'emploi collé manuellement.</li>
                                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur (via des cookies techniques essentiels).</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800">3.3. Finalité du traitement</h3>
                            <p>Vos données sont utilisées exclusivement pour : fournir le service d'analyse IA, gérer votre compte utilisateur, assurer la facturation des plans payants et améliorer la qualité de nos algorithmes.</p>

                            <h3 className="text-lg font-semibold text-gray-800">3.4. Partage des données</h3>
                            <p>Nous ne vendons jamais vos données. Elles peuvent être transmises à nos sous-traitants techniques strictement pour le fonctionnement du service :</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Mistral AI :</strong> Pour le traitement du langage naturel (les données sont envoyées de manière sécurisée et ne servent pas à entraîner leurs modèles publics).</li>
                                <li><strong>Vercel & Appwrite :</strong> Pour l'hébergement et le stockage sécurisé.</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-800">3.5. Durée de conservation</h3>
                            <p>Les données de votre compte et l'historique de vos analyses sont conservés pendant la durée de votre abonnement, et jusqu'à 12 mois après la dernière activité ou la suppression de votre compte, sauf obligation légale contraire.</p>

                            <h3 className="text-lg font-semibold text-gray-800">3.6. Vos droits</h3>
                            <p>Conformément à la loi, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@coachemploipro.com" className="text-blue-600 hover:underline font-medium">contact@coachemploipro.com</a>.</p>
                        </div>
                    </section>
                </div>

                {/* Footer du composant */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                        Pour toute question juridique, contactez-nous à <a href="mailto:contact@coachemploipro.com" className="text-blue-600 hover:underline">contact@coachemploipro.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}