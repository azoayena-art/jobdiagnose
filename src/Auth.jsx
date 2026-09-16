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
                await account.create(ID.unique(), email, password, name);
                await account.createEmailPasswordSession(email, password);
            }
            checkUser();
        } catch (err) { setError(err.message); }
    };

    const handleLogout = async () => {
        await account.deleteSession('current');
        setUser(null); setEmail(''); setPassword(''); setSelectedFile(null); setCvText(''); setJobOfferText(''); setAiAnalysis(null); setUploadMessage(''); setShowPaywall(false); setActivationCode(''); setShowActivationForm(false); setActivationMessage('');
    };

    const handleActivationClick = async () => {
        setError(''); setActivationMessage('');
        const code = activationCode.trim().toUpperCase();
        if (!code) { setError('Veuillez entrer un code.'); return; }
        setIsActivating(true);
        try {
            const response = await databases.listDocuments(DB_ID, COLLECTIONS.CODES, [Query.equal('code', code), Query.limit(1)]);
            if (response.documents.length === 0) throw new Error('Code non trouvé.');
            const codeData = response.documents[0];
            if (codeData.used) throw new Error('Ce code a déjà été utilisé.');
            const prefix = code.split('-')[1];
            let planType = '';
            if (prefix === 'ESS') planType = 'essentiel';
            else if (prefix === 'PREM') planType = 'premium';
            else throw new Error('Préfixe non reconnu.');
            await databases.updateDocument(DB_ID, COLLECTIONS.CODES, codeData.$id, { used: true, usedBy: user.$id, usedAt: new Date().toISOString() });
            localStorage.setItem(`jobdiagnose_plan_${user.$id}`, planType);
            setUserPlan(planType);
            setActivationMessage(`✅ Code activé ! Plan ${planType.toUpperCase()} débloqué.`);
            setActivationCode(''); setShowActivationForm(false); setShowPaywall(false);
        } catch (err) { setError(err.message); } finally { setIsActivating(false); }
    };

    const extractTextFromPDF = async (file) => {
        try {
            setIsExtracting(true); setUploadMessage('Extraction du texte en cours...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            setIsExtracting(false); setUploadMessage('✅ Texte extrait avec succès !');
            return fullText.trim();
        } catch (err) { setIsExtracting(false); setUploadMessage('❌ Erreur lors de l\'extraction.'); return ''; }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type === 'application/pdf') {
            const extractedText = await extractTextFromPDF(file);
            if (extractedText) setCvText(extractedText);
        } else { setCvText(''); setUploadMessage('ℹ️ Pour les fichiers DOCX, veuillez copier-coller le texte manuellement.'); }
    };

    const analyzeWithAI = async (text) => {
        try {
            const prompt = jobOfferText.trim() 
                ? `Tu es un expert en recrutement. Analyse la correspondance entre ce CV et cette offre. CV : ${text.substring(0, 3000)}. OFFRE : ${jobOfferText.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure EXACTE : {"score": 75, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}. N'utilise AUCUNE autre clé.`
                : `Tu es un expert en recrutement. Analyse ce CV. CV : ${text.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure EXACTE : {"score": 65, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}. N'utilise AUCUNE autre clé.`;
            const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            const raw = data.result;
            return {
                score: typeof raw.score === 'number' ? raw.score : 65,
                forces: Array.isArray(raw.forces) ? raw.forces : ["Expérience pertinente"],
                faiblesses: Array.isArray(raw.faiblesses) ? raw.faiblesses : ["Manque de chiffres"],
                conseil_titre: raw.conseil_titre || "Ajoutez des réalisations chiffrées."
            };
        } catch (error) {
            console.warn("⚠️ Erreur API, mode simulation :", error);
            return { score: 65, forces: ["Expérience pertinente"], faiblesses: ["Manque de chiffres"], conseil_titre: "Ajoutez des réalisations chiffrées." };
        }
    };

    const exportToPDF = () => {
        if (!aiAnalysis) return;
        const doc = new jsPDF();
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 0;

        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose', pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Rapport d\'Analyse Professionnelle de CV', pageWidth / 2, 38, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 50, { align: 'center' });

        yPos = 75;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS CANDIDAT', margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Nom : ${user.name}`, margin, yPos);
        yPos += 6;
        doc.text(`Email : ${user.email}`, margin, yPos);
        yPos += 6;
        const planLabel = userPlan === 'premium' ? 'Premium' : (userPlan === 'essentiel' ? 'Essentiel' : 'Gratuit');
        doc.text(`Plan : ${planLabel}`, margin, yPos);

        yPos = 110;
        doc.setFillColor(240, 245, 255);
        doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S');
        yPos += 15;
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SCORE GLOBAL DE VOTRE CV', pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;
        doc.setFontSize(36);
        doc.setTextColor(aiAnalysis.score >= 70 ? 34 : (aiAnalysis.score >= 50 ? 234 : 220), aiAnalysis.score >= 70 ? 197 : (aiAnalysis.score >= 50 ? 179 : 8), aiAnalysis.score >= 70 ? 94 : (aiAnalysis.score >= 50 ? 8 : 38));
        doc.text(`${aiAnalysis.score}/100`, pageWidth / 2, yPos, { align: 'center' });

        yPos += 10;
        const barWidth = 120;
        const barX = (pageWidth - barWidth) / 2;
        doc.setFillColor(220, 220, 220);
        doc.rect(barX, yPos, barWidth, 6, 'F');
        doc.setFillColor(30, 58, 138);
        doc.rect(barX, yPos, (barWidth * aiAnalysis.score) / 100, 6, 'F');

        yPos = 180;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUME EXECUTIF', margin, yPos);
        yPos += 3;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 50, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const resumeText = `Votre CV a obtenu un score de ${aiAnalysis.score}/100. ${aiAnalysis.score >= 70 ? 'Il presente de solides atouts qui le rendent competitif.' : aiAnalysis.score >= 50 ? 'Il contient des elements pertinents mais necessite des ameliorations.' : 'Il necessite des retravail importants.'} Ce rapport detaille vos points forts, les axes d'amelioration et un plan d'action concret.`;
        const resumeLines = doc.splitTextToSize(resumeText, contentWidth);
        doc.text(resumeLines, margin, yPos);
        yPos += resumeLines.length * 5 + 10;

        doc.setFillColor(255, 248, 220);
        doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');
        doc.setDrawColor(218, 165, 32);
        doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'S');
        yPos += 8;
        doc.setTextColor(139, 90, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSEIL CLE :', margin + 5, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const conseilLines = doc.splitTextToSize(aiAnalysis.conseil_titre || "Aucun conseil disponible.", contentWidth - 10);
        doc.text(conseilLines, margin + 5, yPos);

        doc.addPage();
        yPos = 20;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Analyse Detaillee', margin, 10);
        doc.text('Page 2/3', pageWidth - margin, 10, { align: 'right' });
        yPos = 30;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALYSE DETAILLEE', margin, yPos);
        yPos += 5;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 60, yPos);
        yPos += 12;

        doc.setFillColor(232, 245, 233);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
        doc.setTextColor(27, 94, 32);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('POINTS FORTS IDENTIFIES', margin + 5, yPos + 7);
        yPos += 15;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (aiAnalysis.forces && aiAnalysis.forces.length > 0) {
            aiAnalysis.forces.forEach((force) => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.setTextColor(27, 94, 32);
                doc.setFont('helvetica', 'bold');
                doc.text('>', margin + 2, yPos);
                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'normal');
                const forceLines = doc.splitTextToSize(force, contentWidth - 15);
                doc.text(forceLines, margin + 10, yPos);
                yPos += forceLines.length * 5 + 4;
            });
        }

        yPos += 5;
        doc.setFillColor(255, 243, 224);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
        doc.setTextColor(230, 81, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES D\'AMELIORATION', margin + 5, yPos + 7);
        yPos += 15;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (aiAnalysis.faiblesses && aiAnalysis.faiblesses.length > 0) {
            aiAnalysis.faiblesses.forEach((faiblesse) => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.setTextColor(230, 81, 0);
                doc.setFont('helvetica', 'bold');
                doc.text('-', margin + 2, yPos);
                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'normal');
                const faibLines = doc.splitTextToSize(faiblesse, contentWidth - 15);
                doc.text(faibLines, margin + 10, yPos);
                yPos += faibLines.length * 5 + 4;
            });
        }

        doc.addPage();
        yPos = 20;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Plan d\'Action', margin, 10);
        doc.text('Page 3/3', pageWidth - margin, 10, { align: 'right' });
        yPos = 30;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PRIORISE', margin, yPos);
        yPos += 5;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 70, yPos);
        yPos += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);

        const actions = [
            { priority: 'PRIORITE HAUTE', color: [220, 38, 38], text: 'Corrigez immediatement les axes d\'amelioration identifies. Ce sont les points bloquants pour les recruteurs.' },
            { priority: 'PRIORITE MOYENNE', color: [234, 179, 8], text: 'Enrichissez votre CV avec des realisations chiffrees et des mots-cles pertinents pour votre secteur.' },
            { priority: 'PRIORITE BASSE', color: [34, 197, 94], text: 'Peaufinez la mise en forme, verifiez l\'orthographe et adaptez le CV a chaque offre specifique.' }
        ];
        actions.forEach((action) => {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFillColor(action.color[0], action.color[1], action.color[2]);
            doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(action.priority, margin + 3, yPos + 5.5);
            yPos += 12;
            doc.setTextColor(30, 30, 30);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const actionLines = doc.splitTextToSize(action.text, contentWidth);
            doc.text(actionLines, margin + 5, yPos);
            yPos += actionLines.length * 5 + 8;
        });

        yPos += 5;
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CHECKLIST FINALE', margin + 5, yPos + 7);
        yPos += 15;
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const checklist = ['[ ]  CV tenu sur 1 a 2 pages maximum', '[ ]  Photo professionnelle', '[ ]  Titre de poste clair', '[ ]  Resume professionnel en 3-4 lignes', '[ ]  Experiences avec verbes d\'action', '[ ]  Competences techniques separees', '[ ]  Formation a jour', '[ ]  Aucune faute d\'orthographe', '[ ]  Format PDF uniquement', '[ ]  Nom du fichier professionnel'];
        checklist.forEach(item => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.text(item, margin + 5, yPos);
            yPos += 7;
        });

        yPos += 10;
        doc.setFillColor(30, 58, 138);
        doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');
        yPos += 8;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('CONCLUSION', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const conclusionText = 'Ce rapport a ete genere par JobDiagnose. Il constitue une base de travail pour optimiser votre CV.';
        const conclusionLines = doc.splitTextToSize(conclusionText, contentWidth - 10);
        doc.text(conclusionLines, pageWidth / 2, yPos, { align: 'center' });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(`JobDiagnose (c) ${new Date().getFullYear()} - Rapport confidentiel`, pageWidth / 2, 290, { align: 'center' });
            doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, 290, { align: 'right' });
        }
        doc.save(`JobDiagnose_Rapport_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleUploadCV = async (e) => {
        e.preventDefault();
        if (!selectedFile || !cvText.trim()) { setUploadMessage('❌ Veuillez sélectionner un fichier.'); return; }
        if (userPlan === 'free' && freeAnalysisCount >= 3) { setShowPaywall(true); setUploadMessage('🔒 3 analyses gratuites utilisées. Activez un code.'); return; }
        setIsUploading(true); setUploadMessage(jobOfferText.trim() ? '⏳ Analyse du matching...' : '⏳ Analyse du CV en cours...'); setAiAnalysis(null);
        try {
            const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), selectedFile);
            const analysis = await analyzeWithAI(cvText);
            await databases.createDocument(DB_ID, COLLECTIONS.CVS, ID.unique(), { userId: user.$id, fileId: fileResponse.$id, fileName: fileResponse.name, extractedData: JSON.stringify(analysis), score: analysis.score, isValidated: true }, [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]);
            setAiAnalysis(analysis);
            setUploadMessage(`✅ Succès ! "${fileResponse.name}" analysé.`);
            if (userPlan === 'free') { const newCount = freeAnalysisCount + 1; setFreeAnalysisCount(newCount); localStorage.setItem('jobdiagnose_free_count', newCount.toString()); }
            setSelectedFile(null);
            const cvInput = document.getElementById('cv-input');
            if (cvInput) cvInput.value = '';
        } catch (err) { setUploadMessage(`❌ Erreur : ${err.message}`); } finally { setIsUploading(false); }
    };

    if (user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">← Accueil</Link>
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Se déconnecter</button>
                    </div>

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <span className="text-4xl">💼</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bienvenue, <span className="text-blue-600">{user.name}</span> !
                        </h1>
                        <p className="text-gray-600 text-lg">Optimisez votre candidature avec l'intelligence artificielle</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white shadow-md">
                            <span className="text-xl">{userPlan === 'premium' ? '👑' : (userPlan === 'essentiel' ? '⭐' : '🆓')}</span>
                            <span className={userPlan === 'premium' ? 'text-orange-600' : (userPlan === 'essentiel' ? 'text-blue-600' : 'text-gray-600')}>Plan {userPlan.toUpperCase()}</span>
                            {userPlan !== 'free' && <span className="text-green-600 text-xs ml-2">✓ Actif</span>}
                        </div>
                    </div>

                    {userPlan === 'free' && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-left">
                                    <span className="text-3xl">🔑</span>
                                    <div>
                                        <p className="font-bold text-gray-900">Vous avez un code d'activation ?</p>
                                        <p className="text-sm text-gray-600">Entrez votre code reçu après paiement pour débloquer les fonctionnalités premium.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowActivationForm(!showActivationForm)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md whitespace-nowrap">
                                    {showActivationForm ? '✕ Fermer' : '🔑 Activer un code'}
                                </button>
                            </div>
                            {showActivationForm && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={activationCode} onChange={(e) => setActivationCode(e.target.value.toUpperCase())} placeholder="JD-ESS-XXXX ou JD-PREM-XXXX" className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono uppercase" />
                                        <button type="button" onClick={handleActivationClick} disabled={isActivating} className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md cursor-pointer disabled:opacity-50">
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
                                    <span className="text-blue-600 font-normal text-xs">(Optionnel)</span>
                                </label>
                                <textarea value={jobOfferText} onChange={(e) => setJobOfferText(e.target.value)} disabled={isUploading} placeholder="Copiez-collez la description du poste..." className="w-full h-32 px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50" />
                            </div>
                            <button type="submit" disabled={isUploading || isExtracting || !selectedFile || !cvText.trim()} className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300">
                                {isUploading ? 'Analyse en cours...' : (jobOfferText.trim() ? '🎯 Analyser le Matching' : '🚀 Diagnostiquer mon CV')}
                            </button>
                        </form>

                        {showPaywall && userPlan === 'free' && (
                            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyses gratuites épuisées !</h3>
                                <p className="text-gray-700 mb-4">Activez un code ou choisissez une offre :</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={() => { setShowActivationForm(true); setShowPaywall(false); }} className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all">🔑 J'ai un code</button>
                                    <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-all">💰 Voir les offres</a>
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
                                {jobOfferText.trim() ? '🎯 Résultat du Matching' : '📊 Résultat du Diagnostic'}
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
                                <button onClick={exportToPDF} className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">📄 Télécharger mon rapport PDF</button>
                            </div>
                        </div>
                    )}
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
                <div className="text-center space-y-2">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold underline">
                        {isLogin ? "S'inscrire" : "Se connecter"}
                    </button>
                    <div>
                        <Link to="/" className="text-gray-600 font-semibold hover:underline">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}