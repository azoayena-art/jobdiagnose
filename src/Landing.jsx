import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const [openFaq, setOpenFaq] = useState(null);
    const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

    const features = [
        { bg: "bg-blue-100", text: "text-blue-600", title: "Analyse IA précise", desc: "Notre IA évalue votre CV selon 50+ critères utilisés par les recruteurs professionnels." },
        { bg: "bg-green-100", text: "text-green-600", title: "Rapport PDF pro", desc: "Recevez un rapport de 3 pages avec score visuel, points forts et plan d'action." },
        { bg: "bg-purple-100", text: "text-purple-600", title: "Matching offre", desc: "Collez l'offre qui vous intéresse et découvrez à quel point votre CV correspond." },
        { bg: "bg-orange-100", text: "text-orange-600", title: "100% confidentiel", desc: "Vos données sont cryptées et jamais partagées. Confidentialité totale garantie." },
        { bg: "bg-red-100", text: "text-red-600", title: "Résultats en 30s", desc: "Pas besoin d'attendre. Uploadez votre CV et recevez votre analyse instantanément." },
        { bg: "bg-indigo-100", text: "text-indigo-600", title: "Plans flexibles", desc: "Commencez gratuitement. Passez au Premium pour des analyses illimitées." }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* 1. NAVBAR */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
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

            {/* 2. HERO SECTION */}
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
                        <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Analyser mon CV gratuitement →</Link>
                        <a href="#features" className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border border-gray-200">Voir comment ça marche</a>
                    </div>
                    
                    {/* 3. SOCIAL PROOF */}
                    <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">M</div>
                                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">T</div>
                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">S</div>
                            </div>
                            <span className="font-medium">+2 500 candidats aidés</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-lg">★★★★★</span>
                            <span className="font-medium">4.9/5 sur ComeUp</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold text-lg">✓</span>
                            <span className="font-medium">100% confidentiel</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SECTION STATS */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div><div className="text-4xl font-bold text-gray-900 mb-2">+87%</div><div className="text-gray-600">de taux de réponse</div></div>
                        <div><div className="text-4xl font-bold text-gray-900 mb-2">30s</div><div className="text-gray-600">pour l'analyse complète</div></div>
                        <div><div className="text-4xl font-bold text-gray-900 mb-2">2 500+</div><div className="text-gray-600">CV analysés</div></div>
                        <div><div className="text-4xl font-bold text-gray-900 mb-2">9/10</div><div className="text-gray-600">recommandent JobDiagnose</div></div>
                    </div>
                </div>
            </section>

            {/* 5. 6 FEATURES */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Tout ce dont vous avez besoin pour réussir</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Une suite complète d'outils propulsés par l'IA pour optimiser votre CV.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <svg className={`w-6 h-6 ${f.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. HOW IT WORKS */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
                        <p className="text-xl text-gray-600">3 étapes simples pour transformer votre CV</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Uploadez votre CV</h3>
                            <p className="text-gray-600">Glissez-déposez votre CV au format PDF. Notre IA extrait automatiquement le texte.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Recevez l'analyse IA</h3>
                            <p className="text-gray-600">En 30 secondes, obtenez un score sur 100, vos points forts et un conseil personnalisé.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Téléchargez le rapport</h3>
                            <p className="text-gray-600">Recevez un rapport PDF professionnel de 3 pages avec plan d'action détaillé.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. TÉMOIGNAGES */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce que disent nos utilisateurs</h2>
                        <p className="text-xl text-gray-600">Rejoignez plus de 2 500 candidats qui ont transformé leur recherche</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4"><span className="text-yellow-400">★★★★★</span></div>
                            <p className="text-gray-700 mb-6 leading-relaxed">"J'ai augmenté mon taux de réponse de 80% après avoir suivi les conseils de JobDiagnose."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">M</div>
                                <div><div className="font-semibold text-gray-900">Marie L.</div><div className="text-sm text-gray-500">Consultante Marketing</div></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4"><span className="text-yellow-400">★★★★★</span></div>
                            <p className="text-gray-700 mb-6 leading-relaxed">"Le rapport PDF est ultra professionnel. J'ai décroché 3 entretiens la semaine suivante."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">T</div>
                                <div><div className="font-semibold text-gray-900">Thomas D.</div><div className="text-sm text-gray-500">Développeur Full-Stack</div></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-4"><span className="text-yellow-400">★★★★★</span></div>
                            <p className="text-gray-700 mb-6 leading-relaxed">"La fonctionnalité de matching avec l'offre d'emploi est géniale. J'adapte mon CV pour chaque candidature."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">S</div>
                                <div><div className="font-semibold text-gray-900">Sophie M.</div><div className="text-sm text-gray-500">Chef de Projet</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. PRICING */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Tarifs simples et transparents</h2>
                    <p className="text-xl text-gray-600 mb-12">Commencez gratuitement, passez au premium quand vous êtes prêt</p>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                            <p className="text-gray-600 mb-6">Pour tester le service</p>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">0€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> 1 analyse de CV</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF basique</li>
                            </ul>
                            <Link to="/auth" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200">Commencer gratuitement</Link>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-lg relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2"><span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Populaire</span></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Essentiel</h3>
                            <p className="text-gray-600 mb-6">Pour les chercheurs d'emploi actifs</p>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">9,99€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> 10 analyses de CV</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF 3 pages</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Matching offre d'emploi</li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Choisir Essentiel</a>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                            <p className="text-gray-600 mb-6">Pour les professionnels exigeants</p>
                            <div className="mb-6"><span className="text-5xl font-bold text-gray-900">19,99€</span></div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Analyses illimitées</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Rapport PDF avancé</li>
                                <li className="flex items-center gap-2 text-gray-700"><span className="text-green-600 font-bold">✓</span> Support prioritaire 24/7</li>
                            </ul>
                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200">Choisir Premium</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FAQ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
                        <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur JobDiagnose</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Comment fonctionne l'analyse IA ?", a: "Notre IA utilise les derniers modèles de langage pour analyser votre CV selon 50+ critères professionnels." },
                            { q: "Mes données sont-elles en sécurité ?", a: "Absolument. Vos CV sont cryptés et stockés de manière sécurisée. Nous ne partageons jamais vos données." },
                            { q: "Puis-je utiliser JobDiagnose pour plusieurs CV ?", a: "Oui ! Avec le plan Essentiel, vous avez droit à 10 analyses. Avec le plan Premium, les analyses sont illimitées." },
                            { q: "Le rapport PDF est-il professionnel ?", a: "Oui, le rapport PDF de 3 pages est conçu pour être clair et actionnable, avec un score visuel et un plan d'action priorisé." }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <button onClick={() => toggleFaq(index)} className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <span className="font-semibold text-gray-900">{faq.q}</span>
                                    <span className={`text-gray-400 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openFaq === index && <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. CTA FINAL */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Prêt à transformer votre CV ?</h2>
                    <p className="text-xl text-blue-100 mb-10">Rejoignez plus de 2 500 candidats qui ont décroché leur emploi grâce à JobDiagnose</p>
                    <Link to="/auth" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">Commencer gratuitement maintenant →</Link>
                    <p className="text-blue-200 text-sm mt-4">✓ Gratuit pour commencer ✓ Sans carte bancaire ✓ Résultats en 30 secondes</p>
                </div>
            </section>

            {/* 11. FOOTER */}
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
                            <p className="text-sm leading-relaxed">L'outil IA qui transforme votre CV en machine à entretiens. Analyse professionnelle en 30 secondes.</p>
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
                        <p className="text-sm">© {new Date().getFullYear()} JobDiagnose. Tous droits réservés.</p>
                        <div className="flex items-center gap-4 text-sm"><span>Fait avec ❤️ en France</span></div>
                    </div>
                </div>
            </footer>
        </div>
    );
}