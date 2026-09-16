import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databases, ID, DB_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';

export default function Admin() {
    const [isAuth, setIsAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('codes');

    const [codes, setCodes] = useState([]);
    const [newCode, setNewCode] = useState({ code: '', plan: 'essentiel' });

    const [pricingList, setPricingList] = useState([]);
    const [editingPricing, setEditingPricing] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'JobDiagnose2024!') {
            setIsAuth(true);
            setError('');
        } else {
            setError('Mot de passe incorrect.');
        }
    };

    useEffect(() => {
        if (isAuth) {
            loadCodes();
            loadPricing();
        }
    }, [isAuth]);

    const loadCodes = async () => {
        try {
            const res = await databases.listDocuments(DB_ID, COLLECTIONS.CODES, [Query.orderDesc('$createdAt')]);
            setCodes(res.documents);
        } catch (e) { console.error(e); }
    };

    const loadPricing = async () => {
        try {
            const res = await databases.listDocuments(DB_ID, COLLECTIONS.PRICING, [Query.orderAsc('order')]);
            setPricingList(res.documents);
        } catch (e) { console.error(e); }
    };

    const generateCode = () => {
        const prefix = newCode.plan === 'premium' ? 'PREM' : 'ESS';
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        setNewCode({ ...newCode, code: `JD-${prefix}-${random}` });
    };

    const handleCreateCode = async () => {
        if (!newCode.code) return;
        try {
            await databases.createDocument(DB_ID, COLLECTIONS.CODES, ID.unique(), {
                code: newCode.code,
                plan: newCode.plan,
                used: false,
                usedBy: '',
                usedAt: ''
            });
            setNewCode({ code: '', plan: 'essentiel' });
            loadCodes();
            alert('✅ Code créé avec succès !');
        } catch (e) { alert('❌ Erreur: ' + e.message); }
    };

    const handleDeleteCode = async (id) => {
        if (!confirm('Supprimer ce code ?')) return;
        try {
            await databases.deleteDocument(DB_ID, COLLECTIONS.CODES, id);
            loadCodes();
            alert('✅ Code supprimé');
        } catch (e) { alert('❌ Erreur: ' + e.message); }
    };

    const handleUpdatePricing = async (plan) => {
        try {
            await databases.updateDocument(DB_ID, COLLECTIONS.PRICING, plan.$id, {
                name: plan.name,
                price: plan.price,
                analyses: plan.analyses,
                description: plan.description,
                features: plan.features,
                popular: plan.popular,
                order: plan.order
            });
            setEditingPricing(null);
            loadPricing();
            alert('✅ Tarif mis à jour !');
        } catch (e) { alert('❌ Erreur: ' + e.message); }
    };

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Admin JobDiagnose</h2>
                    {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe admin" className="w-full px-4 py-3 border rounded-xl" />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Se connecter</button>
                    </form>
                    <div className="text-center mt-6">
                        <Link to="/" className="text-blue-600 font-semibold hover:underline">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
    <img src="/logo.png" alt="JobDiagnose" className="h-10 w-auto" />
    <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
</div>

                    <div className="flex gap-2 flex-wrap">
                        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">← Accueil</Link>
                        <button onClick={() => setIsAuth(false)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">Déconnexion</button>
                    </div>
                </div>

                <div className="flex gap-2 mb-8 flex-wrap">
                    {[{id:'codes',label:'🔑 Codes'},{id:'pricing',label:'💰 Tarifs'}].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'codes' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Gestion des Codes d'Activation</h2>
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <input type="text" value={newCode.code} onChange={(e) => setNewCode({...newCode, code: e.target.value})} placeholder="Code (ex: JD-ESS-ABCD)" className="flex-1 min-w-48 px-4 py-2 border rounded-lg font-mono uppercase" />
                            <select value={newCode.plan} onChange={(e) => setNewCode({...newCode, plan: e.target.value})} className="px-4 py-2 border rounded-lg">
                                <option value="essentiel">Essentiel</option>
                                <option value="premium">Premium</option>
                            </select>
                            <button onClick={generateCode} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Générer</button>
                            <button onClick={handleCreateCode} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Créer</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b"><th className="py-2">Code</th><th className="py-2">Plan</th><th className="py-2">Statut</th><th className="py-2">Action</th></tr></thead>
                                <tbody>
                                    {codes.map(c => (
                                        <tr key={c.$id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 font-mono">{c.code}</td>
                                            <td className="py-2">{c.plan}</td>
                                            <td className="py-2">{c.used ? <span className="text-red-600">Utilisé</span> : <span className="text-green-600">Disponible</span>}</td>
                                            <td className="py-2"><button onClick={() => handleDeleteCode(c.$id)} className="text-red-600 hover:underline">Supprimer</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Gestion des Tarifs</h2>
                        <p className="text-gray-500 mb-6">Modifiez les prix, le nombre d'analyses et les fonctionnalités. Les changements sont visibles instantanément sur la landing page.</p>
                        <div className="space-y-6">
                            {pricingList.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">Chargement des tarifs...</p>
                            ) : (
                                pricingList.map((plan) => (
                                    <div key={plan.$id} className="border border-gray-200 rounded-xl p-6">
                                        {editingPricing && editingPricing.$id === plan.$id ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1">Nom du plan</label>
                                                        <input type="text" value={editingPricing.name} onChange={(e) => setEditingPricing({...editingPricing, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1">Prix (€)</label>
                                                        <input type="number" step="0.01" value={editingPricing.price} onChange={(e) => setEditingPricing({...editingPricing, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1">Nombre d'analyses</label>
                                                        <input type="number" value={editingPricing.analyses} onChange={(e) => setEditingPricing({...editingPricing, analyses: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1">Ordre d'affichage</label>
                                                        <input type="number" value={editingPricing.order} onChange={(e) => setEditingPricing({...editingPricing, order: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-semibold mb-1">Description</label>
                                                        <input type="text" value={editingPricing.description} onChange={(e) => setEditingPricing({...editingPricing, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-semibold mb-1">Fonctionnalités (une par ligne)</label>
                                                        <textarea value={editingPricing.features.join('\n')} onChange={(e) => setEditingPricing({...editingPricing, features: e.target.value.split('\n').filter(f => f.trim())})} className="w-full px-3 py-2 border rounded-lg h-32" />
                                                    </div>
                                                    <label className="flex items-center gap-2 col-span-2">
                                                        <input type="checkbox" checked={editingPricing.popular} onChange={(e) => setEditingPricing({...editingPricing, popular: e.target.checked})} />
                                                        <span className="font-semibold">Marquer comme "Populaire"</span>
                                                    </label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdatePricing(editingPricing)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Sauvegarder</button>
                                                    <button onClick={() => setEditingPricing(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400">Annuler</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-start flex-wrap gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold">{plan.name} {plan.popular && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Populaire</span>}</h3>
                                                    <p className="text-gray-600">{plan.description}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{plan.analyses} analyses | Ordre: {plan.order}</p>
                                                    <ul className="mt-2 text-sm text-gray-600">
                                                        {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-blue-600">{plan.price}€</div>
                                                    <button onClick={() => setEditingPricing({...plan})} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Modifier</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}