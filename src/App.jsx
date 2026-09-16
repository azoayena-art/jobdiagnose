import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Auth from './Auth';
import Admin from './Admin';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

export default App;