import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, DB_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🚀 Dashboard: Démarrage...');
        
        const checkAuth = async () => {
            try {
                console.log('🔍 Vérification authentification...');
                const currentUser = await account.get();
                console.log('✅ Utilisateur connecté:', currentUser.name);
                setUser(currentUser);
                
                console.log('📊 Chargement des analyses...');
                const res = await databases.listDocuments(DB_ID, COLLECTIONS.CVS, [
                    Query.equal('userId', currentUser.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(50)
                ]);
                console.log(`✅ ${res.documents.length} analyses trouvées`);
                setAnalyses(res.documents);
                setLoading(false);
            } catch (err) {
                console.error('❌ Erreur Dashboard:', err);
                setError(err.message);
                setLoading(false);
                
                // Si pas connecté, rediriger vers /auth
                if (err.code === 401) {
                    console.log('🔒 Non connecté, redirection vers /auth');
                    navigate('/auth');
                }
            }
        };
        
        checkAuth();
    }, [navigate]);

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <div className="flex gap-2">
                            <Link to="/auth" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                Se connecter
                            </Link>
                            <Link to="/" className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                                Accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Si pas d'utilisateur (ne devrait pas arriver)
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
        );
    }

    // Dashboard principal
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bonjour, {user.name} 👋</h1>
                        <p className="text-gray-600">Voici un aperçu de vos analyses de CV</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link to="/auth" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">+ Nouvelle analyse</Link>
                        <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">← Accueil</Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total analyses</div>
                        <div className="text-3xl font-bold text-gray-900">{analyses.length}</div>
                        <div className="text-xs text-blue-600 mt-2">CV analysés</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Score moyen</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0}
                            <span className="text-lg text-gray-400">/100</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">Sur tous vos CV</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Meilleur score</div>
                        <div className="text-3xl font-bold text-green-600">
                            {analyses.length > 0 ? Math.max(...analyses.map(a => a.score)) : 0}
                            <span className="text-lg text-gray-400">/100</span>
                        </div>
                        <div className="text-xs text-green-600 mt-2">Votre record</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Plan actif</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {localStorage.getItem(`jobdiagnose_plan_${user.$id}`) === 'premium' ? '👑 Premium' : 
                             localStorage.getItem(`jobdiagnose_plan_${user.$id}`) === 'essentiel' ? '⭐ Essentiel' : '🆓 Gratuit'}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {localStorage.getItem(`jobdiagnose_plan_${user.$id}`) === 'free' ? '3 analyses offertes' : 'Illimité'}
                        </div>
                    </div>
                </div>

                {/* Historique */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">📋 Historique de vos analyses</h2>
                        <p className="text-sm text-gray-500 mt-1">Retrouvez tous vos rapports</p>
                    </div>

                    {analyses.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📄</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune analyse pour le moment</h3>
                            <p className="text-gray-600 mb-6">Commencez par analyser votre premier CV !</p>
                            <Link to="/auth" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                                Analyser mon CV maintenant →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fichier</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analyses.map((a) => (
                                        <tr key={a.$id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-blue-600 text-lg">📄</span>
                                                    </div>
                                                    <div className="font-semibold text-gray-900">{a.fileName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(a.$createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-2xl font-bold ${a.score >= 70 ? 'text-green-600' : (a.score >= 50 ? 'text-yellow-600' : 'text-red-600')}`}>
                                                    {a.score}<span className="text-sm text-gray-400">/100</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}