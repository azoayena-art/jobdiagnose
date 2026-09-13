   import { useState } from 'react';
   import { databases, ID, DB_ID, COLLECTIONS } from './appwrite';
   import { Permission, Role } from 'appwrite'; // <-- AJOUTEZ CETTE LIGNE

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [codeType, setCodeType] = useState('essentiel');
    const [codeCount, setCodeCount] = useState(1);
    const [newCodes, setNewCodes] = useState([]);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'JobDiagnose2026!') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

       const handleGenerateCodes = async () => {
        const prefix = codeType === 'essentiel' ? 'JD-ESS' : 'JD-PREM';
        const generated = [];
        setError('');

        try {
            for (let i = 0; i < codeCount; i++) {
                const code = `${prefix}-${generateCode()}`;
                
                // Sauvegarde directe dans Appwrite (SANS createdAt)
                  // Sauvegarde directe dans Appwrite avec permissions ouvertes
   await databases.createDocument(DB_ID, COLLECTIONS.CODES, ID.unique(), {
       code: code,
       type: codeType,
       used: false
   }, [
       Permission.read(Role.any()),
       Permission.update(Role.any()) // Permet à l'utilisateur de le marquer comme utilisé
   ]);
                
                generated.push({ code, type: codeType, used: false });
            }
            setNewCodes(generated);
            alert(`✅ ${codeCount} codes générés et sauvegardés dans le Cloud !`);
        } catch (err) {
            setError('Erreur lors de la génération : ' + err.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-center">Administration JobDiagnose</h2>
                    {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe administrateur"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                            Se connecter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Panneau d'Administration</h1>
                    <button onClick={() => setIsAuthenticated(false)} className="text-red-600 hover:underline">
                        Déconnexion
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Générer des codes d'activation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de plan</label>
                            <select 
                                value={codeType} 
                                onChange={(e) => setCodeType(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="essentiel">Essentiel (JD-ESS)</option>
                                <option value="premium">Premium (JD-PREM)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de codes</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="50" 
                                value={codeCount} 
                                onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={handleGenerateCodes}
                                className="w-full bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700 transition"
                            >
                                ⚡ Générer les codes
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-600 mb-4">{error}</p>}
                    
                    {newCodes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Codes générés (Copiez-les maintenant) :</h3>
                            <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                                {newCodes.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                        <span className="font-mono text-lg font-bold text-blue-700">{item.code}</span>
                                        <span className="text-sm text-gray-500 uppercase">{item.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}