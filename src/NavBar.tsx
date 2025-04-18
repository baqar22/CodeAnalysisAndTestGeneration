// components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-white text-xl font-semibold">Refactoring and Debugging App</h1>
                <div className="space-x-4">
                    <Link to="/" className="text-white hover:text-yellow-300 transition">
                        Home
                    </Link>
                    <Link to="/snapshots" className="text-white hover:text-yellow-300 transition">
                        Snapshots
                    </Link>
                    <Link to="/refactoring" className="text-white hover:text-yellow-300 transition">
                        Refactoring
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
