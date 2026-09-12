import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { account, ID, databases, storage, DB_ID, COLLECTIONS, BUCKET_ID } from './appwrite';
import { Permission, Role } from 'appwrite';
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

    useEffect(() => { 
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            const savedPlan = localStorage.getItem(`jobdiagnose_plan_${currentUser.$id}`);
            if (savedPlan) setUserPlan(savedPlan);
        } catch (err) { 
            setUser(null); 
        }
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
                await databases.createDocument(DB_ID, COLLECTIONS.USERS, ID.unique(), {
                    userId: newUser.$id, jobTitle: '', experience: '', location: '', createdAt: new Date().toISOString()
                }, [Permission.read(Role.user(newUser.$id)), Permission.update(Role.user(newUser.$id)), Permission.delete(Role.user(newUser.$id))]);
            }
            checkUser();
        } catch (err) { setError(err.message); }
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

        if (!code) {
            setError('Veuillez entrer un code.');
            return;
        }

        alert('BOUTON CLIQUÉ ! Code saisi : ' + code);

        setIsActivating(true);

        try {
            let allCodes = [];
            const stored = localStorage.getItem('jobdiagnose_codes');
            if (!stored) {
                throw new Error('Aucun code trouvé. Générez des codes dans /admin d\'abord.');
            }
            allCodes = JSON.parse(stored);
            
            const codeIndex = allCodes.findIndex(c => c.code === code);
            
            if (codeIndex === -1) {
                throw new Error('Code non trouvé. Vérifiez le code ou contactez le support.');
            }

            const codeData = allCodes[codeIndex];
            
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

            allCodes[codeIndex].used = true;
            allCodes[codeIndex].usedBy = user.$id;
            allCodes[codeIndex].usedAt = new Date().toISOString();
            localStorage.setItem('jobdiagnose_codes', JSON.stringify(allCodes));

            localStorage.setItem(`jobdiagnose_plan_${user.$id}`, planType);
            setUserPlan(planType);

            setActivationMessage(`✅ Code activé ! Plan ${planType.toUpperCase()} débloqué.`);
            setActivationCode('');
            setShowActivationForm(false);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsActivating(false);
        }
    };
    const extractTextFromPDF = async (file) => {
        try {
            setIsExtracting(true);
            setUploadMessage('📄 Extraction du texte en cours...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            setIsExtracting(false);
            setUploadMessage('✅ Texte extrait avec succès !');
            return fullText.trim();
        } catch (err) {
            console.error('Erreur extraction PDF:', err);
            setIsExtracting(false);
            setUploadMessage('❌ Erreur lors de l\'extraction. Veuillez coller le texte manuellement.');
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

    const analyzeWithAI = async (text) => {
        try {
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (!apiKey) throw new Error("Clé API OpenRouter manquante");

            const prompt = jobOfferText.trim() 
                ? `Tu es un expert en recrutement. Analyse la correspondance entre ce CV et cette offre.
                   CV : ${text.substring(0, 3000)}.
                   OFFRE : ${jobOfferText.substring(0, 3000)}.
                   Réponds UNIQUEMENT avec un objet JSON valide.
                   IMPORTANT : Utilise des doubles guillemets (") pour toutes les clés et valeurs.
                   Structure exacte : {"score": 75, "forces": ["point 1", "point 2", "point 3"], "faiblesses": ["point 1", "point 2", "point 3"], "conseil_titre": "conseil en français"}`
                : `Tu es un expert en recrutement. Analyse ce CV.
                   CV : ${text.substring(0, 3000)}.
                   Réponds UNIQUEMENT avec un objet JSON valide.
                   IMPORTANT : Utilise des doubles guillemets (") pour toutes les clés et valeurs.
                   Structure exacte : {"score": 65, "forces": ["point 1", "point 2", "point 3"], "faiblesses": ["point 1", "point 2", "point 3"], "conseil_titre": "conseil en français"}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'JobDiagnose MVP',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            let rawContent = data.choices[0].message.content;
            console.log("Réponse brute de l'IA:", rawContent);
            
            // Nettoyage 1 : Retirer les balises markdown
            let jsonText = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Nettoyage 2 : Extraire le bloc JSON
            let jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                let candidate = jsonMatch[0];
                
                // Tentative 1 : Parsing direct
                try {
                    return JSON.parse(candidate);
                } catch (e) {
                    console.log("Tentative 1 échouée, correction des guillemets...");
                    
                    // Tentative 2 : Remplacer les guillemets simples par des doubles pour les clés
                    let fixedCandidate = candidate.replace(/'([^']+)'\s*:/g, '"$1":');
                    try {
                        return JSON.parse(fixedCandidate);
                    } catch (e2) {
                        console.log("Tentative 2 échouée, recherche de JSON imbriqué...");
                        
                        // Tentative 3 : Chercher un objet JSON valide avec regex plus permissive
                        const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
                        const matches = rawContent.match(jsonRegex);
                        if (matches) {
                            for (let match of matches) {
                                try {
                                    return JSON.parse(match);
                                } catch (e3) {
                                    continue;
                                }
                            }
                        }
                        
                        // Tentative 4 : Tronquer à la dernière accolade fermante
                        const lastBrace = candidate.lastIndexOf('}');
                        if (lastBrace > 0) {
                            try {
                                return JSON.parse(candidate.substring(0, lastBrace + 1));
                            } catch (e4) {
                                console.log("Tentative 4 échouée");
                            }
                        }
                    }
                }
            }
            
            throw new Error("Aucun JSON valide trouvé dans la réponse de l'IA");

        } catch (error) {
            console.warn("⚠️ Erreur API, activation du mode simulation :", error);
            return new Promise(resolve => setTimeout(() => resolve({
                score: jobOfferText.trim() ? 72 : 65,
                forces: ["[SIMULATION] Expérience pertinente", "[SIMULATION] Bonne structure"],
                faiblesses: ["[SIMULATION] Manque de chiffres", "[SIMULATION] Mots-clés manquants"],
                conseil_titre: "[SIMULATION] Ajoutez des réalisations chiffrées."
            }), 1000));
        }
    };

    const exportToPDF = () => {
        if (!aiAnalysis) return;
        
        const doc = new jsPDF();
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 0;

        // ===== PAGE 1 : COUVERTURE =====
        // Fond bleu marine professionnel
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Logo/Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(42);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose', pageWidth / 2, 80, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'light');
        doc.text('Rapport d\'Analyse Professionnelle', pageWidth / 2, 100, { align: 'center' });
        
        // Ligne décorative
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(margin, 115, pageWidth - margin, 115);
        
        // Informations
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Candidat : ${user.name}`, pageWidth / 2, 140, { align: 'center' });
        doc.text(`Date : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, 155, { align: 'center' });
        doc.text(`Type : ${jobOfferText.trim() ? 'Analyse de Matching CV/Offer' : 'Diagnostic de CV'}`, pageWidth / 2, 170, { align: 'center' });
        
        // Score en grand
        const scoreColor = aiAnalysis.score >= 70 ? [34, 197, 94] : (aiAnalysis.score >= 50 ? [234, 171, 28] : [220, 53, 53]);
        doc.setFillColor(...scoreColor);
        doc.circle(pageWidth / 2, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text(`${aiAnalysis.score}`, pageWidth / 2, 215, { align: 'center' });
        doc.setFontSize(14);
        doc.text('/100', pageWidth / 2, 225, { align: 'center' });
        
        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'light');
        doc.text('Document confidentiel - Usage personnel uniquement', pageWidth / 2, 270, { align: 'center' });
        doc.text('www.jobdiagnose.com', pageWidth / 2, 280, { align: 'center' });

        // ===== PAGE 2 : ANALYSE DÉTAILLÉE =====
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        yPos = 20;

        // Header de page
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Rapport d\'Analyse', margin, 10);
        doc.text(`Page 2/2`, pageWidth - margin, 10, { align: 'right' });

        yPos = 30;

        // Titre de section
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALYSE DÉTAILLÉE', margin, yPos);
        yPos += 10;
        
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Score et interprétation
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Score Global', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const scoreInterpretation = aiAnalysis.score >= 70 ? 
            'Excellent - Votre profil correspond bien aux attentes du marché.' :
            (aiAnalysis.score >= 50 ? 
            'Moyen - Votre profil présente des atouts mais nécessite des améliorations.' :
            'À améliorer - Des ajustements importants sont recommandés.');
        
        const scoreLines = doc.splitTextToSize(scoreInterpretation, contentWidth);
        doc.text(scoreLines, margin, yPos);
        yPos += scoreLines.length * 6 + 10;

        // Conseil personnalisé
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F');
        
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1);
        doc.line(margin, yPos, margin, yPos + 35);
        
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSEIL PERSONNALISÉ', margin + 5, yPos + 8);
        
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const conseilLines = doc.splitTextToSize(aiAnalysis.conseil_titre, contentWidth - 10);
        doc.text(conseilLines, margin + 5, yPos + 16);
        
        yPos += 45;

        // Points Forts
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('POINTS FORTS IDENTIFIÉS', margin, yPos);
        yPos += 8;
        
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        aiAnalysis.forces.forEach((force, index) => {
            const forceLines = doc.splitTextToSize(force, contentWidth - 10);
            doc.text(`${index + 1}. ${forceLines[0]}`, margin + 5, yPos);
            yPos += 6;
            if (forceLines.length > 1) {
                doc.text(forceLines.slice(1).join(' '), margin + 10, yPos);
                yPos += 6 * (forceLines.length - 1);
            }
            yPos += 4;
        });
        
        yPos += 5;

        // Axes d'Amélioration
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES D\'AMÉLIORATION', margin, yPos);
        yPos += 8;
        
        doc.setDrawColor(234, 171, 28);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        aiAnalysis.faiblesses.forEach((faiblesse, index) => {
            const faibLines = doc.splitTextToSize(faiblesse, contentWidth - 10);
            doc.text(`${index + 1}. ${faibLines[0]}`, margin + 5, yPos);
            yPos += 6;
            if (faibLines.length > 1) {
                doc.text(faibLines.slice(1).join(' '), margin + 10, yPos);
                yPos += 6 * (faibLines.length - 1);
            }
            yPos += 4;
        });

        // ===== PAGE 3 : RECOMMANDATIONS & COMEUP =====
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        yPos = 20;

        // Header
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Recommandations', margin, 10);
        doc.text(`Page 3/3`, pageWidth - margin, 10, { align: 'right' });

        yPos = 30;

        // Titre
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMANDATIONS FINALES', margin, yPos);
        yPos += 10;
        
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Contenu des recommandations
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const recommendations = [
            '1. Intégrez les mots-clés manquants identifiés dans votre CV',
            '2. Quantifiez vos réalisations avec des chiffres concrets',
            '3. Adaptez votre CV à chaque offre d\'emploi ciblée',
            '4. Mettez en avant vos compétences transférables',
            '5. Relisez attentivement pour éliminer les erreurs'
        ];
        
        recommendations.forEach((rec) => {
            const recLines = doc.splitTextToSize(rec, contentWidth);
            doc.text(recLines, margin, yPos);
            yPos += recLines.length * 7 + 5;
        });

        yPos += 10;

        // Encart Premium Comeup
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(234, 179, 8);
        doc.setLineWidth(1);
        doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'FD');
        
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BESOIN D\'UNE EXPERTISE HUMAINE ?', pageWidth / 2, yPos + 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Nos experts peuvent réécrire votre CV et créer une lettre', pageWidth / 2, yPos + 25, { align: 'center' });
        doc.text('de motivation personnalisée pour maximiser vos chances.', pageWidth / 2, yPos + 32, { align: 'center' });
        
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.text('https://comeup.com/fr/pay/X4gdrlCxauoT', pageWidth / 2, yPos + 42, { align: 'center' });

        // Footer
        doc.setFillColor(30, 58, 138);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'light');
        doc.text('JobDiagnose - Votre partenaire carrière', pageWidth / 2, pageHeight - 10, { align: 'center' });
        
        // Nom du fichier et téléchargement
        const fileName = `JobDiagnose_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };
    const handleUploadCV = async (e) => {
        e.preventDefault();
        if (!selectedFile || !cvText.trim()) {
            setUploadMessage('❌ Veuillez sélectionner un fichier ET vous assurer que le texte a été extrait.');
            return;
        }

        if (userPlan === 'free' && freeAnalysisCount >= 1) {
            setShowPaywall(true);
            setUploadMessage('🔒 Vous avez utilisé votre analyse gratuite. Activez un code ou choisissez une offre.');
            return;
        }

        setIsUploading(true);
        setUploadMessage(jobOfferText.trim() ? '⏳ Analyse du matching CV vs Offre en cours...' : '⏳ Analyse du CV en cours...');
        setAiAnalysis(null);

        try {
            const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), selectedFile);
            const analysis = await analyzeWithAI(cvText);

            await databases.createDocument(DB_ID, COLLECTIONS.CVS, ID.unique(), {
                userId: user.$id,
                fileId: fileResponse.$id,
                fileName: fileResponse.name,
                extractedData: JSON.stringify(analysis),
                score: analysis.score,
                isValidated: true
            }, [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]);

            setAiAnalysis(analysis);
            setUploadMessage(`✅ Succès ! "${fileResponse.name}" importé et analysé.`);
            
            if (userPlan === 'free') {
                const newCount = freeAnalysisCount + 1;
                setFreeAnalysisCount(newCount);
                localStorage.setItem('jobdiagnose_free_count', newCount.toString());
            }
            
            setSelectedFile(null);
            document.getElementById('cv-input').value = '';

        } catch (err) {
            console.error(err);
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
                                {userPlan === 'premium' ? '👑' : (userPlan === 'essentiel' ? '⭐' : '🆓')}
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
                                    <span className="text-3xl">🔑</span>
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

                    {userPlan === 'free' && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3 text-left">
                                <span className="text-3xl">👑</span>
                                <div>
                                    <p className="font-bold text-gray-900">Besoin d'une rédaction humaine experte ?</p>
                                    <p className="text-sm text-gray-600">Obtenez une réécriture complète de votre CV + lettre de motivation.</p>
                                </div>
                            </div>
                            <a href="https://comeup.com/fr/pay/X4gdrlCxauoT" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md whitespace-nowrap flex items-center gap-2">
                                <span>🚀</span> Voir l'offre à 49,99€
                            </a>
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
                                {isExtracting && <p className="text-blue-600 mt-2 text-sm flex items-center gap-2"><span></span> Extraction en cours...</p>}
                            </div>
                            
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="text-xl">📋</span>
                                    <span>2. Texte extrait</span>
                                    {cvText && <span className="text-green-600 font-normal flex items-center gap-1"><span>✅</span> Extrait automatiquement</span>}
                                </label>
                                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} disabled={isUploading} placeholder="Le texte de votre CV apparaîtra ici automatiquement..." className={`w-full h-40 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${cvText ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'} disabled:opacity-50`} />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="text-xl">🎯</span>
                                    <span>3. Texte de l'offre d'emploi</span>
                                    <span className="text-blue-600 font-normal text-xs">(Optionnel)</span>
                                </label>
                                <textarea value={jobOfferText} onChange={(e) => setJobOfferText(e.target.value)} disabled={isUploading} placeholder="Copiez-collez la description du poste..." className="w-full h-32 px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors disabled:opacity-50" />
                            </div>

                            <button type="submit" disabled={isUploading || isExtracting || !selectedFile || !cvText.trim()} className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 ${(!selectedFile || !cvText.trim() || isUploading || isExtracting) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'}`}>
                                {isUploading ? <span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Analyse en cours...</span> : isExtracting ? 'Extraction...' : (jobOfferText.trim() ? <span className="flex items-center justify-center gap-2"><span>🎯</span> Analyser le Matching</span> : <span className="flex items-center justify-center gap-2"><span></span> Diagnostiquer mon CV</span>)}
                            </button>
                        </form>

                        {showPaywall && userPlan === 'free' && (
                            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">🔒</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analyse gratuite utilisée !</h3>
                                        <p className="text-gray-700 mb-4">Vous avez bénéficié de votre diagnostic gratuit. Pour continuer, activez un code ou choisissez une offre :</p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button 
                                                onClick={() => setShowActivationForm(true)}
                                                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                                            >
                                                🔑 J'ai un code d'activation
                                            </button>
                                            <a href="https://comeup.com/fr/pay/JDlXGkTRPbYG" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
                                                🥉 Essentiel - 9,99€/mois
                                            </a>
                                            <a href="https://comeup.com/fr/pay/X4gdrlCxauoT" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-center hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md">
                                                👑 Premium - 49,99€
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {uploadMessage && !showPaywall && (
                            <div className={`mt-6 p-4 rounded-xl text-center font-medium ${uploadMessage.includes('Succès') ? 'bg-green-100 text-green-800 border border-green-300' : (uploadMessage.includes('Extraction') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-red-100 text-red-800 border border-red-300')}`}>
                                {uploadMessage}
                            </div>
                        )}
                    </div>

                    {aiAnalysis && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6 flex items-center justify-center gap-2">
                                <span className="text-3xl">{jobOfferText.trim() ? '' : '📊'}</span>
                                <span>{jobOfferText.trim() ? 'Résultat du Matching' : 'Résultat du Diagnostic'}</span>
                            </h2>
                            
                            <div className="text-center mb-8">
                                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${aiAnalysis.score >= 70 ? 'border-green-500 text-green-600' : (aiAnalysis.score >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600')} mb-4`}>
                                    <div>
                                        <div className="text-4xl font-bold">{aiAnalysis.score}</div>
                                        <div className="text-sm">/100</div>
                                    </div>
                                </div>
                                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                                    <div className={`h-3 rounded-full transition-all duration-1000 ${aiAnalysis.score >= 70 ? 'bg-green-600' : (aiAnalysis.score >= 50 ? 'bg-yellow-600' : 'bg-red-600')}`} style={{ width: `${aiAnalysis.score}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-5 mb-6 rounded-r-xl">
                                <p className="text-gray-700 flex items-start gap-3">
                                    <span className="text-2xl">💡</span>
                                    <span><span className="font-bold text-blue-600">Conseil personnalisé :</span> {aiAnalysis.conseil_titre}</span>
                                </p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">✨</span> Points Forts
                                    </h3>
                                    <ul className="space-y-3">
                                        {aiAnalysis.forces.map((f, i) => (
                                            <li key={i} className="flex items-start gap-3 text-green-900">
                                                <span className="text-green-600 font-bold mt-1">✓</span>
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                                    <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">⚡</span> Axes d'Amélioration
                                    </h3>
                                    <ul className="space-y-3">
                                        {aiAnalysis.faiblesses.map((f, i) => (
                                            <li key={i} className="flex items-start gap-3 text-orange-900">
                                                <span className="text-orange-600 font-bold mt-1">→</span>
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {aiAnalysis && (
                        <div className="text-center mt-8">
                            <button 
                                onClick={exportToPDF}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 flex items-center gap-3 mx-auto"
                            >
                                <span className="text-2xl"></span>
                                <span>Télécharger mon rapport en PDF</span>
                            </button>
                            <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
                                <span>📐</span> Format A4 professionnel • Prêt à imprimer ou partager
                            </p>
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <button onClick={handleLogout} className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center gap-2 mx-auto">
                            <span>👋</span>
                            <span>Se déconnecter</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium mb-4">
                        <span>←</span>
                        <span>Retour à l'accueil</span>
                    </Link>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl">💼</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        {isLogin ? 'Connexion' : 'Inscription'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {isLogin ? "Accédez à votre espace" : "Créez votre compte gratuitement"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="mt-8 space-y-6">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <span>👤</span> Nom complet
                            </label>
                            <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="Jean Dupont" />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span></span> Adresse email
                        </label>
                        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="jean.dupont@email.com" />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span>🔒</span> Mot de passe
                        </label>
                        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all" placeholder="••••••••" />
                    </div>

                    {isLogin && (
                        <div className="text-right -mt-4">
                            <Link to="/recovery" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                🔑 Mot de passe oublié ?
                            </Link>
                        </div>
                    )}

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-[1.02] shadow-lg">
                            <span>{isLogin ? '' : '✨'}</span>
                            <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-gray-600">
                        {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline">
                            {isLogin ? "S'inscrire" : "Se connecter"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}