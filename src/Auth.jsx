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
    const [currentStep, setCurrentStep] = useState(1);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
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
        setUser(null);
        resetForm();
    };

    const resetForm = () => {
        setEmail(''); setPassword(''); setSelectedFile(null); setCvText('');
        setJobOfferText(''); setAiAnalysis(null); setUploadMessage('');
        setShowPaywall(false); setActivationCode(''); setShowActivationForm(false);
        setActivationMessage(''); setCurrentStep(1); setMobileMenuOpen(false);
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
            setActivationMessage(`Code activé ! Plan ${planType.toUpperCase()} débloqué.`);
            setActivationCode(''); setShowActivationForm(false); setShowPaywall(false);
        } catch (err) { setError(err.message); } finally { setIsActivating(false); }
    };

    const extractTextFromPDF = async (file) => {
        try {
            setIsExtracting(true);
            setUploadMessage('Extraction du texte en cours...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            setIsExtracting(false);
            setUploadMessage('');
            return fullText.trim();
        } catch (err) {
            setIsExtracting(false);
            setUploadMessage('Erreur lors de l\'extraction.');
            return '';
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (file.type === 'application/pdf') {
            const extractedText = await extractTextFromPDF(file);
            if (extractedText) {
                setCvText(extractedText);
                setCurrentStep(2);
            }
        } else {
            setCvText('');
            setUploadMessage('Pour les fichiers DOCX, veuillez copier-coller le texte manuellement.');
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const fakeEvent = { target: { files: [file] } };
        await handleFileSelect(fakeEvent);
    };

    const analyzeWithAI = async (text) => {
        try {
            const prompt = jobOfferText.trim() 
                ? `Tu es un expert en recrutement. Analyse la correspondance entre ce CV et cette offre. CV : ${text.substring(0, 3000)}. OFFRE : ${jobOfferText.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure EXACTE : {"score": 75, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}.`
                : `Tu es un expert en recrutement. Analyse ce CV. CV : ${text.substring(0, 3000)}. Réponds UNIQUEMENT avec un objet JSON valide. Structure EXACTE : {"score": 65, "forces": ["point 1"], "faiblesses": ["point 1"], "conseil_titre": "conseil"}.`;
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
            console.warn("Erreur API, mode simulation :", error);
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
        const resumeText = `Votre CV a obtenu un score de ${aiAnalysis.score}/100. ${aiAnalysis.score >= 70 ? 'Il presente de solides atouts.' : aiAnalysis.score >= 50 ? 'Il contient des elements pertinents mais necessite des ameliorations.' : 'Il necessite des retravail importants.'} Ce rapport detaille vos points forts, les axes d'amelioration et un plan d'action concret.`;
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
            { priority: 'PRIORITE HAUTE', color: [220, 38, 38], text: 'Corrigez immediatement les axes d\'amelioration identifies.' },
            { priority: 'PRIORITE MOYENNE', color: [234, 179, 8], text: 'Enrichissez votre CV avec des realisations chiffrees.' },
            { priority: 'PRIORITE BASSE', color: [34, 197, 94], text: 'Peaufinez la mise en forme et l\'orthographe.' }
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
        if (!selectedFile || !cvText.trim()) {
            setUploadMessage('Veuillez sélectionner un fichier.');
            return;
        }
        if (userPlan === 'free' && freeAnalysisCount >= 3) {
            setShowPaywall(true);
            setUploadMessage('3 analyses gratuites utilisées. Activez un code.');
            return;
        }

        setIsUploading(true);
        setUploadMessage('');
        setAiAnalysis(null);
        setCurrentStep(3);

        try {
            const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), selectedFile);
            const analysis = await analyzeWithAI(cvText);
            await databases.createDocument(DB_ID, COLLECTIONS.CVS, ID.unique(), {
                userId: user.$id, fileId: fileResponse.$id, fileName: fileResponse.name,
                extractedData: JSON.stringify(analysis), score: analysis.score, isValidated: true
            }, [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]);

            setAiAnalysis(analysis);
            if (userPlan === 'free') {
                const newCount = freeAnalysisCount + 1;
                setFreeAnalysisCount(newCount);
                localStorage.setItem('jobdiagnose_free_count', newCount.toString());
            }
        } catch (err) {
            setUploadMessage(`Erreur : ${err.message}`);
            setCurrentStep(2);
        } finally {
            setIsUploading(false);
        }
    };

    // ═══════════════════════════════════════════════════════
    // PAGE DE CONNEXION / INSCRIPTION
    // ═══════════════════════════════════════════════════════
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="JobDiagnose" className="h-12 w-auto" />
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{isLogin ? 'Bon retour parmi nous' : 'Créez votre compte'}</h2>
                        <p className="text-gray-500 mt-2">{isLogin ? 'Connectez-vous pour analyser votre CV' : 'Commencez gratuitement en 30 secondes'}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleAuth} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Jean Dupont" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="vous@exemple.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                                {isLogin ? 'Se connecter' : "Créer mon compte"}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // PAGE PRINCIPALE (Avec Header et Menu Hamburger)
    // ═══════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header Premium avec Logo et Menu Hamburger */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="JobDiagnose" className="h-10 w-auto" />
                        </Link>

                        {/* Menu Desktop */}
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/dashboard" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
                                Mon espace
                            </Link>
                            <Link to="/" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
                                Accueil
                            </Link>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-xs">{userPlan === 'premium' ? '' : (userPlan === 'essentiel' ? '⭐' : '🆓')}</span>
                                <span className="text-xs font-semibold text-gray-700 capitalize">{userPlan}</span>
                            </div>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 font-medium transition-colors">
                                Déconnexion
                            </button>
                        </div>

                        {/* Bouton Hamburger Mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Menu Mobile Déroulant */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
                            <Link
                                to="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                            >
                                📊 Mon espace
                            </Link>
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                            >
                                🏠 Accueil
                            </Link>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                <span className="text-xs font-semibold text-gray-700">
                                    Plan : {userPlan === 'premium' ? '👑 Premium' : (userPlan === 'essentiel' ? '⭐ Essentiel' : '🆓 Gratuit')}
                                </span>
                            </div>
                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                            >
                                🚪 Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Welcome */}
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Bonjour {user.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 mt-2">Analysez votre CV et obtenez des conseils personnalisés en 30 secondes.</p>
                </div>

                {/* Stepper Premium */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        {[
                            { n: 1, label: 'Upload', desc: 'CV & offre' },
                            { n: 2, label: 'Analyse', desc: 'Vérification' },
                            { n: 3, label: 'Résultats', desc: 'Diagnostic' }
                        ].map((step, i) => (
                            <div key={step.n} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                                        currentStep > step.n ? 'bg-green-500 text-white' :
                                        currentStep === step.n ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                                        'bg-gray-100 text-gray-400'
                                    }`}>
                                        {currentStep > step.n ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        ) : step.n}
                                    </div>
                                    <div className="mt-2 text-center hidden sm:block">
                                        <div className={`text-sm font-semibold ${currentStep >= step.n ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                                        <div className="text-xs text-gray-400">{step.desc}</div>
                                    </div>
                                </div>
                                {i < 2 && (
                                    <div className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all ${currentStep > step.n ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activation Code Banner */}
                {userPlan === 'free' && !showPaywall && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Vous avez un code d'activation ?</p>
                                    <p className="text-xs text-gray-600">Débloquez les fonctionnalités premium</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivationForm(!showActivationForm)} className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap">
                                {showActivationForm ? 'Fermer' : 'Activer un code'}
                            </button>
                        </div>
                        {showActivationForm && (
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="text" value={activationCode} onChange={(e) => setActivationCode(e.target.value.toUpperCase())} placeholder="JD-ESS-XXXX" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                                    <button type="button" onClick={handleActivationClick} disabled={isActivating} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {isActivating ? '...' : 'Activer'}
                                    </button>
                                </div>
                                {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
                                {activationMessage && <p className="mt-2 text-green-600 text-sm">{activationMessage}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 1 & 2 : UPLOAD & ANALYSE */}
                {(currentStep === 1 || currentStep === 2) && (
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentStep === 1 ? 'Déposez votre CV' : 'Vérifiez et lancez l\'analyse'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentStep === 1 ? 'Formats acceptés : PDF, DOCX' : 'Modifiez le texte si nécessaire avant l\'analyse'}
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Zone de Drop Premium */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Votre CV
                                </label>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="relative group"
                                >
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            {selectedFile ? (
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                    <p className="text-xs text-green-600 mt-2 font-medium">Fichier chargé</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-900">Cliquez pour uploader ou glissez-déposez</p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF ou DOCX (max 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                        <input id="cv-input" type="file" accept=".pdf,.docx" onChange={handleFileSelect} disabled={isUploading || isExtracting} className="hidden" />
                                    </label>
                                    {isExtracting && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="text-sm font-medium text-gray-700">Extraction du texte...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Texte extrait */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Texte extrait
                                    <span className="ml-2 text-xs font-normal text-gray-400">modifiable</span>
                                </label>
                                <textarea
                                    value={cvText}
                                    onChange={(e) => setCvText(e.target.value)}
                                    disabled={isUploading}
                                    placeholder="Le texte de votre CV apparaîtra ici après l'upload..."
                                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                />
                            </div>

                            {/* Offre d'emploi */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Offre d'emploi
                                    <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">Optionnel</span>
                                </label>
                                <textarea
                                    value={jobOfferText}
                                    onChange={(e) => setJobOfferText(e.target.value)}
                                    disabled={isUploading}
                                    placeholder="Collez la description du poste pour une analyse de matching..."
                                    className="w-full h-28 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                                />
                            </div>

                            {/* Erreur upload */}
                            {uploadMessage && !showPaywall && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {uploadMessage}
                                </div>
                            )}

                            {/* Paywall */}
                            {showPaywall && userPlan === 'free' && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Analyses gratuites épuisées</h3>
                                    <p className="text-sm text-gray-700 mb-4">Vous avez utilisé vos 3 analyses gratuites. Passez au niveau supérieur.</p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <button onClick={() => { setShowActivationForm(true); setShowPaywall(false); }} className="py-3 px-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
                                            J'ai un code
                                        </button>
                                        <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all text-sm">
                                            Voir les offres
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Bouton d'action */}
                            <button
                                onClick={handleUploadCV}
                                disabled={isUploading || isExtracting || !selectedFile || !cvText.trim() || showPaywall}
                                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Analyse en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{jobOfferText.trim() ? 'Analyser le matching' : 'Lancer l\'analyse'}</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3 : RÉSULTATS */}
                {currentStep === 3 && aiAnalysis && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Score Card Principal */}
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/30 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                            
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    {/* Score circulaire */}
                                    <div className="relative">
                                        <svg className="w-40 h-40 -rotate-90">
                                            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                                            <circle
                                                cx="80" cy="80" r="70"
                                                stroke="white"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${(aiAnalysis.score / 100) * 440} 440`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-5xl font-bold">{aiAnalysis.score}</div>
                                            <div className="text-sm text-blue-100">/100</div>
                                        </div>
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
                                            {aiAnalysis.score >= 70 ? 'EXCELLENT' : aiAnalysis.score >= 50 ? 'BON' : 'À AMÉLIORER'}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                            {aiAnalysis.score >= 70 ? 'Votre CV est très compétitif' : aiAnalysis.score >= 50 ? 'Bon point de départ' : 'Des améliorations nécessaires'}
                                        </h2>
                                        <p className="text-blue-100 text-sm sm:text-base">
                                            {aiAnalysis.conseil_titre}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/20">
                                    <button onClick={exportToPDF} className="flex-1 py-3 px-5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Télécharger le rapport PDF
                                    </button>
                                    <button onClick={() => { setAiAnalysis(null); setCurrentStep(1); setSelectedFile(null); setCvText(''); setJobOfferText(''); }} className="flex-1 py-3 px-5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                                        Nouvelle analyse
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid Forces / Faiblesses */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Points forts */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Points forts</h3>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    {aiAnalysis.forces.map((f, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-green-50/50 rounded-xl">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{f}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Axes d'amélioration */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Axes d'amélioration</h3>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    {aiAnalysis.faiblesses.map((f, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-orange-50/50 rounded-xl">
                                            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{f}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Conseil clé */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Conseil clé</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis.conseil_titre}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {currentStep === 3 && !aiAnalysis && isUploading && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 animate-pulse">
                            <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analyse en cours...</h3>
                        <p className="text-gray-500 text-sm">Notre IA examine votre CV selon 50+ critères</p>
                        <div className="mt-6 max-w-xs mx-auto">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}