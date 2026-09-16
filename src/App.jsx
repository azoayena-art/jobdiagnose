import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Auth from './Auth';
import Admin from './Admin';
import Dashboard from './Dashboard';
import Legal from './Legal'; // <-- AJOUTÉ

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/legal" element={<Legal />} /> {/* <-- AJOUTÉ */}
            </Routes>
        </Router>
    );
}

export default App;