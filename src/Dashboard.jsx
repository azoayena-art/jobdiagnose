import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account, databases, DB_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import jsPDF from 'jspdf';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState('free');
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
                const savedPlan = localStorage.getItem(`jobdiagnose_plan_${currentUser.$id}`);
                if (savedPlan) setUserPlan(savedPlan);
                loadAnalyses(currentUser.$id);
            } catch (err) {
                navigate('/auth');
            }
        };
        checkAuth();
    }, [navigate]);

    const loadAnalyses = async (userId) => {
        try {
            const res = await databases.listDocuments(DB_ID, COLLECTIONS.CVs, [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(50)
            ]);
            setAnalyses(res.documents);
        } catch (e) {
            console.error('Erreur chargement analyses:', e);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: analyses.length,
        moyenne: analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0,
        meilleure: analyses.length > 0 ? Math.max(...analyses.map(a => a.score)) : 0,
        plan: userPlan
    };

    const exportAnalysisPDF = (analysis) => {
        if (!analysis || !user) return;
        const doc = new jsPDF();
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 0;

        let data;
        try {
            data = typeof analysis.extractedData === 'string' ? JSON.parse(analysis.extractedData) : analysis.extractedData;
        } catch (e) {
            data = { score: analysis.score, forces: [], faiblesses: [], conseil_titre: "Donnees non disponibles." };
        }

        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose', pageWidth / 2, 25, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Rapport d\'Analyse de CV', pageWidth / 2, 38, { align: 'center' });
        doc.setFontSize(10);
        const dateAnalyse = new Date(analysis.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Analyse du ${dateAnalyse}`, pageWidth / 2, 50, { align: 'center' });

        yPos = 75;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('CANDIDAT', margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Nom : ${user.name}`, margin, yPos);
        yPos += 6;
        doc.text(`Email : ${user.email}`, margin, yPos);
        yPos += 6;
        doc.text(`Fichier : ${analysis.fileName}`, margin, yPos);

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
        doc.text('SCORE GLOBAL', pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;
        doc.setFontSize(36);
        doc.setTextColor(data.score >= 70 ? 34 : (data.score >= 50 ? 234 : 220), data.score >= 70 ? 197 : (data.score >= 50 ? 179 : 8), data.score >= 70 ? 94 : (data.score >= 50 ? 8 : 38));
        doc.text(`${data.score}/100`, pageWidth / 2, yPos, { align: 'center' });

        yPos += 10;
        const barWidth = 120;
        const barX = (pageWidth - barWidth) / 2;
        doc.setFillColor(220, 220, 220);
        doc.rect(barX, yPos, barWidth, 6, 'F');
        doc.setFillColor(30, 58, 138);
        doc.rect(barX, yPos, (barWidth * data.score) / 100, 6, 'F');

        yPos = 180;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSEIL CLE', margin, yPos);
        yPos += 3;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(margin, yPos, margin + 50, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const conseilLines = doc.splitTextToSize(data.conseil_titre || "Aucun conseil.", contentWidth);
        doc.text(conseilLines, margin, yPos);

        doc.addPage();
        yPos = 20;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('JobDiagnose - Analyse Detaillee', margin, 10);
        doc.text('Page 2/2', pageWidth - margin, 10, { align: 'right' });

        yPos = 30;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('POINTS FORTS', margin, yPos);
        yPos += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (data.forces && data.forces.length > 0) {
            data.forces.forEach((force) => {
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

        yPos += 10;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('AXES D\'AMELIORATION', margin, yPos);
        yPos += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (data.faiblesses && data.faiblesses.length > 0) {
            data.faiblesses.forEach((faiblesse) => {
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

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(`JobDiagnose (c) ${new Date().getFullYear()} - Rapport confidentiel`, pageWidth / 2, 290, { align: 'center' });
            doc.text(`Page ${i}/${totalPages}`, pageWidth - margin, 290, { align: 'right' });
        }

        const dateFile = new Date(analysis.$createdAt).toISOString().split('T')[0];
        doc.save(`JobDiagnose_${analysis.fileName.replace('.pdf', '')}_${dateFile}.pdf`);
    };

    const handleLogout = async () => {
        await account.deleteSession('current');
        navigate('/auth');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

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
                        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Déconnexion</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total analyses</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-blue-600 mt-2">CV analysés</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Score moyen</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.moyenne}<span className="text-lg text-gray-400">/100</span></div>
                        <div className="text-xs text-blue-600 mt-2">Sur tous vos CV</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Meilleur score</div>
                        <div className="text-3xl font-bold text-green-600">{stats.meilleure}<span className="text-lg text-gray-400">/100</span></div>
                        <div className="text-xs text-green-600 mt-2">Votre record</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Plan actif</div>
                        <div className="text-2xl font-bold text-gray-900 capitalize">
                            {stats.plan === 'premium' ? '👑 Premium' : (stats.plan === 'essentiel' ? '⭐ Essentiel' : '🆓 Gratuit')}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {stats.plan === 'free' ? '3 analyses offertes' : 'Illimité'}
                        </div>
                    </div>
                </div>

                {/* Évolution des scores */}
                {analyses.length > 1 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Évolution de vos scores</h2>
                        <div className="flex items-end gap-2 h-32">
                            {[...analyses].reverse().map((a, i) => {
                                const height = (a.score / 100) * 100;
                                return (
                                    <div key={a.$id} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setSelectedAnalysis(a)}>
                                        <div className="text-xs font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{a.score}</div>
                                        <div 
                                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-all"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="text-xs text-gray-400">{i + 1}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Survolez les barres pour voir les scores</p>
                    </div>
                )}

                {/* Historique */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">📋 Historique de vos analyses</h2>
                        <p className="text-sm text-gray-500 mt-1">Retrouvez et re-téléchargez tous vos rapports</p>
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
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analyses.map((a) => {
                                        let data;
                                        try {
                                            data = typeof a.extractedData === 'string' ? JSON.parse(a.extractedData) : a.extractedData;
                                        } catch (e) {
                                            data = { score: a.score, forces: [], faiblesses: [], conseil_titre: "" };
                                        }
                                        return (
                                            <tr key={a.$id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-blue-600 text-lg">📄</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{a.fileName}</div>
                                                            <div className="text-xs text-gray-500 truncate max-w-xs">{data.conseil_titre?.substring(0, 50) || "Analyse complète"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(a.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`text-2xl font-bold ${a.score >= 70 ? 'text-green-600' : (a.score >= 50 ? 'text-yellow-600' : 'text-red-600')}`}>
                                                            {a.score}
                                                        </div>
                                                        <div className="text-xs text-gray-400">/100</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button 
                                                            onClick={() => setSelectedAnalysis(a)}
                                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-semibold"
                                                        >
                                                            👁️ Voir
                                                        </button>
                                                        <button 
                                                            onClick={() => exportAnalysisPDF(a)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-semibold"
                                                        >
                                                            📄 PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal détails analyse */}
                {selectedAnalysis && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAnalysis(null)}>
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedAnalysis.fileName}</h2>
                                    <p className="text-sm text-gray-500">{new Date(selectedAnalysis.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <button onClick={() => setSelectedAnalysis(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>

                            {(() => {
                                let data;
                                try {
                                    data = typeof selectedAnalysis.extractedData === 'string' ? JSON.parse(selectedAnalysis.extractedData) : selectedAnalysis.extractedData;
                                } catch (e) {
                                    data = { score: selectedAnalysis.score, forces: [], faiblesses: [], conseil_titre: "Données non disponibles." };
                                }
                                return (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-8 ${data.score >= 70 ? 'border-green-500 text-green-600' : (data.score >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600')}`}>
                                                <div>
                                                    <div className="text-3xl font-bold">{data.score}</div>
                                                    <div className="text-xs">/100</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-xl">
                                            <p className="text-gray-700"><span className="font-bold text-blue-600">Conseil :</span> {data.conseil_titre}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                                <h3 className="font-bold text-green-800 mb-2">✨ Points Forts</h3>
                                                <ul className="space-y-1 text-sm">
                                                    {data.forces?.map((f, i) => <li key={i} className="text-green-900">✓ {f}</li>)}
                                                </ul>
                                            </div>
                                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                                <h3 className="font-bold text-orange-800 mb-2">⚡ Axes d'Amélioration</h3>
                                                <ul className="space-y-1 text-sm">
                                                    {data.faiblesses?.map((f, i) => <li key={i} className="text-orange-900">→ {f}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => exportAnalysisPDF(selectedAnalysis)}
                                                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                                            >
                                                📄 Télécharger le rapport PDF
                                            </button>
                                            <button 
                                                onClick={() => setSelectedAnalysis(null)}
                                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                                            >
                                                Fermer
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}