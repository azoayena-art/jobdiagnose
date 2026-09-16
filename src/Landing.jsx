import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DB_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pricingList, setPricingList] = useState([]);

    useEffect(() => { loadPricing(); }, []);

    const loadPricing = async () => {
        try {
            const res = await databases.listDocuments(DB_ID, COLLECTIONS.PRICING, [Query.orderAsc('order')]);
            setPricingList(res.documents);
        } catch (e) { console.error("Erreur chargement tarifs:", e); }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            {/* ══════════════════════════════════════════════════════
                NAVBAR
            ═══════════════════════════════════════════════════════ */}
            <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="JobDiagnose" className="h-10 w-auto" />
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('comment-ca-marche')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium">Comment ça marche</button>
                            <button onClick={() => scrollToSection('avantages')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium">Avantages</button>
                            <button onClick={() => scrollToSection('tarifs')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium">Tarifs</button>
                            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium">FAQ</button>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Mon espace</Link>
                            <Link to="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm">Commencer</Link>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
                            <button onClick={() => scrollToSection('comment-ca-marche')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Comment ça marche</button>
                            <button onClick={() => scrollToSection('avantages')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Avantages</button>
                            <button onClick={() => scrollToSection('tarifs')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Tarifs</button>
                            <button onClick={() => scrollToSection('faq')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">FAQ</button>
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">📊 Mon espace</Link>
                            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700">Commencer gratuitement →</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════ */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-100">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Propulsé par l'Intelligence Artificielle
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                        Transformez votre CV en <span className="text-blue-600">machine à entretiens</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Obtenez un score précis, des conseils personnalisés et un rapport PDF professionnel en 30 secondes. 
                        Nos algorithmes analysent votre CV comme le ferait un recruteur expert.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 text-lg">
                            Analyser mon CV gratuitement →
                        </Link>
                        <button onClick={() => scrollToSection('comment-ca-marche')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg">
                            Voir comment ça marche
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                STATISTIQUES
            ═══════════════════════════════════════════════════════ */}
            <section className="py-12 bg-gray-900 text-white px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { val: '10,000+', label: 'CV analysés' },
                        { val: '+45%', label: 'Taux de réponse en plus' },
                        { val: '30s', label: 'Temps d\'analyse' },
                        { val: '4.9/5', label: 'Satisfaction client' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">{stat.val}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                COMMENT ÇA MARCHE
            ═══════════════════════════════════════════════════════ */}
            <section id="comment-ca-marche" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">3 étapes simples pour optimiser votre candidature.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {[
                            { n: '01', icon: '', title: 'Uploadez votre CV', desc: 'Glissez-déposez votre CV au format PDF. Notre système extrait le texte instantanément.' },
                            { n: '02', icon: '🤖', title: 'L\'IA analyse', desc: 'Notre intelligence artificielle évalue votre CV selon 50+ critères de recrutement.' },
                            { n: '03', icon: '📄', title: 'Recevez votre rapport', desc: 'Téléchargez votre rapport PDF complet avec score, forces, faiblesses et plan d\'action.' }
                        ].map((step, i) => (
                            <div key={i} className="relative p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group">
                                <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 group-hover:text-blue-50 transition-colors">{step.n}</div>
                                <div className="text-5xl mb-6">{step.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                AVANTAGES
            ═══════════════════════════════════════════════════════ */}
            <section id="avantages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir JobDiagnose ?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">L'outil indispensable pour les candidats ambitieux.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '🎯', title: 'Compatible ATS', desc: 'Optimisez vos mots-clés pour passer les filtres automatiques des recruteurs.' },
                            { icon: '⚡', title: 'IA de pointe', desc: 'Propulsé par Mistral AI pour une analyse contextuelle et précise.' },
                            { icon: '🔒', title: 'Données sécurisées', desc: 'Vos CV sont chiffrés et jamais utilisés pour entraîner des modèles publics.' },
                            { icon: '💡', title: 'Conseils actionnables', desc: 'Pas de jugement, que des conseils concrets pour améliorer votre CV.' },
                            { icon: '📊', title: 'Score de matching', desc: 'Mesurez votre compatibilité avec une offre d\'emploi spécifique.' },
                            { icon: '🚀', title: 'Résultats immédiats', desc: 'Obtenez votre rapport détaillé en moins de 30 secondes.' }
                        ].map((adv, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                                <div className="text-3xl mb-4">{adv.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{adv.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{adv.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TÉMOIGNAGES
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ils ont décroché leur entretien</h2>
                        <p className="text-xl text-gray-600">Rejoignez des milliers de candidats qui ont boosté leur carrière.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Sophie M.', role: 'Développeuse Web', text: 'Grâce à JobDiagnose, j\'ai compris pourquoi je n\'avais pas de retours. En 2 jours, j\'ai eu 3 entretiens !', stars: 5 },
                            { name: 'Thomas L.', role: 'Chef de Projet', text: 'Le rapport PDF est incredibly détaillé. Les conseils sur les mots-clés ATS ont tout changé pour moi.', stars: 5 },
                            { name: 'Amina K.', role: 'Data Analyst', text: 'L\'analyse de matching avec l\'offre d\'emploi est une pépite. J\'ai adapté mon CV et j\'ai été embauchée.', stars: 5 }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col">
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(t.stars)].map((_, j) => <span key={j}>★</span>)}
                                </div>
                                <p className="text-gray-700 italic mb-6 flex-1">"{t.text}"</p>
                                <div>
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                    <div className="text-sm text-gray-500">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TARIFS
            ═══════════════════════════════════════════════════════ */}
            <section id="tarifs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Des tarifs simples et transparents</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Commencez gratuitement, passez au niveau supérieur quand vous êtes prêt.</p>
                    </div>
                    
                    {pricingList.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des tarifs...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {pricingList.map((plan) => {
                                const isFree = plan.name.toLowerCase().includes('gratuit') || plan.name.toLowerCase().includes('free') || plan.price === 0;
                                let comeUpLink = "https://comeup.com/fr/service/188817/identifier-ce-qui-bloque-vos-candidatures-et-ameliorer-votre-cv";
                                if (plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('illimité')) {
                                    comeUpLink = "https://comeup.com/fr/pay/66yL3DtJMqBQ";
                                }

                                return (
                                    <div key={plan.$id} className={`relative bg-white rounded-2xl p-8 border ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-200'} flex flex-col`}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                                Le plus populaire
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <p className="text-gray-600">{plan.description}</p>
                                        </div>
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                                            <span className="text-gray-500"> / analyse</span>
                                        </div>
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {isFree ? (
                                            <Link to="/auth" className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all block ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                                Commencer gratuitement
                                            </Link>
                                        ) : (
                                            <a href={comeUpLink} target="_blank" rel="noopener noreferrer" className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all block ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                                Choisir ce plan
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FAQ (AVEC QUESTIONS PREMIUM)
            ═══════════════════════════════════════════════════════ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
                        <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur JobDiagnose.</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Mes données sont-elles en sécurité ?", a: "Absolument. Votre CV est analysé de manière sécurisée via des serveurs chiffrés et n'est jamais utilisé pour entraîner des modèles d'IA publics. Vous pouvez supprimer vos données à tout moment depuis votre espace." },
                            { q: "Comment fonctionne le code d'activation ?", a: "Après vos 3 analyses gratuites, vous pouvez acheter un code d'activation sur notre page ComeUp. Une fois reçu, il suffit de le saisir dans votre espace personnel pour débloquer instantanément vos analyses supplémentaires." },
                            { q: "Quelle est la différence entre Essentiel et Premium ?", a: "Le plan Essentiel (5,99€) est parfait pour une analyse ponctuelle avant un envoi important. Le plan Premium (49,99€) est conçu pour les chercheurs d'emploi intensifs : il inclut un nombre illimité d'analyses, un support prioritaire et des conseils de réécriture avancés." },
                            { q: "L'analyse est-elle vraiment objective ?", a: "Notre IA est entraînée sur des milliers de CV et d'offres d'emploi réels. Elle évalue votre CV selon les mêmes critères qu'un recruteur professionnel ou un logiciel ATS (mots-clés, structure, verbes d'action, impact chiffré)." },
                            { q: "Puis-je être remboursé si je ne suis pas satisfait ?", a: "Oui. Si le rapport ne vous apporte aucune valeur, contactez-nous via ComeUp dans les 7 jours suivant votre achat pour un remboursement complet, sans justification." },
                            { q: "Quels formats de CV sont acceptés ?", a: "Nous acceptons les fichiers PDF (recommandé pour conserver la mise en forme) et les fichiers DOCX. Le poids maximum est de 5 Mo." }
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.q}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CONTACT / CTA FINAL
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Prêt à décrocher votre prochain entretien ?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Ne laissez plus un CV mal optimisé vous fermer des portes. Obtenez votre diagnostic professionnel dès maintenant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="https://comeup.com/fr/service/188817/identifier-ce-qui-bloque-vos-candidatures-et-ameliorer-votre-cv" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg text-lg">
                            Commander sur ComeUp →
                        </a>
                        <Link to="/auth" className="inline-block px-8 py-4 bg-blue-500/30 text-white border border-blue-400/50 rounded-xl font-semibold hover:bg-blue-500/50 transition-colors text-lg">
                            Essayer gratuitement
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════ */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="JobDiagnose" className="h-8 w-auto brightness-0 invert" />
                            <span className="text-xl font-bold text-white">JobDiagnose</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            L'outil d'analyse de CV par intelligence artificielle pour les candidats qui veulent se démarquer.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => scrollToSection('comment-ca-marche')} className="hover:text-white transition-colors">Comment ça marche</button></li>
                            <li><button onClick={() => scrollToSection('avantages')} className="hover:text-white transition-colors">Avantages</button></li>
                            <li><button onClick={() => scrollToSection('tarifs')} className="hover:text-white transition-colors">Tarifs</button></li>
                            <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/legal" className="hover:text-white transition-colors">Mentions légales & CGU</Link></li>
                            <li><Link to="/legal" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
                    <p>© {new Date().getFullYear()} COMREDACTION. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}