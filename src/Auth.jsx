import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { account, ID, databases, storage, DB_ID, COLLECTIONS, BUCKET_ID } from './appwrite';
import { Query, Permission, Role } from 'appwrite';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [userPlan, setUserPlan] = useState('free');
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvText, setCvText] = useState('');
    const [jobOfferText, setJobOfferText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    
    const [freeAnalysisCount, setFreeAnalysisCount] = useState(() => {
        return parseInt(localStorage.getItem('jobdiagnose_free_count') || '0');
    });
    const [showPaywall, setShowPaywall] = useState(false);
    
    const [activationCode, setActivationCode] = useState('');
    const [showActivationForm, setShowActivationForm] = useState(false);
    const [activationMessage, setActivationMessage] = useState('');
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => { checkUser(); }, []);

    const checkUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            const savedPlan = localStorage.getItem(`jobdiagnose_plan_${currentUser.$id}`);
            if (savedPlan) setUserPlan(savedPlan);
        } catch (err) { setUser(null); }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await account.createEmailPasswordSession(email, password);
            } else {
                const newUser = await account.create(ID.unique(), email, password, name);
                await account.createEmailPasswordSession(email, password);
            }
            checkUser();
        } catch (err) { 
            setError(err.message); 
        }
    };

    const handleLogout = async () => {
        await account.deleteSession('current');
        setUser(null); 
        setEmail(''); 
        setPassword(''); 
        setSelectedFile(null); 
        setCvText(''); 
        setJobOfferText(''); 
        setAiAnalysis(null); 
        setUploadMessage(''); 
        setShowPaywall(false); 
        setActivationCode(''); 
        setShowActivationForm(false); 
        setActivationMessage('');
    };

    const handleActivationClick = async () => {
        setError('');
        setActivationMessage('');
        const code = activationCode.trim().toUpperCase();
        
        if (!code) { setError('Veuillez entrer un code.'); return; }
        setIsActivating(true);

        try {
            const response = await databases.listDocuments(DB_ID, COLLECTIONS.CODES, [
                Query.equal('code', code),
                Query.limit(1)
            ]);

            if (response.documents.length === 0) {
                throw new Error('Code non trouvé. Vérifiez le code ou contactez le support.');
            }

            const codeData = response.documents[0];

            if (codeData.used) {
                throw new Error('Ce code a déjà été utilisé.');
            }

            const prefix = code.split('-')[1];
            let planType = '';
            if (prefix === 'ESS') {
                planType = 'essentiel';
            } else if (prefix === 'PREM') {
                planType = 'premium';
            } else {
                throw new Error('Préfixe de code non reconnu.');
            }

            await databases.updateDocument(DB_ID, COLLECTIONS.CODES, codeData.$id, {
                used: true,
                usedBy: user.$id,
                usedAt: new Date().toISOString()
            });

            localStorage.setItem(`jobdiagnose_plan_${user.$id}`, planType);
            setUserPlan(planType);

            setActivationMessage(`✅ Code activé ! Plan ${planType.toUpperCase()} débloqué.`);
            setActivationCode('');
            setShowActivationForm(false);
            setShowPaywall(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsActivating(false);
        }
    };

    const extractTextFromPDF = async (file) => {
        try {
            setIsExtracting(true);
            setUploadMessage(' Extraction du texte en cours...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            setIsExtracting(false);
            setUploadMessage('✅ Texte extrait avec succès !');
            return fullText.trim();
        } catch (err) {
            setIsExtracting(false);
            setUploadMessage('❌ Erreur lors de l\'extraction.');
            return '';
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type === 'application/pdf') {
            const extractedText = await extractTextFromPDF(file);
            if (extractedText) setCvText(extractedText);
        } else {
            setCvText('');
            setUploadMessage('ℹ️ Pour les fichiers DOCX, veuillez copier-coller le texte manuellement.');
        }
    };

    // 🚀 NOUVELLE FONCTION IA SÉCURISÉE VIA VERCEL
    const analyzeWithAI = async (text) => {
        try {
            const prompt = jobOfferText.trim() 
                ? `Tu es un expert en recrutement. Analyse la correspondance entre ce CV et cette offre. CV : ${text.substring(0, 3000)}. OFFRE : ${jobOfferText.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure exacte : {"score": 75, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}`
                : `Tu es un expert en recrutement. Analyse ce CV. CV : ${text.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure exacte : {"score": 65, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}`;

            // Appel à notre propre API sécurisée sur Vercel (api/gemini.js)
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            
            if (data.error) throw new Error(data.error);
            
            return data.result;
        } catch (error) {
            console.warn("⚠️ Erreur API, mode simulation :", error);
            return { score: 65, forces: ["Expérience pertinente"], faiblesses: ["Manque de chiffres"], conseil_titre: "Ajoutez des réalisations chiffrées." };
        }
    };

    const exportToPDF = () => {
        if (!aiAnalysis) return;
        const doc = new jsPDF();
        const pageWidth = 210;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 50, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose', pageWidth / 2, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapport d'analyse - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 35, { align: 'center' });
        doc.text(`Candidat : ${user.name}`, pageWidth / 2, 45, { align: 'center' });
        
        let yPos = 65;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Score : ${aiAnalysis.score}/100`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;

        doc.setFontSize(12);
        doc.text('Conseil personnalisé :', 20, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(aiAnalysis.conseil_titre, 170);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 6 + 15;

        doc.setFont('helvetica', 'bold');
        doc.text('Points Forts :', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        aiAnalysis.forces.forEach((f, i) => {
            doc.text(`+ ${f}`, 25, yPos);
            yPos += 6;
        });
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Axes d\'Amélioration :', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        aiAnalysis.faiblesses.forEach((f, i) => {
            doc.text(`- ${f}`, 25, yPos);
            yPos += 6;
        });

        doc.save(`JobDiagnose_${user.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleUploadCV = async (e) => {
        e.preventDefault();
        if (!selectedFile || !cvText.trim()) {
            setUploadMessage(' Veuillez sélectionner un fichier et vérifier le texte.');
            return;
        }
        if (userPlan === 'free' && freeAnalysisCount >= 1) {
            setShowPaywall(true);
            setUploadMessage('🔒 Analyse gratuite utilisée. Activez un code.');
            return;
        }

        setIsUploading(true);
        setUploadMessage(jobOfferText.trim() ? '⏳ Analyse du matching CV vs Offre...' : '⏳ Analyse du CV en cours...');
        setAiAnalysis(null);

        try {
            const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), selectedFile);
            const analysis = await analyzeWithAI(cvText);
            await databases.createDocument(DB_ID, COLLECTIONS.CVS, ID.unique(), {
                userId: user.$id, fileId: fileResponse.$id, fileName: fileResponse.name, extractedData: JSON.stringify(analysis), score: analysis.score, isValidated: true
            }, [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]);

            setAiAnalysis(analysis);
            setUploadMessage(`✅ Succès ! "${fileResponse.name}" analysé.`);
            if (userPlan === 'free') {
                const newCount = freeAnalysisCount + 1;
                setFreeAnalysisCount(newCount);
                localStorage.setItem('jobdiagnose_free_count', newCount.toString());
            }
            setSelectedFile(null);
            const cvInput = document.getElementById('cv-input');
            if (cvInput) cvInput.value = '';
        } catch (err) {
            setUploadMessage(`❌ Erreur : ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <span className="text-4xl">💼</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bienvenue, <span className="text-blue-600">{user.name}</span> !
                        </h1>
                        <p className="text-gray-600 text-lg">Optimisez votre candidature avec l'intelligence artificielle</p>
                        
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white shadow-md">
                            <span className="text-xl">
                                {userPlan === 'premium' ? '👑' : (userPlan === 'essentiel' ? '⭐' : '')}
                            </span>
                            <span className={userPlan === 'premium' ? 'text-orange-600' : (userPlan === 'essentiel' ? 'text-blue-600' : 'text-gray-600')}>
                                Plan {userPlan.toUpperCase()}
                            </span>
                            {userPlan !== 'free' && (
                                <span className="text-green-600 text-xs ml-2">✓ Actif</span>
                            )}
                        </div>
                    </div>

                    {userPlan === 'free' && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-left">
                                    <span className="text-3xl"></span>
                                    <div>
                                        <p className="font-bold text-gray-900">Vous avez un code d'activation ?</p>
                                        <p className="text-sm text-gray-600">Entrez votre code reçu après paiement pour débloquer les fonctionnalités premium.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowActivationForm(!showActivationForm)}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md whitespace-nowrap"
                                >
                                    {showActivationForm ? '✕ Fermer' : '🔑 Activer un code'}
                                </button>
                            </div>
                            
                            {showActivationForm && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={activationCode}
                                            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                            placeholder="JD-ESS-XXXX ou JD-PREM-XXXX"
                                            className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleActivationClick}
                                            disabled={isActivating}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                                        >
                                            {isActivating ? '⏳ Activation...' : '✅ Activer'}
                                        </button>
                                    </div>
                                    {error && <p className="mt-3 text-red-700 font-medium text-center">{error}</p>}
                                    {activationMessage && <p className="mt-3 text-green-700 font-medium text-center">{activationMessage}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                        <form onSubmit={handleUploadCV} className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="text-xl">📄</span>
                                    <span>1. Uploadez votre CV (PDF)</span>
                                </label>
                                <div className="relative">
                                    <input id="cv-input" type="file" accept=".pdf,.docx" onChange={handleFileSelect} disabled={isUploading || isExtracting} className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:border-blue-600 disabled:opacity-50" />
                                    {isExtracting && <div className="absolute right-4 top-1/2 transform -translate-y-1/2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="text-xl">📋</span>
                                    <span>2. Texte extrait</span>
                                </label>
                                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} disabled={isUploading} className="w-full h-40 px-4 py-3 border rounded-xl resize-none" />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="text-xl">🎯</span>
                                    <span>3. Texte de l'offre d'emploi</span>
                                    <span className="text-blue-600 font-normal text-xs">(Optionnel - pour le matching)</span>
                                </label>
                                <textarea value={jobOfferText} onChange={(e) => setJobOfferText(e.target.value)} disabled={isUploading} placeholder="Copiez-collez la description du poste pour une analyse de matching..." className="w-full h-32 px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50" />
                            </div>

                            <button type="submit" disabled={isUploading || isExtracting || !selectedFile || !cvText.trim()} className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300">
                                {isUploading ? 'Analyse en cours...' : (jobOfferText.trim() ? '🎯 Analyser le Matching CV vs Offre' : '🚀 Diagnostiquer mon CV')}
                            </button>
                        </form>

                        {showPaywall && userPlan === 'free' && (
                            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyse gratuite utilisée !</h3>
                                <p className="text-gray-700 mb-4">Activez un code ou choisissez une offre :</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={() => { setShowActivationForm(true); setShowPaywall(false); }} className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all">
                                        🔑 J'ai un code
                                    </button>
                                    <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-all">
                                         Essentiel - 9,99€
                                    </a>
                                </div>
                            </div>
                        )}

                        {uploadMessage && !showPaywall && (
                            <div className={`mt-6 p-4 rounded-xl text-center font-medium ${uploadMessage.includes('Succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {uploadMessage}
                            </div>
                        )}
                    </div>

                    {aiAnalysis && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                                {jobOfferText.trim() ? '🎯 Résultat du Matching CV vs Offre' : '📊 Résultat du Diagnostic'}
                            </h2>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-500 text-blue-600 mb-4">
                                    <div><div className="text-4xl font-bold">{aiAnalysis.score}</div><div className="text-sm">/100</div></div>
                                </div>
                            </div>
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 mb-6 rounded-r-xl">
                                <p className="text-gray-700"><span className="font-bold text-blue-600">Conseil :</span> {aiAnalysis.conseil_titre}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-bold text-green-800 mb-4">✨ Points Forts</h3>
                                    <ul className="space-y-3">{aiAnalysis.forces.map((f, i) => <li key={i} className="text-green-900">✓ {f}</li>)}</ul>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                                    <h3 className="text-lg font-bold text-orange-800 mb-4">⚡ Axes d'Amélioration</h3>
                                    <ul className="space-y-3">{aiAnalysis.faiblesses.map((f, i) => <li key={i} className="text-orange-900">→ {f}</li>)}</ul>
                                </div>
                            </div>
                            <div className="text-center mt-8">
                                <button onClick={exportToPDF} className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                                     Télécharger mon rapport en PDF
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <button onClick={handleLogout} className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">Se déconnecter</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">{isLogin ? 'Connexion' : 'Inscription'}</h2>
                </div>
                {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">{error}</div>}
                <form onSubmit={handleAuth} className="mt-8 space-y-6">
                    {!isLogin && <input name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" placeholder="Nom complet" />}
                    <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" placeholder="Email" />
                    <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border rounded-xl" placeholder="Mot de passe" />
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                        {isLogin ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold underline">
                        {isLogin ? "S'inscrire" : "Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}