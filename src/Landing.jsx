import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, DB_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { useTheme } from './hooks/useTheme';

// ═══════════════════════════════════════════════════════════════
// ICÔNES SVG
// ═══════════════════════════════════════════════════════════════
const Icon = {
    Sun: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    Moon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    ),
    Upload: () => (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    AI: () => (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
    ),
    Document: () => (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Target: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Lightning: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
    Shield: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
    ),
    Bulb: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
    ),
    Chart: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    Rocket: () => (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
    ),
    Check: () => (
        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    Star: () => (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    Chevron: ({ open }) => (
        <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    ),
    Arrow: () => (
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    )
};

export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pricingList, setPricingList] = useState([]);
    const [openFaq, setOpenFaq] = useState(null);
    const { theme, toggleTheme } = useTheme();

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

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans antialiased text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* ══════════════════════════════════════════════════════
                NAVBAR
            ═══════════════════════════════════════════════════════ */}
            <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="JobDiagnose" className="h-10 w-auto" />
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('comment-ca-marche')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-sm font-medium">Comment ça marche</button>
                            <button onClick={() => scrollToSection('avantages')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-sm font-medium">Avantages</button>
                            <button onClick={() => scrollToSection('tarifs')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-sm font-medium">Tarifs</button>
                            <button onClick={() => scrollToSection('faq')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-sm font-medium">FAQ</button>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-sm">Mon espace</Link>
                            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                {theme === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
                            </button>
                            <Link to="/auth" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm">Commencer</Link>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                            <button onClick={() => scrollToSection('comment-ca-marche')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">Comment ça marche</button>
                            <button onClick={() => scrollToSection('avantages')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">Avantages</button>
                            <button onClick={() => scrollToSection('tarifs')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">Tarifs</button>
                            <button onClick={() => scrollToSection('faq')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">FAQ</button>
                            <button onClick={toggleTheme} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">
                                {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
                            </button>
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">Mon espace</Link>
                            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-center hover:bg-gray-800 dark:hover:bg-gray-100">Commencer gratuitement</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════
                HERO
            ═══════════════════════════════════════════════════════ */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Propulsé par l'Intelligence Artificielle
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
                        Transformez votre CV en <span className="text-blue-600 dark:text-blue-400">machine à entretiens</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Obtenez un score précis, des conseils personnalisés et un rapport PDF professionnel en 30 secondes. 
                        Nos algorithmes analysent votre CV comme le ferait un recruteur expert.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth" className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg text-lg inline-flex items-center justify-center">
                            Analyser mon CV gratuitement
                            <Icon.Arrow />
                        </Link>
                        <button onClick={() => scrollToSection('comment-ca-marche')} className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-lg">
                            Voir comment ça marche
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                STATISTIQUES
            ═══════════════════════════════════════════════════════ */}
            <section className="py-12 bg-gray-900 dark:bg-black text-white px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { val: '1000+', label: 'CV analysés' },
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
            <section id="comment-ca-marche" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Comment ça marche ?</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">3 étapes simples pour optimiser votre candidature.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { n: '01', icon: <Icon.Upload />, title: 'Uploadez votre CV', desc: 'Glissez-déposez votre CV au format PDF. Notre système extrait le texte instantanément.' },
                            { n: '02', icon: <Icon.AI />, title: 'L\'IA analyse', desc: 'Notre intelligence artificielle évalue votre CV selon 50+ critères de recrutement.' },
                            { n: '03', icon: <Icon.Document />, title: 'Recevez votre rapport', desc: 'Téléchargez votre rapport PDF complet avec score, forces, faiblesses et plan d\'action.' }
                        ].map((step, i) => (
                            <div key={i} className="relative p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group">
                                <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 dark:text-gray-800 group-hover:text-blue-50 dark:group-hover:text-blue-950 transition-colors">{step.n}</div>
                                <div className="text-blue-600 dark:text-blue-400 mb-6">{step.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                AVANTAGES
            ═══════════════════════════════════════════════════════ */}
            <section id="avantages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Pourquoi choisir JobDiagnose ?</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">L'outil indispensable pour les candidats ambitieux.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <Icon.Target />, title: 'Compatible ATS', desc: 'Optimisez vos mots-clés pour passer les filtres automatiques des recruteurs.' },
                            { icon: <Icon.Lightning />, title: 'IA de pointe', desc: 'Propulsé par Mistral AI pour une analyse contextuelle et précise.' },
                            { icon: <Icon.Shield />, title: 'Données sécurisées', desc: 'Vos CV sont chiffrés et jamais utilisés pour entraîner des modèles publics.' },
                            { icon: <Icon.Bulb />, title: 'Conseils actionnables', desc: 'Pas de jugement, que des conseils concrets pour améliorer votre CV.' },
                            { icon: <Icon.Chart />, title: 'Score de matching', desc: 'Mesurez votre compatibilité avec une offre d\'emploi spécifique.' },
                            { icon: <Icon.Rocket />, title: 'Résultats immédiats', desc: 'Obtenez votre rapport détaillé en moins de 30 secondes.' }
                        ].map((adv, i) => (
                            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all">
                                <div className="text-blue-600 dark:text-blue-400 mb-4">{adv.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{adv.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{adv.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TÉMOIGNAGES
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ils ont décroché leur entretien</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">Rejoignez des milliers de candidats qui ont boosté leur carrière.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Sophie M.', role: 'Développeuse Web', text: 'Grâce à JobDiagnose, j\'ai compris pourquoi je n\'avais pas de retours. En 2 jours, j\'ai eu 3 entretiens !' },
                            { name: 'Thomas L.', role: 'Chef de Projet', text: 'Le rapport PDF est incroyablement détaillé. Les conseils sur les mots-clés ATS ont tout changé pour moi.' },
                            { name: 'Amina K.', role: 'Data Analyst', text: 'L\'analyse de matching avec l\'offre d\'emploi est une pépite. J\'ai adapté mon CV et j\'ai été embauchée.' }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => <Icon.Star key={j} />)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic mb-6 flex-1">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                TARIFS
            ══════════════════════════════════════════════════════ */}
            <section id="tarifs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Des tarifs simples et transparents</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Commencez gratuitement, passez au niveau supérieur quand vous êtes prêt.</p>
                    </div>
                    
                    {pricingList.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Chargement des tarifs...</p>
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
                                    <div key={plan.$id} className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 border ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-gray-200 dark:border-gray-700'} flex flex-col`}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                                                Le plus populaire
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                                        </div>
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}€</span>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm"> / analyse</span>
                                        </div>
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm">
                                                    <Icon.Check />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {isFree ? (
                                            <Link to="/auth" className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all block ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'}`}>
                                                Commencer gratuitement
                                            </Link>
                                        ) : (
                                            <a href={comeUpLink} target="_blank" rel="noopener noreferrer" className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all block ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'}`}>
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
                FAQ ACCORDÉON
            ═══════════════════════════════════════════════════════ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Questions fréquentes</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">Tout ce que vous devez savoir sur JobDiagnose.</p>
                    </div>
                    <div className="space-y-3">
                        {[
                            { q: "Mes données sont-elles en sécurité ?", a: "Absolument. Votre CV est analysé de manière sécurisée via des serveurs chiffrés et n'est jamais utilisé pour entraîner des modèles d'IA publics. Vous pouvez supprimer vos données à tout moment depuis votre espace." },
                            { q: "Comment fonctionne le code d'activation ?", a: "Après vos 3 analyses gratuites, vous pouvez acheter un code d'activation sur notre page ComeUp. Une fois reçu, il suffit de le saisir dans votre espace personnel pour débloquer instantanément vos analyses supplémentaires." },
                            { q: "Quelle est la différence entre Essentiel et Premium ?", a: "Le plan Essentiel (5,99€) est parfait pour une analyse ponctuelle avant un envoi important. Le plan Premium (49,99€) est conçu pour les chercheurs d'emploi intensifs : il inclut un nombre illimité d'analyses, un support prioritaire et des conseils de réécriture avancés." },
                            { q: "L'analyse est-elle vraiment objective ?", a: "Notre IA est entraînée sur des milliers de CV et d'offres d'emploi réels. Elle évalue votre CV selon les mêmes critères qu'un recruteur professionnel ou un logiciel ATS (mots-clés, structure, verbes d'action, impact chiffré)." },
                            { q: "Quels formats de CV sont acceptés ?", a: "Nous acceptons les fichiers PDF (recommandé pour conserver la mise en forme) et les fichiers DOCX. Le poids maximum est de 5 Mo." }
                        ].map((item, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-900">
                                    <button
                                        onClick={() => toggleFaq(i)}
                                        className="w-full flex items-center justify-between p-6 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-900 dark:text-white pr-4">{item.q}</span>
                                        <Icon.Chevron open={isOpen} />
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                                            {item.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                CTA FINAL
            ═══════════════════════════════════════════════════════ */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Prêt à décrocher votre prochain entretien ?</h2>
                    <p className="text-xl text-gray-300 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                        Ne laissez plus un CV mal optimisé vous fermer des portes. Obtenez votre diagnostic professionnel dès maintenant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="https://comeup.com/fr/service/188817/identifier-ce-qui-bloque-vos-candidatures-et-ameliorer-votre-cv" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg text-lg">
                            Commander sur ComeUp
                        </a>
                        <Link to="/auth" className="inline-block px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors text-lg">
                            Essayer gratuitement
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════ */}
            <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
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
                        <h4 className="text-white font-semibold mb-4 text-sm">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => scrollToSection('comment-ca-marche')} className="hover:text-white transition-colors">Comment ça marche</button></li>
                            <li><button onClick={() => scrollToSection('avantages')} className="hover:text-white transition-colors">Avantages</button></li>
                            <li><button onClick={() => scrollToSection('tarifs')} className="hover:text-white transition-colors">Tarifs</button></li>
                            <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Légal</h4>
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