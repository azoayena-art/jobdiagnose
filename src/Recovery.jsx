import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { account } from './appwrite';

export default function Recovery() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');
    
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Mode 1 : Demande de réinitialisation (l'utilisateur entre son email)
    const handleRequestRecovery = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // URL vers laquelle l'utilisateur sera redirigé après avoir cliqué sur le lien email
            const recoveryUrl = window.location.origin + '/recovery';
            await account.createRecovery(email, recoveryUrl);
            setMessage('✅ Un email de réinitialisation a été envoyé à ' + email + '. Vérifiez votre boîte mail !');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Mode 2 : Réinitialisation effective (l'utilisateur a cliqué sur le lien email)
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setLoading(true);
        try {
            await account.updateRecovery(userId, secret, newPassword);
            setMessage('✅ Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Si on a userId et secret dans l'URL → on affiche le formulaire de nouveau mot de passe
    if (userId && secret) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium mb-4">
                            <span>←</span>
                            <span>Retour à l'accueil</span>
                        </Link>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <span className="text-3xl">🔑</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Nouveau mot de passe</h2>
                        <p className="mt-2 text-gray-600">Choisissez un mot de passe sécurisé</p>
                    </div>

                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><span>⚠️</span><span>{error}</span></div>}
                    {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"><span>✅</span><span>{message}</span></div>}

                    <form onSubmit={handleUpdatePassword} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span>🔒</span> Nouveau mot de passe
                            </label>
                            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="••••••••" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span>🔒</span> Confirmer le mot de passe
                            </label>
                            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Modification en cours...' : '✅ Modifier mon mot de passe'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Mode par défaut : formulaire pour demander la réinitialisation
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium mb-4">
                        <span>←</span>
                        <span>Retour à l'accueil</span>
                    </Link>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl"></span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Mot de passe oublié ?</h2>
                    <p className="mt-2 text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><span>️</span><span>{error}</span></div>}
                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"><span>✅</span><span>{message}</span></div>}

                <form onSubmit={handleRequestRecovery} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span>📧</span> Adresse email
                        </label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="jean.dupont@email.com" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Envoi en cours...' : '📧 Envoyer le lien de réinitialisation'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-gray-600">
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/auth" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}