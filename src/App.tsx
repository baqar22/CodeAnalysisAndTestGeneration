import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Snapshots from './Snapshots';
import Page2 from './Page2';
import NavBar from './NavBar';
import RefactorHelper from './components/RefactorHelper';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<HomePage />} /> {/* Home Page */}
                <Route path="/snapshots" element={<Snapshots />} /> {/* Page 1 */}
                <Route path="/refactoring" element={<RefactorHelper />} /> {/* Page 2 */}
                <Route path="/refactor-helper" element={<RefactorHelper />} />
            </Routes>
        </Router>
    );
};

export default App;
