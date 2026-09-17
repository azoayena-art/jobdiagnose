import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { account, ID, databases, storage, DB_ID, COLLECTIONS, BUCKET_ID } from './appwrite';
import { Query, Permission, Role } from 'appwrite';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { useTheme } from './hooks/useTheme';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const ThemeIcon = {
    Sun: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    Moon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    )
};

export default function Auth() {
    const [searchParams] = useSearchParams();
    const { theme, toggleTheme } = useTheme();
    const { executeRecaptcha } = useGoogleReCaptcha();
    
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [userPlan, setUserPlan] = useState('free');
    const [planQuota, setPlanQuota] = useState(3);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvText, setCvText] = useState('');
    const [jobOfferText, setJobOfferText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const [analysisCount, setAnalysisCount] = useState(() => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('jobdiagnose_current_user_id') : null;
        return parseInt(localStorage.getItem(`jobdiagnose_analysis_count_${userId || 'default'}`) || '0');
    });
    
    const [showPaywall, setShowPaywall] = useState(false);
    const [activationCode, setActivationCode] = useState('');
    const [showActivationForm, setShowActivationForm] = useState(false);
    const [activationMessage, setActivationMessage] = useState('');
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => { 
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');
        
        if (userId && secret) {
            console.log('🔑 Paramètres de recovery détectés:', { userId, secret });
            setAuthMode('reset');
        } else {
            checkUser();
        }
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            localStorage.setItem('jobdiagnose_current_user_id', currentUser.$id);
            
            const savedPlan = localStorage.getItem(`jobdiagnose_plan_${currentUser.$id}`);
            if (savedPlan) setUserPlan(savedPlan);
            
            try {
                const pricingRes = await databases.listDocuments(DB_ID, COLLECTIONS.PRICING);
                const planName = savedPlan || 'free';
                console.log('🔍 Recherche du plan:', planName, '| Plans disponibles:', pricingRes.documents.map(p => ({ name: p.name, analyses: p.analyses })));
                
                const userPlanDoc = pricingRes.documents.find(p => {
                    const docName = p.name.toLowerCase();
                    const search = planName.toLowerCase();
                    return docName === search || 
                           docName.includes(search) || 
                           search.includes(docName) ||
                           (search === 'free' && (docName.includes('découverte') || docName.includes('gratuit') || docName.includes('free'))) ||
                           (search === 'découverte' && docName.includes('découverte')) ||
                           (search === 'essentiel' && docName.includes('essentiel')) ||
                           (search === 'premium' && docName.includes('premium'));
                });
                
                console.log('📄 Plan trouvé:', userPlanDoc);
                
                if (userPlanDoc && userPlanDoc.analyses !== undefined) {
                    const quota = parseInt(userPlanDoc.analyses, 10);
                    setPlanQuota(quota);
                    console.log(`✅ Quota chargé depuis Appwrite: ${quota} analyses pour le plan ${planName}`);
                } else {
                    console.warn(`️ Plan "${planName}" non trouvé ou champ analyses manquant, quota par défaut: 3`);
                    setPlanQuota(3);
                }
            } catch (e) {
                console.warn('❌ Impossible de charger le quota pricing:', e);
                setPlanQuota(3);
            }
        } catch (err) { setUser(null); }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');

        if (!executeRecaptcha) { setError('Sécurité non chargée. Rechargez la page.'); return; }
        const token = await executeRecaptcha('login_action');
        
        const verifyRes = await fetch('/api/verify-captcha', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ token }) 
        });
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success || verifyData.score < 0.5) {
            setError('Activité suspecte détectée. Veuillez réessayer.');
            return;
        }

        try {
            if (authMode === 'login') {
                await account.createEmailPasswordSession(email, password);
            } else {
                await account.create(ID.unique(), email, password, name);
                await account.createEmailPasswordSession(email, password);
            }
            checkUser();
        } catch (err) { setError(err.message); }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const redirectUrl = window.location.origin + '/auth';
            await account.createRecovery(recoveryEmail, redirectUrl);
            setMessage('Un e-mail de réinitialisation a été envoyé. Vérifiez votre boîte de réception (et vos spams).');
        } catch (err) { setError(err.message); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        try {
            const userId = searchParams.get('userId');
            const secret = searchParams.get('secret');
            
            if (!userId || !secret) {
                setError('Lien de réinitialisation invalide. Veuillez redemander un nouveau lien.');
                setAuthMode('forgot');
                return;
            }
            
            await account.updateRecovery(userId, secret, newPassword, confirmPassword);
            setMessage('Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
            setAuthMode('login');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) { setError(err.message); }
    };

    const handleLogout = async () => {
        localStorage.removeItem('jobdiagnose_current_user_id');
        await account.deleteSession('current');
        setUser(null);
        resetForm();
    };

    const resetForm = () => {
        setEmail(''); setPassword(''); setName(''); setSelectedFile(null); setCvText('');
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
            
            try {
                const pricingRes = await databases.listDocuments(DB_ID, COLLECTIONS.PRICING);
                const userPlanDoc = pricingRes.documents.find(p => 
                    p.name.toLowerCase() === planType.toLowerCase() ||
                    p.name.toLowerCase().includes(planType)
                );
                if (userPlanDoc && userPlanDoc.analyses) {
                    const newQuota = parseInt(userPlanDoc.analyses, 10);
                    setPlanQuota(newQuota);
                    setAnalysisCount(0);
                    localStorage.setItem(`jobdiagnose_analysis_count_${user.$id}`, '0');
                    console.log(`✅ Compteur réinitialisé à 0 | Nouveau quota: ${newQuota} analyses pour le plan ${planType}`);
                }
            } catch (e) {
                console.warn('Erreur rechargement quota:', e);
            }
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
            setIsExtracting(false); setUploadMessage('');
            return fullText.trim();
        } catch (err) {
            setIsExtracting(false); setUploadMessage('Erreur lors de l\'extraction.');
            return '';
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileName = file.name.toLowerCase();
        const fileType = file.type;
        
        const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
        const isDOCX = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx');
        const isDOC = fileType === 'application/msword' || fileName.endsWith('.doc');
        
        if (!isPDF && !isDOCX && !isDOC) {
            setSelectedFile(null);
            setCvText('');
            setUploadMessage(`❌ Format non supporté : ${file.name}. Veuillez utiliser un fichier PDF ou DOCX.`);
            return;
        }
        
        setSelectedFile(file);
        setUploadMessage('');
        
        if (isPDF) {
            const extractedText = await extractTextFromPDF(file);
            if (extractedText && extractedText.length > 50) {
                setCvText(extractedText);
                setCurrentStep(2);
                setUploadMessage('✅ Texte extrait avec succès. Vérifiez et lancez l\'analyse.');
            } else {
                setCvText('');
                setUploadMessage(`⚠️ Impossible d'extraire le texte de ce PDF. Le fichier est peut-être scanné ou protégé. Essayez un autre PDF ou copiez-collez le texte manuellement.`);
            }
        } else if (isDOCX || isDOC) {
            setCvText('');
            setUploadMessage(`⚠️ Format DOC/DOCX détecté : l'extraction automatique n'est pas disponible. Veuillez ouvrir votre fichier Word, copier tout le texte (Ctrl+A puis Ctrl+C), et le coller dans la zone "Texte extrait" ci-dessous.`);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        await handleFileSelect({ target: { files: [file] } });
    };

    const analyzeWithAI = async (text) => {
        try {
            const hasOffer = jobOfferText.trim().length > 50;
            
            let prompt = '';
            
            if (hasOffer) {
                prompt = `Tu es un expert en recrutement. Évalue le MATCHING entre ce CV et cette offre.

CV :
"""
${text.substring(0, 3000)}
"""

OFFRE :
"""
${jobOfferText.substring(0, 3000)}
"""

Si le CV ou l'offre est illisible/incompréhensible, réponds EXACTEMENT :
{"score": 0, "matching_summary": "Format illisible", "forces": [], "faiblesses": ["Le texte n'est pas analysable"], "conseil_titre": "Revoir le format"}

Sinon, évalue le matching sur 100 (5 critères de 20 pts) et réponds en JSON :
{"score": 72, "matching_summary": "...", "forces": ["...", "...", "..."], "faiblesses": ["...", "...", "..."], "conseil_titre": "..."}`;
            } else {
                prompt = `Tu es un expert en recrutement. Analyse ce CV.

CV :
"""
${text.substring(0, 3000)}
"""

Si le CV est illisible/incompréhensible, réponds EXACTEMENT :
{"score": 0, "matching_summary": "Format illisible", "forces": [], "faiblesses": ["Le texte n'est pas analysable"], "conseil_titre": "Revoir le format"}

Sinon, évalue la qualité sur 100 et réponds en JSON :
{"score": 65, "matching_summary": "...", "forces": ["...", "...", "..."], "faiblesses": ["...", "...", "..."], "conseil_titre": "..."}`;
            }
            
            const response = await fetch('/api/gemini', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ prompt }) 
            });
            
            const data = await response.json();
            
            console.log(' Réponse brute de l\'API:', data);
            
            if (data.error) throw new Error(data.error);
            
            let raw = data.result;
            
            console.log('🔍 Type de raw:', typeof raw, '| Valeur:', raw);
            
            if (typeof raw === 'string') {
                try {
                    const cleanJson = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        raw = JSON.parse(jsonMatch[0]);
                        console.log('✅ JSON parsé avec succès:', raw);
                    } else {
                        console.warn('⚠️ Aucun objet JSON trouvé dans la réponse');
                        raw = null;
                    }
                } catch (e) {
                    console.error('❌ Erreur parsing JSON:', e);
                    raw = null;
                }
            }

            // ✅ Détection d'échec : si raw est null ou si l'IA a renvoyé score 0
            if (!raw || raw.score === 0) {
                console.warn('⚠️ Analyse échouée - Score forcé à 0');
                return { 
                    score: 0, 
                    matching_summary: "Format illisible",
                    forces: [], 
                    faiblesses: ["Le texte extrait n'est pas assez clair pour être analysé."], 
                    conseil_titre: "Revoir le format" 
                };
            }

            // ✅ Extraction du score
            let finalScore = 0;
            if (raw.score !== undefined && raw.score !== null) {
                const parsedScore = parseInt(raw.score, 10);
                if (!isNaN(parsedScore) && parsedScore >= 10 && parsedScore <= 95) {
                    finalScore = parsedScore;
                    console.log('✅ Score extrait:', finalScore);
                } else {
                    console.warn('⚠️ Score invalide:', raw.score);
                    finalScore = 0;
                }
            }

            return {
                score: finalScore,
                matching_summary: raw.matching_summary || "Format illisible",
                forces: Array.isArray(raw.forces) && raw.forces.length > 0 ? raw.forces : [],
                faiblesses: Array.isArray(raw.faiblesses) && raw.faiblesses.length > 0 ? raw.faiblesses : ["Le texte extrait n'est pas assez clair pour être analysé."],
                conseil_titre: raw.conseil_titre || "Revoir le format"
            };
        } catch (error) {
            console.error('❌ Erreur IA:', error);
            return { 
                score: 0, 
                matching_summary: "Format illisible",
                forces: [], 
                faiblesses: ["Le texte extrait n'est pas assez clair pour être analysé."], 
                conseil_titre: "Revoir le format" 
            };
        }
    };

    const exportToPDF = () => {
        if (!aiAnalysis || !user) return;
        
        const doc = new jsPDF();
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 0;

        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose', pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Rapport d\'Analyse Professionnelle de CV', pageWidth / 2, 30, { align: 'center' });
        
        doc.setFontSize(9);
        const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Généré le ${dateStr}`, pageWidth / 2, 40, { align: 'center' });

        yPos = 65;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS CANDIDAT', margin, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Nom : ${user.name}`, margin, yPos);
        yPos += 6;
        doc.text(`Email : ${user.email}`, margin, yPos);
        yPos += 6;
        const planLabel = userPlan === 'premium' ? 'Premium' : (userPlan === 'essentiel' ? 'Essentiel' : 'Gratuit');
        doc.text(`Plan : ${planLabel}`, margin, yPos);

        yPos = 100;
        doc.setFillColor(240, 245, 255);
        doc.roundedRect(margin, yPos, contentWidth, 45, 3, 3, 'F');
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPos, contentWidth, 45, 3, 3, 'S');
        
        yPos += 12;
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('SCORE GLOBAL DE VOTRE CV', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 18;
        doc.setFontSize(32);
        const scoreColor = aiAnalysis.score >= 70 ? [34, 197, 94] : (aiAnalysis.score >= 50 ? [234, 179, 8] : [220, 38, 38]);
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`${aiAnalysis.score}/100`, pageWidth / 2, yPos, { align: 'center' });

        yPos += 8;
        const barWidth = 100;
        const barX = (pageWidth - barWidth) / 2;
        doc.setFillColor(220, 220, 220);
        doc.rect(barX, yPos, barWidth, 5, 'F');
        doc.setFillColor(30, 58, 138);
        doc.rect(barX, yPos, (barWidth * aiAnalysis.score) / 100, 5, 'F');

        yPos = 165;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSUMÉ EXÉCUTIF', margin, yPos);
        
        yPos += 3;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 40, yPos);
        
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const resumeText = `Votre CV a obtenu un score de ${aiAnalysis.score}/100. ${
            aiAnalysis.score >= 70 ? 'Il présente de solides atouts qui devraient attirer l\'attention des recruteurs.' : 
            aiAnalysis.score >= 50 ? 'Il contient des éléments pertinents mais nécessite des améliorations pour être compétitif.' : 
            'Il nécessite des retravail importants avant d\'être envoyé aux recruteurs.'
        } Ce rapport détaille vos points forts, les axes d\'amélioration et un plan d\'action concret.`;
        
        const resumeLines = doc.splitTextToSize(resumeText, contentWidth);
        doc.text(resumeLines, margin, yPos);
        yPos += resumeLines.length * 4.5 + 8;

        doc.setFillColor(255, 248, 220);
        doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'F');
        doc.setDrawColor(218, 165, 32);
        doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'S');
        
        yPos += 6;
        doc.setTextColor(139, 90, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSEIL CLÉ :', margin + 5, yPos);
        
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const conseilLines = doc.splitTextToSize(aiAnalysis.conseil_titre || "Aucun conseil disponible.", contentWidth - 10);
        doc.text(conseilLines, margin + 5, yPos);

        doc.addPage();
        yPos = 20;
        
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Analyse Détaillée', margin, 8);
        doc.text('Page 2/3', pageWidth - margin, 8, { align: 'right' });

        yPos = 25;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALYSE DÉTAILLÉE', margin, yPos);
        
        yPos += 4;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 50, yPos);
        yPos += 10;

        doc.setFillColor(232, 245, 233);
        doc.roundedRect(margin, yPos, contentWidth, 9, 2, 2, 'F');
        doc.setTextColor(27, 94, 32);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('POINTS FORTS IDENTIFIÉS', margin + 5, yPos + 6);
        yPos += 12;

        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        if (aiAnalysis.forces && aiAnalysis.forces.length > 0) {
            aiAnalysis.forces.forEach((force) => {
                if (yPos > 260) { doc.addPage(); yPos = 20; }
                doc.setTextColor(27, 94, 32);
                doc.setFont('helvetica', 'bold');
                doc.text('>', margin + 2, yPos);
                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'normal');
                const forceLines = doc.splitTextToSize(force, contentWidth - 12);
                doc.text(forceLines, margin + 8, yPos);
                yPos += forceLines.length * 4.5 + 3;
            });
        }

        yPos += 5;
        
        doc.setFillColor(255, 243, 224);
        doc.roundedRect(margin, yPos, contentWidth, 9, 2, 2, 'F');
        doc.setTextColor(230, 81, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES D\'AMÉLIORATION', margin + 5, yPos + 6);
        yPos += 12;

        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        if (aiAnalysis.faiblesses && aiAnalysis.faiblesses.length > 0) {
            aiAnalysis.faiblesses.forEach((faiblesse) => {
                if (yPos > 260) { doc.addPage(); yPos = 20; }
                doc.setTextColor(230, 81, 0);
                doc.setFont('helvetica', 'bold');
                doc.text('-', margin + 2, yPos);
                doc.setTextColor(30, 30, 30);
                doc.setFont('helvetica', 'normal');
                const faibLines = doc.splitTextToSize(faiblesse, contentWidth - 12);
                doc.text(faibLines, margin + 8, yPos);
                yPos += faibLines.length * 4.5 + 3;
            });
        }

        doc.addPage();
        yPos = 20;
        
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Plan d\'Action', margin, 8);
        doc.text('Page 3/3', pageWidth - margin, 8, { align: 'right' });

        yPos = 25;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PRIORISÉ', margin, yPos);
        
        yPos += 4;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 60, yPos);
        yPos += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);

        const actions = [
            { priority: 'PRIORITÉ HAUTE', color: [220, 38, 38], text: 'Corrigez immédiatement les axes d\'amélioration identifiés ci-dessus.' },
            { priority: 'PRIORITÉ MOYENNE', color: [234, 179, 8], text: 'Enrichissez votre CV avec des réalisations chiffrées et des verbes d\'action.' },
            { priority: 'PRIORITÉ BASSE', color: [34, 197, 94], text: 'Peaufinez la mise en forme et vérifiez l\'orthographe.' }
        ];
        
        actions.forEach((action) => {
            if (yPos > 240) { doc.addPage(); yPos = 20; }
            doc.setFillColor(action.color[0], action.color[1], action.color[2]);
            doc.roundedRect(margin, yPos, contentWidth, 7, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(action.priority, margin + 3, yPos + 5);
            yPos += 10;
            doc.setTextColor(30, 30, 30);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const actionLines = doc.splitTextToSize(action.text, contentWidth);
            doc.text(actionLines, margin + 5, yPos);
            yPos += actionLines.length * 4.5 + 6;
        });

        yPos += 5;
        
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(margin, yPos, contentWidth, 9, 2, 2, 'F');
        doc.setTextColor(30, 58, 138);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CHECKLIST FINALE', margin + 5, yPos + 6);
        yPos += 12;
        
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const checklist = [
            '[ ]  CV tenu sur 1 à 2 pages maximum',
            '[ ]  Photo professionnelle',
            '[ ]  Titre de poste clair',
            '[ ]  Résumé professionnel en 3-4 lignes',
            '[ ]  Expériences avec verbes d\'action',
            '[ ]  Compétences techniques séparées',
            '[ ]  Formation à jour',
            '[ ]  Aucune faute d\'orthographe',
            '[ ]  Format PDF uniquement',
            '[ ]  Nom du fichier professionnel'
        ];
        
        checklist.forEach(item => {
            if (yPos > 260) { doc.addPage(); yPos = 20; }
            doc.text(item, margin + 5, yPos);
            yPos += 6;
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(`JobDiagnose © ${new Date().getFullYear()} - Rapport confidentiel`, pageWidth / 2, 290, { align: 'center' });
            doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, 290, { align: 'right' });
        }
        
        doc.save(`JobDiagnose_Rapport_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

        const handleUploadCV = async (e) => {
        e.preventDefault();
        if (!selectedFile || !cvText.trim()) { setUploadMessage('Veuillez sélectionner un fichier.'); return; }
        
        if (analysisCount >= planQuota) { 
            setShowPaywall(true); 
            setUploadMessage(`Quota atteint : vous avez utilisé vos ${planQuota} analyse(s) ${userPlan === 'free' || userPlan === 'découverte' ? 'gratuites' : `incluses dans votre plan ${userPlan}`}. Activez un code pour continuer.`); 
            return; 
        }

        if (!executeRecaptcha) { setUploadMessage('Sécurité non chargée.'); return; }
        const token = await executeRecaptcha('upload_action');
        const verifyRes = await fetch('/api/verify-captcha', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ token }) 
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success || verifyData.score < 0.5) {
            setUploadMessage('Activité suspecte détectée. Veuillez réessayer.');
            return;
        }

        setIsUploading(true); setUploadMessage('');
        try {
            const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), selectedFile);
            const analysis = await analyzeWithAI(cvText);
            
            // ✅ DÉTECTION D'ÉCHEC : score 65 + valeurs par défaut = format illisible
            const isFailedAnalysis = analysis.score === 65 && 
                                     analysis.forces.length > 0 && 
                                     analysis.forces[0] === 'Expérience pertinente';
            
            if (isFailedAnalysis) {
                console.warn('⚠️ Analyse échouée détectée - Compteur non incrémenté');
                setUploadMessage('Erreur de format. Réessayez.');
                // ✅ NE PAS passer à l'étape 3, rester à l'étape 2
                setIsUploading(false);
                return;
            }
            
            // ✅ Analyse réussie : sauvegarder et incrémenter
            await databases.createDocument(DB_ID, COLLECTIONS.CVS, ID.unique(), {
                userId: user.$id, fileId: fileResponse.$id, fileName: fileResponse.name,
                extractedData: JSON.stringify(analysis), score: analysis.score, isValidated: true
            }, [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]);

            setAiAnalysis(analysis);
            setCurrentStep(3);
            
            const newCount = analysisCount + 1;
            setAnalysisCount(newCount);
            localStorage.setItem(`jobdiagnose_analysis_count_${user.$id}`, newCount.toString());
            console.log(`✅ Analyse #${newCount}/${planQuota} enregistrée avec succès`);
        } catch (err) {
            setUploadMessage(`Erreur : ${err.message}`);
        } finally { setIsUploading(false); }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center py-12 px-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="JobDiagnose" className="h-12 w-auto" />
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {authMode === 'login' && 'Bon retour parmi nous'}
                            {authMode === 'register' && 'Créez votre compte'}
                            {authMode === 'forgot' && 'Mot de passe oublié'}
                            {authMode === 'reset' && 'Réinitialiser le mot de passe'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {authMode === 'login' && 'Connectez-vous pour analyser votre CV'}
                            {authMode === 'register' && 'Commencez gratuitement en 30 secondes'}
                            {authMode === 'forgot' && 'Entrez votre e-mail pour recevoir un lien de réinitialisation'}
                            {authMode === 'reset' && 'Choisissez votre nouveau mot de passe'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 border border-gray-100 dark:border-gray-800">
                        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
                        {message && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-6 text-sm">{message}</div>}

                        {authMode === 'login' && (
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="vous@exemple.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <button type="button" onClick={() => { setAuthMode('forgot'); setError(''); setMessage(''); }} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                                        Mot de passe oublié ?
                                    </button>
                                    <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                        {theme === 'dark' ? <ThemeIcon.Sun /> : <ThemeIcon.Moon />}
                                    </button>
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                                    Se connecter
                                </button>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                                    Ce site est protégé par reCAPTCHA. Les 
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> Conditions d'utilisation</a> et la 
                                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> Politique de confidentialité</a> de Google s'appliquent.
                                </p>
                            </form>
                        )}

                        {authMode === 'register' && (
                            <form onSubmit={handleAuth} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Jean Dupont" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="vous@exemple.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                        {theme === 'dark' ? <ThemeIcon.Sun /> : <ThemeIcon.Moon />}
                                    </button>
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                                    Créer mon compte
                                </button>
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                                    Ce site est protégé par reCAPTCHA. Les 
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> Conditions d'utilisation</a> et la 
                                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline"> Politique de confidentialité</a> de Google s'appliquent.
                                </p>
                            </form>
                        )}

                        {authMode === 'forgot' && (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse e-mail</label>
                                    <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="vous@exemple.com" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                        {theme === 'dark' ? <ThemeIcon.Sun /> : <ThemeIcon.Moon />}
                                    </button>
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                                    Envoyer le lien de réinitialisation
                                </button>
                            </form>
                        )}

                        {authMode === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le mot de passe</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                        {theme === 'dark' ? <ThemeIcon.Sun /> : <ThemeIcon.Moon />}
                                    </button>
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                                    Réinitialiser le mot de passe
                                </button>
                            </form>
                        )}

                        <div className="mt-6 text-center space-y-2">
                            {authMode === 'login' && (
                                <button onClick={() => { setAuthMode('register'); setError(''); setMessage(''); }} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Pas encore de compte ? S'inscrire
                                </button>
                            )}
                            {authMode === 'register' && (
                                <button onClick={() => { setAuthMode('login'); setError(''); setMessage(''); }} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Déjà un compte ? Se connecter
                                </button>
                            )}
                            {(authMode === 'forgot' || authMode === 'reset') && (
                                <button onClick={() => { setAuthMode('login'); setError(''); setMessage(''); }} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    ← Retour à la connexion
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">← Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="JobDiagnose" className="h-10 w-auto" />
                        </Link>
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/dashboard" className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Mon espace</Link>
                            <Link to="/" className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Accueil</Link>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-xs">{userPlan === 'premium' ? '' : (userPlan === 'essentiel' ? '⭐' : '')}</span>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{userPlan}</span>
                            </div>
                            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Changer le thème">
                                {theme === 'dark' ? <ThemeIcon.Sun /> : <ThemeIcon.Moon />}
                            </button>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors">Déconnexion</button>
                        </div>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"> Mon espace</Link>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium"> Accueil</Link>
                            <button onClick={toggleTheme} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium">
                                {theme === 'dark' ? '️ Mode clair' : '🌙 Mode sombre'}
                            </button>
                            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"> Déconnexion</button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Bonjour {user.name.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Analysez votre CV et obtenez des conseils personnalisés en 30 secondes.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Plan : <span className="font-semibold capitalize">{userPlan}</span> | 
                        Analyses utilisées : <span className="font-semibold">{analysisCount}/{planQuota}</span>
                    </p>
                </div>

                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        {[{ n: 1, label: 'Upload', desc: 'CV & offre' }, { n: 2, label: 'Analyse', desc: 'Vérification' }, { n: 3, label: 'Résultats', desc: 'Diagnostic' }].map((step, i) => (
                            <div key={step.n} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${currentStep > step.n ? 'bg-green-500 text-white' : currentStep === step.n ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                                        {currentStep > step.n ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : step.n}
                                    </div>
                                    <div className="mt-2 text-center hidden sm:block">
                                        <div className={`text-sm font-semibold ${currentStep >= step.n ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">{step.desc}</div>
                                    </div>
                                </div>
                                {i < 2 && <div className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all ${currentStep > step.n ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {!showPaywall && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Vous avez un code d'activation ?</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Débloquez des analyses supplémentaires</p>
                                </div>
                            </div>
                            <button onClick={() => setShowActivationForm(!showActivationForm)} className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                                {showActivationForm ? 'Fermer' : 'Activer un code'}
                            </button>
                        </div>
                        {showActivationForm && (
                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="text" value={activationCode} onChange={(e) => setActivationCode(e.target.value.toUpperCase())} placeholder="JD-ESS-XXXX" className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                                    <button type="button" onClick={handleActivationClick} disabled={isActivating} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {isActivating ? '...' : 'Activer'}
                                    </button>
                                </div>
                                {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
                                {activationMessage && <p className="mt-2 text-green-600 dark:text-green-400 text-sm">{activationMessage}</p>}
                            </div>
                        )}
                    </div>
                )}

                {(currentStep === 1 || currentStep === 2) && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentStep === 1 ? 'Déposez votre CV' : 'Vérifiez et lancez l\'analyse'}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentStep === 1 ? 'Formats acceptés : PDF, DOCX' : 'Modifiez le texte si nécessaire avant l\'analyse'}</p>
                        </div>
                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Votre CV</label>
                                <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative group">
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            </div>
                                            {selectedFile ? (
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Fichier chargé</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Cliquez pour uploader ou glissez-déposez</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF ou DOCX (max 5MB)</p>
                                                </div>
                                            )}
                                        </div>
                                        <input id="cv-input" type="file" accept=".pdf,.docx" onChange={handleFileSelect} disabled={isUploading || isExtracting} className="hidden" />
                                    </label>
                                    {isExtracting && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Extraction du texte...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Texte extrait <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">modifiable</span></label>
                                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} disabled={isUploading} placeholder="Le texte de votre CV apparaîtra ici après l'upload..." className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Offre d'emploi <span className="ml-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-md">Optionnel</span></label>
                                <textarea value={jobOfferText} onChange={(e) => setJobOfferText(e.target.value)} disabled={isUploading} placeholder="Collez la description du poste pour une analyse de matching..." className="w-full h-28 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" />
                            </div>
                            {uploadMessage && !showPaywall && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">{uploadMessage}</div>}
                            {showPaywall && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quota d'analyses atteint</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Vous avez utilisé vos {planQuota} analyse(s) {userPlan === 'free' || userPlan === 'découverte' ? 'gratuites' : `incluses dans votre plan ${userPlan}`}. Activez un code ou découvrez nos formules pour continuer.</p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <button onClick={() => { setShowActivationForm(true); setShowPaywall(false); }} className="py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">J'ai un code</button>
                                        <Link to="/#pricing" className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transition-all text-sm flex items-center justify-center gap-2">
                                            Voir les tarifs
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            )}
                            <button onClick={handleUploadCV} disabled={isUploading || isExtracting || !selectedFile || !cvText.trim() || showPaywall} className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 dark:disabled:from-gray-700 disabled:to-gray-300 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2">
                                {isUploading ? (<><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div><span>Analyse en cours...</span></>) : (<><span>{jobOfferText.trim() ? 'Analyser le matching' : 'Lancer l\'analyse'}</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>)}
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && aiAnalysis && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-500/30 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative">
                                        <svg className="w-40 h-40 -rotate-90">
                                            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                                            <circle cx="80" cy="80" r="70" stroke="white" strokeWidth="12" fill="none" strokeDasharray={`${(aiAnalysis.score / 100) * 440} 440`} strokeLinecap="round" className="transition-all duration-1000" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-5xl font-bold">{aiAnalysis.score}</div>
                                            <div className="text-sm text-blue-100">/100</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
                                            {aiAnalysis.score === 0 ? 'FORMAT INVALIDE' : aiAnalysis.score >= 70 ? 'EXCELLENT' : aiAnalysis.score >= 50 ? 'BON' : 'À AMÉLIORER'}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                            {aiAnalysis.score === 0 ? 'Format non analysable' : aiAnalysis.score >= 70 ? 'Votre CV est très compétitif' : aiAnalysis.score >= 50 ? 'Bon point de départ' : 'Des améliorations nécessaires'}
                                        </h2>
                                        <p className="text-blue-100 text-sm sm:text-base mb-2">{aiAnalysis.matching_summary}</p>
                                        <p className="text-white/80 text-xs sm:text-sm italic">{aiAnalysis.conseil_titre}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/20">
                                    {aiAnalysis.score > 0 && (
                                        <button onClick={exportToPDF} className="flex-1 py-3 px-5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Télécharger le rapport PDF
                                        </button>
                                    )}
                                    <button onClick={() => { setAiAnalysis(null); setCurrentStep(1); setSelectedFile(null); setCvText(''); setJobOfferText(''); }} className="flex-1 py-3 px-5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                                        Nouvelle analyse
                                    </button>
                                </div>
                            </div>
                        </div>

                        {aiAnalysis.score > 0 && (
                            <>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Points forts</h3>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {aiAnalysis.forces.length > 0 ? aiAnalysis.forces.map((f, i) => (
                                                <div key={i} className="flex gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-xl">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f}</p>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun point fort identifié.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Axes d'amélioration</h3>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {aiAnalysis.faiblesses.map((f, i) => (
                                                <div key={i} className="flex gap-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Conseil clé</h3>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.conseil_titre}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {aiAnalysis.score === 0 && (
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Format non analysable</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                            Nous n'avons pas pu analyser votre CV correctement. Cela peut être dû à :
                                        </p>
                                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                            <li>Un CV au format image (scan)</li>
                                            <li>Un PDF protégé ou corrompu</li>
                                            <li>Un texte trop court ou illisible</li>
                                        </ul>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 font-medium">
                                            💡 Cette analyse n'a pas été comptabilisée. Vous pouvez réessayer avec un autre fichier.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 3 && !aiAnalysis && isUploading && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 animate-pulse">
                            <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyse en cours...</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Notre IA examine votre CV selon 50+ critères</p>
                        <div className="mt-6 max-w-xs mx-auto">
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}