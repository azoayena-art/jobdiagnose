import { useState } from 'react';
import { account, databases, ID } from './appwrite';
import { Link } from 'react-router-dom';

const ADMIN_PASSWORD = 'JobDiagnose2026!';

// Fonction sécurisée pour lire le localStorage sans faire planter l'app
const getStoredCodes = () => {
    try {
        const stored = localStorage.getItem('jobdiagnose_codes');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Erreur de lecture des codes:", e);
        return [];
    }
};

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('jobdiagnose_admin_auth') === 'true';
    });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const [generatedCodes, setGeneratedCodes] = useState(getStoredCodes);
    const [codeType, setCodeType] = useState('essentiel');
    const [codeCount, setCodeCount] = useState(5);
    const [newCodes, setNewCodes] = useState([]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('jobdiagnose_admin_auth', 'true');
            setError('');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('jobdiagnose_admin_auth');
        setPassword('');
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

     const handleGenerateCodes = async () => {
        const prefix = codeType === 'essentiel' ? 'JD-ESS' : 'JD-PREM';
        const newGenerated = [];
        
        try {
            for (let i = 0; i < codeCount; i++) {
                const code = `${prefix}-${generateCode()}`;
                
                // Sauvegarde directe dans Appwrite (Cloud)
                await databases.createDocument(DB_ID, COLLECTIONS.CODES, ID.unique(), {
                    code: code,
                    type: codeType,
                    used: false,
                    createdAt: new Date().toISOString()
                });
                
                newGenerated.push({ code, type: codeType, used: false });
            }
            setNewCodes(newGenerated);
            alert(`✅ ${codeCount} codes générés et sauvegardés dans le Cloud !`);
        } catch (err) {
            alert('Erreur lors de la génération : ' + err.message);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copié !');
        }).catch(() => {
            alert('Erreur lors de la copie');
        });
    };

    const copyAllNewCodes = () => {
        const codesText = newCodes.map(c => c.code).join('\n');
        navigator.clipboard.writeText(codesText).then(() => {
            alert(`${newCodes.length} codes copiés !`);
        });
    };

    const deleteCode = (codeToDelete) => {
        const updatedCodes = generatedCodes.filter(c => c.code !== codeToDelete);
        localStorage.setItem('jobdiagnose_codes', JSON.stringify(updatedCodes));
        setGeneratedCodes(updatedCodes);
    };

    const clearAllCodes = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les codes ?')) {
            localStorage.removeItem('jobdiagnose_codes');
            setGeneratedCodes([]);
            setNewCodes([]);
        }
    };

    // Page de connexion admin
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium mb-4">
                            <span>←</span>
                            <span>Retour à l'accueil</span>
                        </Link>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl shadow-lg mb-4">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Administration</h2>
                        <p className="mt-2 text-gray-600">Accès réservé</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <span>🔑</span> Mot de passe administrateur
                                </span>
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                                placeholder="Entrez le mot de passe admin"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
                        >
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Mot de passe par défaut :</strong><br/>
                            <code className="font-mono bg-white px-2 py-1 rounded mt-1 inline-block">JobDiagnose2026!</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Panneau admin
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl shadow-lg mb-4">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Panneau d'Administration</h1>
                    <p className="text-gray-600">Génération et gestion des codes d'activation</p>
                    <button
                        onClick={handleLogout}
                        className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Se déconnecter
                    </button>
                </div>

                {/* Générateur de codes */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">⚡</span>
                        Générer de nouveaux codes
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type de code</label>
                            <select
                                value={codeType}
                                onChange={(e) => setCodeType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="essentiel">Essentiel (9,99€/mois)</option>
                                <option value="premium">Premium (49,99€)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de codes</label>
                            <input
                                type="number"
                                value={codeCount}
                                onChange={(e) => setCodeCount(parseInt(e.target.value))}
                                min="1"
                                max="100"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerateCodes}
                                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                            >
                                ⚡ Générer les codes
                            </button>
                        </div>
                    </div>

                    {newCodes.length > 0 && (
                        <div className="bg-green-50 border border-green-300 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <h3 className="font-bold text-green-900">
                                    ✅ {newCodes.length} nouveaux codes générés
                                </h3>
                                <button
                                    onClick={copyAllNewCodes}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                     Copier tous les codes
                                </button>
                            </div>
                            <div className="space-y-2">
                                {newCodes.map((code, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-green-200">
                                        <code className="font-mono text-lg font-bold text-green-900">{code.code}</code>
                                        <button
                                            onClick={() => copyToClipboard(code.code)}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Copier
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-green-800">
                                💡 Envoyez ces codes par email à vos clients après leur paiement sur Comeup.
                            </p>
                        </div>
                    )}
                </div>

                {/* Liste des codes existants */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-3xl">📊</span>
                            Tous les codes ({generatedCodes.length})
                        </h2>
                        {generatedCodes.length > 0 && (
                            <button
                                onClick={clearAllCodes}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                ️ Tout supprimer
                            </button>
                        )}
                    </div>

                    {generatedCodes.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block"></span>
                            <p className="text-gray-500 text-lg">Aucun code généré pour le moment</p>
                            <p className="text-gray-400 text-sm mt-2">Utilisez le générateur ci-dessus pour créer vos premiers codes</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Créé le</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedCodes.map((code, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono font-bold text-blue-600">{code.code}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    code.type === 'essentiel' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {code.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {code.used ? (
                                                    <span className="text-red-600 font-medium">❌ Utilisé</span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">✅ Disponible</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(code.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => deleteCode(code.code)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">
                        <span>←</span>
                        <span>Retour à l'accueil</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}