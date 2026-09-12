import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                            <span className="text-2xl">💼</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">JobDiagnose</h1>
                            <p className="text-xs text-gray-600">Boostez votre carrière</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href="#pricing" className="px-6 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors">
                            Tarifs
                        </a>
                        <Link to="/auth" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                            Commencer
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <span>🚀</span>
                        <span>Nouveau : Analyse IA instantanée de votre CV</span>
                    </div>
                    <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Optimisez votre CV avec<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            l'intelligence artificielle
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        Obtenez un diagnostic personnalisé, comparez-le aux offres d'emploi 
                        et recevez des recommandations concrètes pour décrocher votre job de rêve.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                            <span className="flex items-center justify-center gap-2">
                                <span>🎯</span> Analyser mon CV gratuitement
                            </span>
                        </Link>
                        <a href="#pricing" className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-2xl font-bold text-lg hover:border-yellow-500 hover:text-yellow-600 transition-all shadow-lg">
                            <span className="flex items-center justify-center gap-2">
                                <span>👑</span> Voir les offres Premium
                            </span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin pour réussir</h3>
                        <p className="text-xl text-gray-600">Des outils puissants pour transformer votre recherche d'emploi</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mb-6">
                                <span className="text-3xl">📊</span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-3">Score de Matching</h4>
                            <p className="text-gray-600">Comparez automatiquement votre CV aux offres d'emploi et obtenez un score de compatibilité précis.</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center mb-6">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-3">Analyse IA Avancée</h4>
                            <p className="text-gray-600">Bénéficiez d'un diagnostic détaillé avec points forts, axes d'amélioration et conseils personnalisés.</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center mb-6">
                                <span className="text-3xl">⚡</span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-3">Extraction Automatique</h4>
                            <p className="text-gray-600">Uploadez simplement votre PDF, l'extraction du texte se fait automatiquement en quelques secondes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Tarifs Freemium */}
            <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <span>💎</span>
                            <span>Tarifs transparents</span>
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">
                            Choisissez votre formule
                        </h3>
                        <p className="text-xl text-gray-600">
                            Commencez gratuitement, passez au niveau supérieur quand vous êtes prêt
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Plan Gratuit */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">🆓</span>
                                <h4 className="text-2xl font-bold text-gray-900">Découverte</h4>
                            </div>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">0€</span>
                                <span className="text-gray-600"> / analyse</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>1 analyse de CV gratuite</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Score de matching basique</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>3 points forts et faiblesses</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-400">
                                    <span>✗</span>
                                    <span>Export PDF du rapport</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-400">
                                    <span>✗</span>
                                    <span>Analyses illimitées</span>
                                </li>
                            </ul>
                            <Link to="/auth" className="block w-full py-3 px-6 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-bold text-center hover:border-blue-600 hover:text-blue-600 transition-all">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Plan Essentiel - 9,99€/mois */}
                        <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 shadow-xl relative transform md:scale-105">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                ⭐ POPULAIRE
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">🥉</span>
                                <h4 className="text-2xl font-bold text-gray-900">Essentiel</h4>
                            </div>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-blue-600">9,99€</span>
                                <span className="text-gray-600"> / mois</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Analyses illimitées</strong> pendant 1 mois</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Rapport complet détaillé</strong></span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Export PDF</strong> du diagnostic</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Matching CV vs Offre avancé</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-400">
                                    <span>✗</span>
                                    <span>Rédaction ou révision humaine</span>
                                </li>
                            </ul>
                            <a 
                                href="https://comeup.com/fr/pay/JDlXGkTRPbYG" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                            >
                                🚀 Obtenir l'Essentiel (9,99€/mois)
                            </a>
                        </div>

                        {/* Plan Premium - 49,99€ */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-400 hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">👑</span>
                                <h4 className="text-2xl font-bold text-gray-900">Premium</h4>
                            </div>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-orange-600">49,99€</span>
                                <span className="text-gray-600"> / pack complet</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Tout l'Essentiel inclus</strong></span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Rédaction complète et optimisée</strong> de votre CV</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span><strong>Lettre de motivation</strong> 100% personnalisée</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Conseils carrière et stratégie d'entretien</span>
                                </li>
                                <li className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Livraison prioritaire sous 48h</span>
                                </li>
                            </ul>
                            <a 
                                href="https://comeup.com/fr/pay/X4gdrlCxauoT" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-center hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                            >
                                👑 Choisir le Premium (49,99€)
                            </a>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 mt-8 flex items-center justify-center gap-2">
                        <span>🔒</span> Paiement 100% sécurisé via Comeup • Satisfait ou remboursé
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">500+</div>
                            <div className="text-blue-100">CV analysés</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">85%</div>
                            <div className="text-blue-100">Taux de satisfaction</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">100%</div>
                            <div className="text-blue-100">Gratuit pour commencer</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="text-2xl">💼</span>
                        <span className="text-xl font-bold text-white">JobDiagnose</span>
                    </div>
                    <p className="text-gray-400 mb-4">
                        © 2026 JobDiagnose. Tous droits réservés.
                    </p>
                    <a href="https://comeup.com/fr/pay/X4gdrlCxauoT" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm">
                        Nos services Premium de rédaction sur Comeup
                    </a>
                </div>
            </footer>
        </div>
    );
}