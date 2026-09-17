import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- CETTE LIGNE EST OBLIGATOIRE POUR TAILWIND

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey="6LdzDcEtAAAAAGBfLYsq09mc7xil1qbDPc_14rNS">
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>,
)