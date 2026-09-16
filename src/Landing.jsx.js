import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ═══════════════════════════════════════════════════════
                NAVBAR
            ═══════════════════════════════════════════════════════ */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">JD</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">JobDiagnose</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
                            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Connexion
                            </Link>
                            <Link to="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                Commencer gratuitement
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Nouveau : Analyse IA en 30 secondes
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                        Transformez votre CV en
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> machine à entretiens</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Notre IA analyse votre CV comme un recruteur professionnel. Obtenez un score précis, des conseils personnalisés et un plan d'action concret pour décrocher votre prochain emploi.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            Analyser mon CV gratuitement →
                        </Link>
                        <a href="#features" className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border border-gray-200">
                            Voir comment ça marche
                        </a>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
                            </div>
                            <span>+2 500 candidats aidés</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★★★★★</span>
                            <span>4.9/5 sur ComeUp</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold">✓</span>
                            <span>100% confidentiel</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                STATS SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">+87%</div>
                            <div className="text-gray-600">de taux de réponse</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">30s</div>
                            <div className="text-gray-600">pour l'analyse complète</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">2 500+</div>
                            <div className="text-gray-600">CV analysés</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">9/10</div>
                            <div className="text-gray-600">recommandent JobDiagnose</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FEATURES SECTION
            ═══════════════════════════════════════════════════════ */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Tout ce dont vous avez besoin pour réussir
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Une suite complète d'outils propulsés par l'IA pour optimiser votre CV et maximiser vos chances d'embauche.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Analyse IA précise</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Notre IA évalue votre CV selon 50+ critères utilisés par les recruteurs professionnels. Score détaillé et conseils actionnables.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Rapport PDF professionnel</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Recevez un rapport de 3 pages avec score visuel, points forts, axes d'amélioration et plan d'action priorisé.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Matching offre d'emploi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Collez l'offre qui vous intéresse et découvrez à quel point votre CV correspond. Optimisez pour chaque candidature.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">100% confidentiel</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Vos données sont cryptées et jamais partagées. Suppression automatique après analyse. Confidentialité totale garantie.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Résultats en 30 secondes</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Pas besoin d'attendre des jours. Uploadez votre CV et recevez votre analyse complète en moins d'une minute.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Plans flexibles</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Commencez gratuitement avec 1 analyse. Passez au plan Premium pour des analyses illimitées et des fonctionnalités avancées.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                HOW IT WORKS SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Comment ça marche ?
                        </h2>
                        <p className="text-xl text-gray-600">
                            3 étapes simples pour transformer votre CV
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Uploadez votre CV</h3>
                            <p className="text-gray-600">
                                Glissez-déposez votre CV au format PDF. Notre IA extrait automatiquement le texte et analyse la structure.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Recevez l'analyse IA</h3>
                            <p className="text-gray-600">
                                En 30 secondes, obtenez un score sur 100, vos points forts, les axes d'amélioration et un conseil personnalisé.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Téléchargez le rapport</h3>
                            <p className="text-gray-600">
                                Recevez un rapport PDF professionnel de 3 pages avec plan d'action détaillé pour optimiser votre CV.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TESTIMONIALS SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Ce que disent nos utilisateurs
                        </h2>
                        <p className="text-xl text-gray-600">
                            Rejoignez plus de 2 500 candidats qui ont transformé leur recherche d'emploi
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4">
                                <span className="text-yellow-400">★★★★★</span>
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                "J'ai augmenté mon taux de réponse de 80% après avoir suivi les conseils de JobDiagnose. L'analyse est incroyablement précise !"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                                <div>
                                    <div className="font-semibold text-gray-900">Marie L.</div>
                                    <div className="text-sm text-gray-500">Consultante Marketing</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4">
                                <span className="text-yellow-400">★★★★★</span>
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                "Le rapport PDF est ultra professionnel. Je l'ai utilisé pour guider ma refonte de CV et j'ai décroché 3 entretiens la semaine suivante."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full"></div>
                                <div>
                                    <div className="font-semibold text-gray-900">Thomas D.</div>
                                    <div className="text-sm text-gray-500">Développeur Full-Stack</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4">
                                <span className="text-yellow-400">★★★★★</span>
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                "La fonctionnalité de matching avec l'offre d'emploi est géniale. J'adapte mon CV pour chaque candidature et ça paie !"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full"></div>
                                <div>
                                    <div className="font-semibold text-gray-900">Sophie M.</div>
                                    <div className="text-sm text-gray-500">Chef de Projet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                PRICING SECTION
            ═══════════════════════════════════════════════════════ */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Tarifs simples et transparents
                        </h2>
                        <p className="text-xl text-gray-600">
                            Commencez gratuitement, passez au premium quand vous êtes prêt
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Plan Gratuit */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                            <p className="text-gray-600 mb-6">Pour tester le service</p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">0€</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    1 analyse de CV
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Rapport PDF basique
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Score et conseils
                                </li>
                            </ul>
                            <Link to="/auth" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Plan Essentiel */}
                        <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-lg relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Populaire
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Essentiel</h3>
                            <p className="text-gray-600 mb-6">Pour les chercheurs d'emploi actifs</p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">9,99€</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    10 analyses de CV
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Rapport PDF professionnel 3 pages
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Matching offre d'emploi
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Support email prioritaire
                                </li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors">
                                Choisir Essentiel
                            </a>
                        </div>

                        {/* Plan Premium */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                            <p className="text-gray-600 mb-6">Pour les professionnels exigeants</p>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">19,99€</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Analyses illimitées
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Rapport PDF avancé
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Matching offre illimité
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    Support prioritaire 24/7
                                </li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/66yL3DtJMqBQ" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors">
                                Choisir Premium
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FAQ SECTION
            ═══════════════════════════════════════════════════════ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Questions fréquentes
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tout ce que vous devez savoir sur JobDiagnose
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "Comment fonctionne l'analyse IA ?",
                                answer: "Notre IA utilise les derniers modèles de langage (Mistral, Llama) pour analyser votre CV selon 50+ critères professionnels. Elle évalue la structure, le contenu, les mots-clés et la pertinence par rapport aux offres d'emploi."
                            },
                            {
                                question: "Mes données sont-elles en sécurité ?",
                                answer: "Absolument. Vos CV sont cryptés et stockés de manière sécurisée sur Appwrite Cloud. Nous ne partageons jamais vos données avec des tiers. Vous pouvez supprimer vos données à tout moment."
                            },
                            {
                                question: "Puis-je utiliser JobDiagnose pour plusieurs CV ?",
                                answer: "Oui ! Avec le plan Essentiel, vous avez droit à 10 analyses. Avec le plan Premium, les analyses sont illimitées. Parfait pour tester différentes versions de votre CV."
                            },
                            {
                                question: "Le rapport PDF est-il professionnel ?",
                                answer: "Oui, le rapport PDF de 3 pages est conçu pour être clair et actionnable. Il inclut un score visuel, des points forts, des axes d'amélioration et un plan d'action priorisé."
                            },
                            {
                                question: "Puis-je obtenir un remboursement ?",
                                answer: "Nous offrons une garantie satisfait ou remboursé de 7 jours. Si vous n'êtes pas satisfait du service, contactez-nous pour un remboursement complet."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    <span className={`text-gray-400 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CTA SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Prêt à transformer votre CV ?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Rejoignez plus de 2 500 candidats qui ont décroché leur emploi grâce à JobDiagnose
                    </p>
                    <Link to="/auth" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
                        Commencer gratuitement maintenant →
                    </Link>
                    <p className="text-blue-200 text-sm mt-4">
                        ✓ Gratuit pour commencer ✓ Sans carte bancaire ✓ Résultats en 30 secondes
                    </p>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════ */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">JD</span>
                                </div>
                                <span className="text-xl font-bold text-white">JobDiagnose</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                L'outil IA qui transforme votre CV en machine à entretiens. Analyse professionnelle en 30 secondes.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Produit</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Légal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="https://comeup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ComeUp</a></li>
                                <li><a href="mailto:contact@jobdiagnose.com" className="hover:text-white transition-colors">Email</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm">
                            © {new Date().getFullYear()} JobDiagnose. Tous droits réservés.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                            <span>Fait avec ❤️ en France</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}