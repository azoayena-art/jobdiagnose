import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

    return (
        <div className="min-h-screen bg-white">
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
                            <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Connexion</Link>
                            <Link to="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">Commencer</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Nouveau : Analyse IA en 30 secondes
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                        Transformez votre CV en <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">machine à entretiens</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Notre IA analyse votre CV comme un recruteur professionnel. Obtenez un score précis, des conseils personnalisés et un plan d'action concret.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg">Analyser mon CV gratuitement →</Link>
                        <a href="#features" className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border border-gray-200">Voir comment ça marche</a>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin pour réussir</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Analyse IA précise</h3>
                            <p className="text-gray-600">Notre IA évalue votre CV selon 50+ critères utilisés par les recruteurs professionnels.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Rapport PDF professionnel</h3>
                            <p className="text-gray-600">Recevez un rapport de 3 pages avec score visuel, points forts et plan d'action priorisé.</p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Matching offre d'emploi</h3>
                            <p className="text-gray-600">Collez l'offre qui vous intéresse et découvrez à quel point votre CV correspond.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12">Tarifs simples et transparents</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">0€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> 1 analyse de CV</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF basique</li>
                            </ul>
                            <Link to="/auth" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200">Commencer</Link>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-lg relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2"><span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Populaire</span></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Essentiel</h3>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">9,99€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> 10 analyses de CV</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF 3 pages</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Matching offre d'emploi</li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Choisir Essentiel</a>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">19,99€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Analyses illimitées</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF avancé</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Support prioritaire</li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200">Choisir Premium</a>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm">© {new Date().getFullYear()} JobDiagnose. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}