import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const GA4_ID = 'G-FDQ202Z97S'; // ⚠️ REMPLACE PAR TON VRAI ID GA4

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'accepted') {
            loadGA4();
        }
    }, []);

    const loadGA4 = () => {
        // Vérifier si le script est déjà chargé pour éviter les doublons
        if (document.getElementById('ga4-script')) return;

        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'ga4-inline';
        inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', {
                page_path: window.location.pathname,
                send_page_view: true
            });
        `;
        document.head.appendChild(inlineScript);
    };

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
        loadGA4();
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-300">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Respect de votre vie privée</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience. 
                        En cliquant sur "Accepter", vous consentez à l'utilisation de Google Analytics conformément à notre 
                        <a href="/legal" className="text-blue-600 hover:underline ml-1">Politique de confidentialité</a>.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={handleDecline}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Refuser
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    );
}